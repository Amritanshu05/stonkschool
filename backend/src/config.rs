use std::env;

/// Which data source powers replay, contests, and leaderboards.
///
/// - `Seed`  : deterministic, repeatable, fully local. Default and most tested path.
/// - `Live`  : attempts Zerodha Kite stream. If tokens are missing or handshake fails,
///   the runtime **falls back to Seed** so the app is never broken by a
///   foreign runtime dependency.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MarketDataMode {
    Seed,
    Live,
}

impl MarketDataMode {
    pub fn as_str(self) -> &'static str {
        match self {
            MarketDataMode::Seed => "seed",
            MarketDataMode::Live => "live",
        }
    }
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub port: u16,
    pub google_oauth: GoogleOAuthConfig,
    #[allow(dead_code)]
    pub session_secret: String,
    pub frontend_url: String,
    pub market_data_mode: MarketDataMode,
    /// Optional — only used when `market_data_mode == Live` AND both values are set.
    pub kite: Option<KiteConfig>,
}

#[derive(Debug, Clone)]
pub struct GoogleOAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_url: String,
}

#[derive(Debug, Clone)]
pub struct KiteConfig {
    pub api_key: String,
    pub access_token: String,
}

impl AppConfig {
    pub fn load() -> anyhow::Result<Self> {
        dotenvy::dotenv().ok();

        let market_data_mode = match env::var("MARKET_DATA_MODE")
            .unwrap_or_else(|_| "seed".to_string())
            .to_ascii_lowercase()
            .as_str()
        {
            "live" => MarketDataMode::Live,
            _ => MarketDataMode::Seed,
        };

        let kite = match (env::var("KITE_API_KEY"), env::var("KITE_ACCESS_TOKEN")) {
            (Ok(k), Ok(t)) if !k.trim().is_empty() && !t.trim().is_empty() => Some(KiteConfig {
                api_key: k,
                access_token: t,
            }),
            _ => None,
        };

        Ok(Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
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
            session_secret: env::var("SESSION_SECRET").expect("SESSION_SECRET must be set"),
            frontend_url: env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            market_data_mode,
            kite,
        })
    }
}
