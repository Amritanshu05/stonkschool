use axum::{
    extract::{Path, State},
    routing::get,
    Router, Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;
use crate::{error::Result, modules::AppState};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/me", get(get_current_user))
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

// Get current authenticated user
async fn get_current_user(
    State(state): State<AppState>,
    // TODO: Extract user from session
) -> Result<Json<UserResponse>> {
    // TODO: Get user_id from session
    let user_id = Uuid::new_v4(); // Placeholder
    
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
        "#
    )
    .bind(user_id)
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
