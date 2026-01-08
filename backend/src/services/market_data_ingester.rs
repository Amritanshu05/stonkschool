use std::collections::HashMap;
use tokio::sync::RwLock;
use std::sync::Arc;
use futures_util::StreamExt;
use zerodha_tl::{KiteConnect, config::StreamConfig, models::{Mode, Tick}};
use sqlx::PgPool;
use chrono::Utc;
use rust_decimal::Decimal;
use uuid::Uuid;
use anyhow::Result;

/// Market data ingestion service using zerodha-ss
pub struct MarketDataIngester {
    pool: PgPool,
    api_key: String,
    access_token: String,
    asset_tokens: Arc<RwLock<HashMap<u32, Uuid>>>, // Maps instrument token to asset_id
}

impl MarketDataIngester {
    pub fn new(pool: PgPool, api_key: String, access_token: String) -> Self {
        Self {
            pool,
            api_key,
            access_token,
            asset_tokens: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    /// Load asset mappings from database
    pub async fn load_asset_mappings(&self) -> Result<()> {
        let assets = sqlx::query!(
            r#"
            SELECT id, symbol, exchange 
            FROM assets 
            WHERE is_active = true AND asset_type IN ('crypto', 'equity')
            "#
        )
        .fetch_all(&self.pool)
        .await?;
        
        let mut mappings = self.asset_tokens.write().await;
        
        for asset in assets {
            // Map known instruments (this should be configured properly)
            // Example: BTC -> 256265 (instrument token for example)
            // This mapping should come from a config or database
            let instrument_token = match asset.symbol.as_str() {
                "NIFTY50" => 256265,
                "INFY" => 408065,
                // Add more mappings as needed
                _ => continue,
            };
            
            mappings.insert(instrument_token, asset.id);
        }
        
        tracing::info!("Loaded {} asset mappings", mappings.len());
        Ok(())
    }
    
    /// Start streaming live market data
    pub async fn start_streaming(&self, instruments: Vec<u32>) -> Result<()> {
        tracing::info!("Starting market data stream for {} instruments", instruments.len());
        
        let kite = KiteConnect::new(self.api_key.clone(), self.access_token.clone());
        let config = StreamConfig::new(instruments).mode(Mode::Full);
        
        let mut stream = kite.stream(config).await?;
        
        tracing::info!("Connected to Kite WebSocket");
        
        while let Some(tick) = stream.next().await {
            if let Err(e) = self.process_tick(tick).await {
                tracing::error!("Failed to process tick: {}", e);
            }
        }
        
        tracing::warn!("Market data stream ended");
        Ok(())
    }
    
    /// Process a single tick and store in database
    async fn process_tick(&self, tick: Tick) -> Result<()> {
        let mappings = self.asset_tokens.read().await;
        let asset_id = match mappings.get(&tick.instrument_token) {
            Some(id) => *id,
            None => {
                tracing::warn!("Unknown instrument token: {}", tick.instrument_token);
                return Ok(());
            }
        };
        
        let timestamp = Utc::now().naive_utc();
        
        // Store OHLC data (for simplicity, using current price for all)
        // In production, you'd aggregate ticks into candles
        let price = Decimal::from_f64_retain(tick.ltp).unwrap_or_default();
        
        sqlx::query!(
            r#"
            INSERT INTO market_prices (asset_id, timestamp, open, high, low, close, volume)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (asset_id, timestamp) 
            DO UPDATE SET 
                high = GREATEST(market_prices.high, EXCLUDED.high),
                low = LEAST(market_prices.low, EXCLUDED.low),
                close = EXCLUDED.close
            "#,
            asset_id,
            timestamp,
            price,
            price,
            price,
            price,
            tick.volume.map(|v| Decimal::from(v))
        )
        .execute(&self.pool)
        .await?;
        
        tracing::debug!(
            "Stored price for instrument {}: {} @ {}",
            tick.instrument_token,
            tick.ltp,
            timestamp
        );
        
        Ok(())
    }
}

/// Run market data ingestion as a background service
pub async fn run_market_data_service(
    pool: PgPool,
    api_key: String,
    access_token: String,
) -> Result<()> {
    let ingester = MarketDataIngester::new(pool, api_key, access_token);
    
    // Load asset mappings
    ingester.load_asset_mappings().await?;
    
    // Define instruments to track (this should come from config)
    let instruments = vec![
        256265,  // Example: Nifty 50
        408065,  // Example: Infosys
        // Add more instruments
    ];
    
    // Start streaming (this runs forever)
    ingester.start_streaming(instruments).await?;
    
    Ok(())
}
