use serde::Deserialize;
use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub port: u16,
    pub google_oauth: GoogleOAuthConfig,
    pub session_secret: String,
    pub frontend_url: String,
}

#[derive(Debug, Clone)]
pub struct GoogleOAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_url: String,
}

impl AppConfig {
    pub fn load() -> anyhow::Result<Self> {
        dotenvy::dotenv().ok();

        Ok(Self {
            database_url: env::var("DATABASE_URL")
                .expect("DATABASE_URL must be set"),
            port: env::var("PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()?,
            google_oauth: GoogleOAuthConfig {
                client_id: env::var("GOOGLE_CLIENT_ID")
                    .expect("GOOGLE_CLIENT_ID must be set"),
                client_secret: env::var("GOOGLE_CLIENT_SECRET")
                    .expect("GOOGLE_CLIENT_SECRET must be set"),
                redirect_url: env::var("GOOGLE_REDIRECT_URL")
                    .expect("GOOGLE_REDIRECT_URL must be set"),
            },
            session_secret: env::var("SESSION_SECRET")
                .expect("SESSION_SECRET must be set"),
            frontend_url: env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
        })
    }
}
