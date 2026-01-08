use axum::{
    extract::{Query, State},
    routing::get,
    Router, Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::{error::Result, modules::AppState};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/", get(list_assets))
        .with_state(state)
}

#[derive(Debug, Serialize)]
struct AssetResponse {
    id: Uuid,
    symbol: String,
    name: String,
    r#type: String,
}

#[derive(Debug, Deserialize)]
struct AssetsQuery {
    r#type: Option<String>,
}

async fn list_assets(
    State(state): State<AppState>,
    Query(params): Query<AssetsQuery>,
) -> Result<Json<Vec<AssetResponse>>> {
    let assets = if let Some(asset_type) = params.r#type {
        sqlx::query_as!(
            AssetResponse,
            r#"SELECT id, symbol, name, asset_type as "type" 
               FROM assets 
               WHERE is_active = true AND asset_type = $1
               ORDER BY symbol"#,
            asset_type
        )
        .fetch_all(&state.db.pool)
        .await?
    } else {
        sqlx::query_as!(
            AssetResponse,
            r#"SELECT id, symbol, name, asset_type as "type" 
               FROM assets 
               WHERE is_active = true
               ORDER BY symbol"#
        )
        .fetch_all(&state.db.pool)
        .await?
    };
    
    Ok(Json(assets))
}
