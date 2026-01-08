use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::{
    cors::CorsLayer,
    trace::TraceLayer,
    compression::CompressionLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod error;
mod modules;
mod services;

use config::AppConfig;
use db::Database;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "stonkschool_backend=debug,tower_http=debug,axum=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting StonkSchool Backend...");

    // Load configuration
    let config = AppConfig::load()?;
    tracing::info!("Configuration loaded");

    // Initialize database
    let database = Database::new(&config.database_url).await?;
    tracing::info!("Database connected and migrations applied");

    // Build application router
    let app = build_router(database, config.clone());

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn build_router(database: Database, config: AppConfig) -> Router {
    // Create shared application state
    let app_state = modules::AppState::new(database, config);

    Router::new()
        // Health check
        .route("/health", get(health_check))
        
        // API v1 routes
        .nest("/api/v1", api_v1_routes(app_state.clone()))
        
        // WebSocket routes
        .nest("/ws", websocket_routes(app_state.clone()))
        
        // Middleware
        .layer(CompressionLayer::new())
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
}

fn api_v1_routes(state: modules::AppState) -> Router {
    Router::new()
        // Authentication routes
        .nest("/auth", modules::auth::routes(state.clone()))
        
        // User routes
        .nest("/users", modules::users::routes(state.clone()))
        
        // Wallet routes
        .nest("/wallet", modules::wallet::routes(state.clone()))
        
        // Asset & market data routes
        .nest("/assets", modules::assets::routes(state.clone()))
        .nest("/market-data", modules::market_data::routes(state.clone()))
        
        // Replay routes
        .nest("/replay", modules::replay::routes(state.clone()))
        
        // Contest routes
        .nest("/contests", modules::contests::routes(state.clone()))
}

fn websocket_routes(state: modules::AppState) -> Router {
    Router::new()
        .route("/replay/:replay_id", get(modules::websocket::replay_handler))
        .route("/contest/:contest_id", get(modules::websocket::contest_handler))
        .with_state(state)
}

async fn health_check() -> &'static str {
    "OK"
}
