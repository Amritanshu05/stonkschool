use axum::{
    extract::{Path, State},
    routing::{get, post},
    Router, Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::NaiveDateTime;
use crate::{error::{AppError, Result}, modules::AppState};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/", get(list_contests))
        .route("/:contest_id", get(get_contest_details))
        .route("/:contest_id/join", post(join_contest))
        .route("/:contest_id/allocate", post(lock_allocation))
        .route("/:contest_id/status", get(get_contest_status))
        .route("/:contest_id/results", get(get_contest_results))
        .route("/:contest_id/leaderboard", get(get_leaderboard))
        .with_state(state)
}

#[derive(Debug, Serialize)]
struct ContestListItem {
    id: Uuid,
    title: String,
    track: String,
    entry_fee: Decimal,
    start_time: NaiveDateTime,
    status: String,
}

#[derive(Debug, Serialize)]
struct ContestDetails {
    id: Uuid,
    title: String,
    track: String,
    entry_fee: Decimal,
    virtual_capital: Decimal,
    start_time: NaiveDateTime,
    end_time: NaiveDateTime,
    status: String,
    assets: Vec<AssetInfo>,
}

#[derive(Debug, Serialize)]
struct AssetInfo {
    id: Uuid,
    symbol: String,
}

#[derive(Debug, Serialize)]
struct JoinContestResponse {
    participant_id: Uuid,
    virtual_capital: Decimal,
}

#[derive(Debug, Deserialize)]
struct AllocationRequest {
    allocations: Vec<AllocationItem>,
}

#[derive(Debug, Deserialize)]
struct AllocationItem {
    asset_id: Uuid,
    pct: Decimal,
}

#[derive(Debug, Serialize)]
struct ContestStatusResponse {
    status: String,
    current_rank: Option<i32>,
    portfolio_value: Option<Decimal>,
}

#[derive(Debug, Serialize)]
struct ContestResultsResponse {
    rank: i32,
    final_value: Decimal,
    payout: Option<Decimal>,
}

#[derive(Debug, Serialize)]
struct LeaderboardEntry {
    rank: i32,
    user: String,
    value: Decimal,
}

async fn list_contests(
    State(state): State<AppState>,
) -> Result<Json<Vec<ContestListItem>>> {
    let contests = sqlx::query_as!(
        ContestListItem,
        r#"
        SELECT id, title, track, entry_fee, start_time, status
        FROM contests
        WHERE status IN ('upcoming', 'joining_open', 'allocation_locked', 'live')
        ORDER BY start_time ASC
        "#
    )
    .fetch_all(&state.db.pool)
    .await?;
    
    Ok(Json(contests))
}

async fn get_contest_details(
    State(state): State<AppState>,
    Path(contest_id): Path<Uuid>,
) -> Result<Json<ContestDetails>> {
    let contest = sqlx::query!(
        r#"
        SELECT id, title, track, entry_fee, virtual_capital, start_time, end_time, status
        FROM contests
        WHERE id = $1
        "#,
        contest_id
    )
    .fetch_optional(&state.db.pool)
    .await?
    .ok_or(AppError::NotFound)?;
    
    let assets = sqlx::query_as!(
        AssetInfo,
        r#"
        SELECT a.id, a.symbol
        FROM assets a
        INNER JOIN contest_assets ca ON a.id = ca.asset_id
        WHERE ca.contest_id = $1
        "#,
        contest_id
    )
    .fetch_all(&state.db.pool)
    .await?;
    
    Ok(Json(ContestDetails {
        id: contest.id,
        title: contest.title,
        track: contest.track,
        entry_fee: contest.entry_fee,
        virtual_capital: contest.virtual_capital,
        start_time: contest.start_time,
        end_time: contest.end_time,
        status: contest.status,
        assets,
    }))
}

async fn join_contest(
    State(state): State<AppState>,
    Path(contest_id): Path<Uuid>,
) -> Result<Json<JoinContestResponse>> {
    let user_id = Uuid::new_v4(); // TODO: Get from session
    
    // Get contest details
    let contest = sqlx::query!(
        "SELECT entry_fee, virtual_capital, status FROM contests WHERE id = $1",
        contest_id
    )
    .fetch_optional(&state.db.pool)
    .await?
    .ok_or(AppError::NotFound)?;
    
    // Check contest status
    if contest.status != "joining_open" {
        return Err(AppError::Conflict("Contest is not open for joining".to_string()));
    }
    
    // Check user balance
    let wallet = sqlx::query!(
        "SELECT id, balance FROM wallets WHERE user_id = $1",
        user_id
    )
    .fetch_one(&state.db.pool)
    .await?;
    
    if wallet.balance < contest.entry_fee {
        return Err(AppError::PaymentRequired("Insufficient balance".to_string()));
    }
    
    // Debit entry fee
    sqlx::query!(
        "UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2",
        contest.entry_fee,
        wallet.id
    )
    .execute(&state.db.pool)
    .await?;
    
    // Record transaction
    sqlx::query!(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reference_id, created_at)
         VALUES ($1, $2, 'entry_fee', $3, NOW())",
        wallet.id,
        -contest.entry_fee,
        contest_id
    )
    .execute(&state.db.pool)
    .await?;
    
    // Create participant record
    let participant_id = Uuid::new_v4();
    
    sqlx::query!(
        "INSERT INTO contest_participants (id, contest_id, user_id, joined_at)
         VALUES ($1, $2, $3, NOW())",
        participant_id,
        contest_id,
        user_id
    )
    .execute(&state.db.pool)
    .await?;
    
    Ok(Json(JoinContestResponse {
        participant_id,
        virtual_capital: contest.virtual_capital,
    }))
}

