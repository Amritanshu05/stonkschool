use axum::{
    extract::{Path, State},
    routing::{get, post},
    Router, Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::NaiveDateTime;
use crate::{error::Result, modules::AppState};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/", post(create_replay_session))
        .route("/:replay_id/trade", post(place_demo_trade))
        .with_state(state)
}

#[derive(Debug, Deserialize)]
struct CreateReplayRequest {
    asset_id: Uuid,
    from: String,
    to: String,
}

#[derive(Debug, Serialize)]
struct CreateReplayResponse {
    replay_id: Uuid,
    ws_url: String,
}

#[derive(Debug, Deserialize)]
struct PlaceTradeRequest {
    side: String,
    quantity: f64,
}

async fn create_replay_session(
    State(state): State<AppState>,
    Json(payload): Json<CreateReplayRequest>,
) -> Result<Json<CreateReplayResponse>> {
    let user_id = Uuid::new_v4(); // TODO: Get from session
    
    let from = chrono::NaiveDateTime::parse_from_str(&payload.from, "%Y-%m-%dT%H:%M:%SZ")
        .map_err(|_| crate::error::AppError::Validation("Invalid from timestamp".to_string()))?;
    
    let to = chrono::NaiveDateTime::parse_from_str(&payload.to, "%Y-%m-%dT%H:%M:%SZ")
        .map_err(|_| crate::error::AppError::Validation("Invalid to timestamp".to_string()))?;
    
    let replay_id = Uuid::new_v4();
    
    sqlx::query(
        "INSERT INTO replay_sessions (id, user_id, asset_id, start_time, end_time, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())"
    )
    .bind(replay_id)
    .bind(user_id)
    .bind(payload.asset_id)
    .bind(from)
    .bind(to)
    .execute(&state.db.pool)
    .await?;
    
    Ok(Json(CreateReplayResponse {
        replay_id,
        ws_url: format!("/ws/replay/{}", replay_id),
    }))
}

async fn place_demo_trade(
    State(state): State<AppState>,
    Path(replay_id): Path<Uuid>,
    Json(payload): Json<PlaceTradeRequest>,
) -> Result<Json<serde_json::Value>> {
    // Validate side
    if payload.side != "buy" && payload.side != "sell" {
        return Err(crate::error::AppError::Validation("Side must be 'buy' or 'sell'".to_string()));
    }
    
    // TODO: Get current price from replay state
    let current_price = rust_decimal::Decimal::new(42000, 2); // Placeholder
    
    sqlx::query(
        "INSERT INTO replay_trades (replay_id, side, price, quantity, timestamp)
         VALUES ($1, $2, $3, $4, NOW())"
    )
    .bind(replay_id)
    .bind(&payload.side)
    .bind(current_price)
    .bind(rust_decimal::Decimal::from_f64_retain(payload.quantity).unwrap())
    .execute(&state.db.pool)
    .await?;
    
    Ok(Json(serde_json::json!({ "success": true })))
}
