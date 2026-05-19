use axum::{
    extract::State,
    routing::get,
    Router, Json,
};
use serde::Serialize;
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::NaiveDateTime;
use crate::{error::Result, middleware::SessionUser, modules::AppState};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/me", get(get_current_user))
        .route("/me/contests", get(get_my_contests))
        .with_state(state)
}

#[derive(Debug, Serialize)]
struct UserResponse {
    id: Uuid,
    email: String,
    display_name: String,
    wallet_balance: Decimal,
    stats: UserStats,
}

#[derive(Debug, Serialize)]
struct UserStats {
    contests_played: i32,
    contests_won: i32,
}

async fn get_current_user(
    State(state): State<AppState>,
    session: SessionUser,
) -> Result<Json<UserResponse>> {
    #[derive(sqlx::FromRow)]
    struct UserData {
        id: Uuid,
        email: String,
        display_name: String,
        total_contests: i32,
        contests_won: i32,
        wallet_balance: Decimal,
    }

    let user_data = sqlx::query_as::<_, UserData>(
        r#"
        SELECT
            u.id,
            u.email,
            up.display_name,
            up.total_contests,
            up.contests_won,
            w.balance as wallet_balance
        FROM users u
        INNER JOIN user_profiles up ON u.id = up.user_id
        INNER JOIN wallets w ON u.id = w.user_id
        WHERE u.id = $1
        "#,
    )
    .bind(session.user_id)
    .fetch_one(&state.db.pool)
    .await?;

    Ok(Json(UserResponse {
        id: user_data.id,
        email: user_data.email,
        display_name: user_data.display_name,
        wallet_balance: user_data.wallet_balance,
        stats: UserStats {
            contests_played: user_data.total_contests,
            contests_won: user_data.contests_won,
        },
    }))
}

#[derive(Debug, Serialize, sqlx::FromRow)]
struct MyContestRow {
    contest_id: Uuid,
    title: String,
    track: String,
    status: String,
    start_time: NaiveDateTime,
    end_time: NaiveDateTime,
    locked_at: Option<NaiveDateTime>,
    current_rank: Option<i32>,
    portfolio_value: Option<Decimal>,
}

/// Contests the current user has joined. Read-only projection over
/// `contest_participants` + `contests` + `contest_leaderboard`. No new feature,
/// just a per-user view of data already produced by the existing engine.
async fn get_my_contests(
    State(state): State<AppState>,
    session: SessionUser,
) -> Result<Json<Vec<MyContestRow>>> {
    let rows = sqlx::query_as::<_, MyContestRow>(
        r#"
        SELECT
            c.id           AS contest_id,
            c.title,
            c.track,
            c.status,
            c.start_time,
            c.end_time,
            cp.locked_at,
            cl.rank        AS current_rank,
            cl.portfolio_value
        FROM contest_participants cp
        INNER JOIN contests c ON c.id = cp.contest_id
        LEFT JOIN contest_leaderboard cl
               ON cl.contest_id = c.id AND cl.user_id = cp.user_id
        WHERE cp.user_id = $1
        ORDER BY c.start_time DESC
        LIMIT 50
        "#,
    )
    .bind(session.user_id)
    .fetch_all(&state.db.pool)
    .await?;

    Ok(Json(rows))
}
