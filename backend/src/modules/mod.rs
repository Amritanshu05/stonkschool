pub mod auth;
pub mod users;
pub mod wallet;
pub mod assets;
pub mod market_data;
pub mod replay;
pub mod contests;
pub mod websocket;

use crate::{config::AppConfig, db::Database};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub config: Arc<AppConfig>,
}

impl AppState {
    pub fn new(db: Database, config: AppConfig) -> Self {
        Self {
            db,
            config: Arc::new(config),
        }
    }
}
