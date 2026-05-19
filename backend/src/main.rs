use axum::{routing::get, Router};
use std::net::SocketAddr;
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod error;
mod middleware;
mod modules;
mod services;

use config::AppConfig;
use db::Database;
use services::{market_data, seeder, ContestExecutor};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "stonkschool_backend=info,tower_http=info,axum=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting StonkSchool Backend...");

    // 1. Config
    let config = AppConfig::load()?;
    tracing::info!(
        "Config loaded (market_data_mode = {})",
        config.market_data_mode.as_str()
    );

    // 2. Database + migrations
    let database = Database::new(&config.database_url).await?;
    tracing::info!("Database connected and migrations applied");

    // 3. Auto-seed the DB (idempotent, self-healing)
    seeder::bootstrap(&database.pool).await?;
    tracing::info!("DB bootstrap complete (assets, history, contests present)");

    // 4. Pick market-data provider (seed by default, live if Kite creds present)
    let (provider, effective_mode) = market_data::build(database.pool.clone(), &config);
    tracing::info!(
        "Market-data provider: {} (effective mode = {})",
        provider.label(),
        effective_mode.as_str()
    );
    provider.start().await?;

    // 5. Contest executor — drives state transitions, leaderboard, settlement
    let executor = ContestExecutor::new(database.pool.clone());
    tokio::spawn(executor.run());
    tracing::info!("Contest executor spawned");

    // 6. HTTP + WebSocket server
    let app = build_router(database, config.clone());
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn build_router(database: Database, config: AppConfig) -> Router {
    let app_state = modules::AppState::new(database, config);

    Router::new()
        .route("/health", get(health_check))
        .nest("/api/v1", api_v1_routes(app_state.clone()))
        .nest("/ws", websocket_routes(app_state.clone()))
        .layer(CompressionLayer::new())
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
}

fn api_v1_routes(state: modules::AppState) -> Router {
    Router::new()
        .nest("/auth", modules::auth::routes(state.clone()))
        .nest("/users", modules::users::routes(state.clone()))
        .nest("/wallet", modules::wallet::routes(state.clone()))
        .nest("/assets", modules::assets::routes(state.clone()))
        .nest("/market-data", modules::market_data::routes(state.clone()))
        .nest("/replay", modules::replay::routes(state.clone()))
        .nest("/contests", modules::contests::routes(state.clone()))
}

fn websocket_routes(state: modules::AppState) -> Router {
    Router::new()
        .route("/replay/:replay_id", get(modules::websocket::replay_handler))
        .route("/contest/:contest_id", get(modules::websocket::contest_handler))
        .with_state(state)
}

async fn health_check() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "service": "stonkschool-backend"
    }))
}
