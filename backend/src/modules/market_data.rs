use axum::{
    extract::{Path, Query, State},
    routing::get,
    Router, Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::NaiveDateTime;
use crate::{error::{AppError, Result}, modules::AppState};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/:asset_id", get(get_historical_prices))
        .with_state(state)
}

#[derive(Debug, Serialize)]
struct PriceCandle {
    timestamp: NaiveDateTime,
    open: Decimal,
    high: Decimal,
    low: Decimal,
    close: Decimal,
}

#[derive(Debug, Deserialize)]
struct PriceQuery {
    from: String,
    to: String,
}

async fn get_historical_prices(
    State(state): State<AppState>,
    Path(asset_id): Path<Uuid>,
    Query(params): Query<PriceQuery>,
) -> Result<Json<Vec<PriceCandle>>> {
    // Parse timestamps
    let from = chrono::NaiveDateTime::parse_from_str(&params.from, "%Y-%m-%dT%H:%M:%S%.fZ")
        .or_else(|_| chrono::NaiveDateTime::parse_from_str(&params.from, "%Y-%m-%dT%H:%M:%SZ"))
        .map_err(|_| AppError::Validation("Invalid 'from' timestamp format".to_string()))?;
    
    let to = chrono::NaiveDateTime::parse_from_str(&params.to, "%Y-%m-%dT%H:%M:%S%.fZ")
        .or_else(|_| chrono::NaiveDateTime::parse_from_str(&params.to, "%Y-%m-%dT%H:%M:%SZ"))
        .map_err(|_| AppError::Validation("Invalid 'to' timestamp format".to_string()))?;
    
    let prices = sqlx::query_as!(
        PriceCandle,
        r#"
        SELECT timestamp, open, high, low, close
        FROM market_prices
        WHERE asset_id = $1 AND timestamp BETWEEN $2 AND $3
        ORDER BY timestamp ASC
        "#,
        asset_id,
        from,
        to
    )
    .fetch_all(&state.db.pool)
    .await?;
    
    if prices.is_empty() {
        return Err(AppError::NotFound);
    }
    
    Ok(Json(prices))
}