async fn lock_allocation(
    State(state): State<AppState>,
    Path(contest_id): Path<Uuid>,
    Json(payload): Json<AllocationRequest>,
) -> Result<Json<serde_json::Value>> {
    let user_id = Uuid::new_v4(); // TODO: Get from session
    
    // Validate allocation sum equals 100
    let total: Decimal = payload.allocations.iter().map(|a| a.pct).sum();
    if total != Decimal::new(100, 0) {
        return Err(AppError::Validation("Allocation percentages must sum to 100".to_string()));
    }
    
    // Get participant
    let participant = sqlx::query!(
        r#"
        SELECT cp.id, cp.locked_at, c.status
        FROM contest_participants cp
        INNER JOIN contests c ON cp.contest_id = c.id
        WHERE cp.contest_id = $1 AND cp.user_id = $2
        "#,
        contest_id,
        user_id
    )
    .fetch_optional(&state.db.pool)
    .await?
    .ok_or(AppError::NotFound)?;
    
    // Check if already locked
    if participant.locked_at.is_some() {
        return Err(AppError::Conflict("Allocation already locked".to_string()));
    }
    
    // Check contest status
    if participant.status == "live" || participant.status == "ended" {
        return Err(AppError::Forbidden("Contest has already started".to_string()));
    }
    
    // Insert allocations
    for allocation in payload.allocations {
        sqlx::query!(
            "INSERT INTO contest_allocations (participant_id, asset_id, allocation_pct)
             VALUES ($1, $2, $3)",
            participant.id,
            allocation.asset_id,
            allocation.pct
        )
        .execute(&state.db.pool)
        .await?;
    }
    
    // Mark as locked
    sqlx::query!(
        "UPDATE contest_participants SET locked_at = NOW() WHERE id = $1",
        participant.id
    )
    .execute(&state.db.pool)
    .await?;
    
    Ok(Json(serde_json::json!({ "locked": true })))
}

async fn get_contest_status(
    State(state): State<AppState>,
    Path(contest_id): Path<Uuid>,
) -> Result<Json<ContestStatusResponse>> {
    let user_id = Uuid::new_v4(); // TODO: Get from session
    
    let result = sqlx::query!(
        r#"
        SELECT 
            c.status,
            cl.rank as current_rank,
            cl.portfolio_value
        FROM contests c
        LEFT JOIN contest_leaderboard cl ON c.id = cl.contest_id AND cl.user_id = $2
        WHERE c.id = $1
        "#,
        contest_id,
        user_id
    )
    .fetch_optional(&state.db.pool)
    .await?
    .ok_or(AppError::NotFound)?;
    
    Ok(Json(ContestStatusResponse {
        status: result.status,
        current_rank: result.current_rank,
        portfolio_value: result.portfolio_value,
    }))
}

async fn get_contest_results(
    State(state): State<AppState>,
    Path(contest_id): Path<Uuid>,
) -> Result<Json<ContestResultsResponse>> {
    let user_id = Uuid::new_v4(); // TODO: Get from session
    
    let result = sqlx::query!(
        r#"
        SELECT final_rank, final_value, payout
        FROM contest_participants
        WHERE contest_id = $1 AND user_id = $2
        "#,
        contest_id,
        user_id
    )
    .fetch_optional(&state.db.pool)
    .await?
    .ok_or(AppError::NotFound)?;
    
    Ok(Json(ContestResultsResponse {
        rank: result.final_rank.ok_or(AppError::Conflict("Contest not yet settled".to_string()))?,
        final_value: result.final_value.ok_or(AppError::Conflict("Contest not yet settled".to_string()))?,
        payout: result.payout,
    }))
}

async fn get_leaderboard(
    State(state): State<AppState>,
    Path(contest_id): Path<Uuid>,
) -> Result<Json<Vec<LeaderboardEntry>>> {
    let entries = sqlx::query!(
        r#"
        SELECT 
            cl.rank,
            up.display_name as user,
            cl.portfolio_value as value
        FROM contest_leaderboard cl
        INNER JOIN users u ON cl.user_id = u.id
        INNER JOIN user_profiles up ON u.id = up.user_id
        WHERE cl.contest_id = $1
        ORDER BY cl.rank ASC
        LIMIT 100
        "#,
        contest_id
    )
    .fetch_all(&state.db.pool)
    .await?;
    
    Ok(Json(
        entries
            .into_iter()
            .map(|e| LeaderboardEntry {
                rank: e.rank,
                user: e.user,
                value: e.value,
            })
            .collect(),
    ))
}
