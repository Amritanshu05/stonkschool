use axum::{
    extract::{Path, State},
    routing::post,
    Router, Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::{error::Result, middleware::SessionUser, modules::AppState};

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
    price: Option<f64>,
}

async fn create_replay_session(
    State(state): State<AppState>,
    session: SessionUser,
    Json(payload): Json<CreateReplayRequest>,
) -> Result<Json<CreateReplayResponse>> {
    let from = chrono::DateTime::parse_from_rfc3339(&payload.from)
        .map_err(|_| crate::error::AppError::Validation("Invalid from timestamp".to_string()))?
        .naive_utc();

    let to = chrono::DateTime::parse_from_rfc3339(&payload.to)
        .map_err(|_| crate::error::AppError::Validation("Invalid to timestamp".to_string()))?
        .naive_utc();

    let replay_id = Uuid::new_v4();

    sqlx::query(
        "INSERT INTO replay_sessions (id, user_id, asset_id, start_time, end_time, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())",
    )
    .bind(replay_id)
    .bind(session.user_id)
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
    _session: SessionUser,
    Path(replay_id): Path<Uuid>,
    Json(payload): Json<PlaceTradeRequest>,
) -> Result<Json<serde_json::Value>> {
    if payload.side != "buy" && payload.side != "sell" {
        return Err(crate::error::AppError::Validation(
            "Side must be 'buy' or 'sell'".to_string(),
        ));
    }

    // Fetch the latest price tick for this replay session
    #[derive(sqlx::FromRow)]
    struct ReplaySession {
        asset_id: Uuid,
    }

    let rs = sqlx::query_as::<_, ReplaySession>(
        "SELECT asset_id FROM replay_sessions WHERE id = $1",
    )
    .bind(replay_id)
    .fetch_optional(&state.db.pool)
    .await?
    .ok_or(crate::error::AppError::NotFound)?;

    let current_price = match payload.price {
        Some(p) => rust_decimal::Decimal::from_f64_retain(p).unwrap_or_else(|| rust_decimal::Decimal::new(42000, 2)),
        None => {
            // Get latest price from market_prices for this asset
            let price_row: Option<rust_decimal::Decimal> = sqlx::query_scalar(
                "SELECT close FROM market_prices WHERE asset_id = $1 ORDER BY timestamp DESC LIMIT 1",
            )
            .bind(rs.asset_id)
            .fetch_optional(&state.db.pool)
            .await?;
            price_row.unwrap_or_else(|| rust_decimal::Decimal::new(42000, 2))
        }
    };

    sqlx::query(
        "INSERT INTO replay_trades (replay_id, side, price, quantity, timestamp)
         VALUES ($1, $2, $3, $4, NOW())",
    )
    .bind(replay_id)
    .bind(&payload.side)
    .bind(current_price)
    .bind(rust_decimal::Decimal::from_f64_retain(payload.quantity).unwrap())
    .execute(&state.db.pool)
    .await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "price": current_price,
        "side": payload.side,
        "quantity": payload.quantity,
    })))
}
