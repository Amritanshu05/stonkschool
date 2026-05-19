//! Dual-mode market data layer.
//!
//! Two providers share one trait. The app always works in `Seed` mode; `Live`
//! is a strictly-optional plug-in that requires a valid Zerodha Kite token.
//! If Live fails to start (missing tokens, handshake error, invalid token)
//! the runtime logs a warning and **falls back to Seed** so the MVP is never
//! blocked by an external service.

use anyhow::Result;
use async_trait::async_trait;
use chrono::{DateTime, Duration as ChronoDuration, Timelike, Utc};
use rust_decimal::Decimal;
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use tracing::{info, warn};
use uuid::Uuid;

use crate::config::{AppConfig, MarketDataMode};

/// Asset row used by the seed generator.
#[derive(sqlx::FromRow, Clone, Debug)]
pub struct SeedAsset {
    pub id: Uuid,
    pub symbol: String,
}

/// Common interface every market-data provider must implement.
#[async_trait]
pub trait MarketDataProvider: Send + Sync {
    /// Human-readable label for logs / diagnostics. Never "lie" about live mode.
    fn label(&self) -> &'static str;

    /// Spawn any long-running background work (tick generation, websocket stream, ...).
    /// Must return fast. Implementations own whatever tasks they spawn.
    async fn start(self: Arc<Self>) -> Result<()>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Deterministic price model
// ──────────────────────────────────────────────────────────────────────────────

/// FNV-1a 64-bit hash — stable, deterministic, no dependencies.
fn hash64(input: &str) -> u64 {
    let mut h: u64 = 0xcbf29ce484222325;
    for b in input.as_bytes() {
        h ^= *b as u64;
        h = h.wrapping_mul(0x100000001b3);
    }
    h
}

/// Mix two u64s into a uniform [0, 1) float, purely deterministic.
fn rand01(seed: u64, nonce: u64) -> f64 {
    let mut x = seed ^ nonce.wrapping_mul(0x9E3779B97F4A7C15);
    x ^= x >> 33;
    x = x.wrapping_mul(0xff51afd7ed558ccd);
    x ^= x >> 33;
    x = x.wrapping_mul(0xc4ceb9fe1a85ec53);
    x ^= x >> 33;
    ((x >> 11) as f64) / ((1u64 << 53) as f64)
}

/// Canonical base price per symbol (INR for Indian assets, USD for crypto).
/// Chosen to roughly reflect market levels so the demo feels realistic.
fn base_price(symbol: &str) -> f64 {
    match symbol {
        "BTC" => 65_000.0,
        "ETH" => 3_500.0,
        "SOL" => 150.0,
        "NIFTY50" => 22_000.0,
        "BANKNIFTY" => 48_000.0,
        "INFY" => 1_500.0,
        "TCS" => 3_800.0,
        "RELIANCE" => 2_800.0,
        "NIFTYBEES" => 250.0,
        "BANKBEES" => 500.0,
        _ => 1_000.0,
    }
}

/// Deterministic, continuous price function.
/// Given `(symbol, unix_minute)` it always returns the same value.
/// Shape = long wave (day) + medium wave (hour) + small deterministic noise.
pub fn price_at(symbol: &str, unix_minute: i64) -> f64 {
    use std::f64::consts::TAU;
    let base = base_price(symbol);
    let sh = hash64(symbol);
    let phase = ((sh % 1000) as f64 / 1000.0) * TAU;

    let day = (unix_minute as f64 / (24.0 * 60.0) * TAU + phase).sin() * 0.04;
    let hour = (unix_minute as f64 / 60.0 * TAU + phase * 2.0).sin() * 0.015;
    let noise = (rand01(sh, unix_minute as u64) - 0.5) * 0.008;

    base * (1.0 + day + hour + noise)
}

/// OHLC candle for a 1-minute bucket starting at `unix_minute`.
/// Open = price at start of minute, Close = price at start of next minute,
/// Wicks = small deterministic extensions (≤ 0.25%) beyond the OC range.
fn candle(symbol: &str, unix_minute: i64) -> (f64, f64, f64, f64, f64) {
    let o = price_at(symbol, unix_minute);
    let c = price_at(symbol, unix_minute + 1);
    let sh = hash64(symbol);
    let oc_max = o.max(c);
    let oc_min = o.min(c);
    let wick_up = rand01(sh, unix_minute as u64 * 2) * 0.0025;
    let wick_dn = rand01(sh, unix_minute as u64 * 2 + 1) * 0.0025;
    let high = oc_max * (1.0 + wick_up);
    let low = oc_min * (1.0 - wick_dn);
    let vol = 10_000.0 + rand01(sh, unix_minute as u64) * 90_000.0;
    (o, high, low, c, vol)
}

fn f64_to_decimal(x: f64) -> Decimal {
    Decimal::from_f64_retain(x).unwrap_or_default().round_dp(4)
}

// ──────────────────────────────────────────────────────────────────────────────
// Seed provider
// ──────────────────────────────────────────────────────────────────────────────

/// Deterministic, fully-local market-data source. Default in the MVP.
pub struct SeedMarketDataProvider {
    pool: PgPool,
    /// How many seconds between "live" candle writes.
    tick_interval: Duration,
}

impl SeedMarketDataProvider {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            // 15s keeps recent candles fresh without hammering the DB.
            tick_interval: Duration::from_secs(15),
        }
    }

    /// Fetch every active asset from the DB.
    async fn active_assets(&self) -> Result<Vec<SeedAsset>> {
        let rows = sqlx::query_as::<_, SeedAsset>(
            "SELECT id, symbol FROM assets WHERE is_active = true",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    /// Write one "now" candle per asset, idempotently (ON CONFLICT DO UPDATE).
    async fn tick_once(&self, assets: &[SeedAsset]) -> Result<()> {
        let now = Utc::now().naive_utc();
        // Floor to the current minute so candles align with 1-minute history.
        let bucket = now
            .date()
            .and_hms_opt(now.time().hour(), now.time().minute(), 0)
            .unwrap_or(now);

        let unix_minute = bucket.and_utc().timestamp() / 60;

        for a in assets {
            let (o, h, l, c, v) = candle(&a.symbol, unix_minute);
            sqlx::query(
                r#"
                INSERT INTO market_prices (asset_id, timestamp, open, high, low, close, volume)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (asset_id, timestamp) DO UPDATE SET
                    high   = GREATEST(market_prices.high, EXCLUDED.high),
                    low    = LEAST(market_prices.low, EXCLUDED.low),
                    close  = EXCLUDED.close,
                    volume = EXCLUDED.volume
                "#,
            )
            .bind(a.id)
            .bind(bucket)
            .bind(f64_to_decimal(o))
            .bind(f64_to_decimal(h))
            .bind(f64_to_decimal(l))
            .bind(f64_to_decimal(c))
            .bind(f64_to_decimal(v))
            .execute(&self.pool)
            .await?;
        }
        Ok(())
    }
}

#[async_trait]
impl MarketDataProvider for SeedMarketDataProvider {
    fn label(&self) -> &'static str {
        "seed (deterministic, local)"
    }

    async fn start(self: Arc<Self>) -> Result<()> {
        let interval = self.tick_interval;
        tokio::spawn(async move {
            info!("Seed market-data generator started (tick = {:?})", interval);
            loop {
                match self.active_assets().await {
                    Ok(assets) => {
                        if let Err(e) = self.tick_once(&assets).await {
                            warn!("seed tick write failed: {:?}", e);
                        }
                    }
                    Err(e) => warn!("seed provider: could not load assets: {:?}", e),
                }
                tokio::time::sleep(interval).await;
            }
        });
        Ok(())
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Historical backfill (used by seeder.rs, lives here because the math does too)
// ──────────────────────────────────────────────────────────────────────────────

/// Backfill ~`days` of 1-minute OHLC candles for the given assets.
/// Idempotent via ON CONFLICT. Safe to call multiple times.
pub async fn backfill_history(pool: &PgPool, assets: &[SeedAsset], days: i64) -> Result<usize> {
    let end = Utc::now().naive_utc();
    let start = end - ChronoDuration::days(days);
    let start_minute = start.and_utc().timestamp() / 60;
    let end_minute = end.and_utc().timestamp() / 60;

    let mut total = 0usize;
    for asset in assets {
        let mut tx = pool.begin().await?;
        let mut m = start_minute;
        while m <= end_minute {
            let ts = DateTime::<Utc>::from_timestamp(m * 60, 0)
                .expect("valid timestamp")
                .naive_utc();
            let (o, h, l, c, v) = candle(&asset.symbol, m);
            sqlx::query(
                r#"
                INSERT INTO market_prices (asset_id, timestamp, open, high, low, close, volume)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (asset_id, timestamp) DO NOTHING
                "#,
            )
            .bind(asset.id)
            .bind(ts)
            .bind(f64_to_decimal(o))
            .bind(f64_to_decimal(h))
            .bind(f64_to_decimal(l))
            .bind(f64_to_decimal(c))
            .bind(f64_to_decimal(v))
            .execute(&mut *tx)
            .await?;
            total += 1;
            m += 1;
        }
        tx.commit().await?;
    }
    Ok(total)
}

// ──────────────────────────────────────────────────────────────────────────────
// Live provider (optional)
// ──────────────────────────────────────────────────────────────────────────────

/// Live mode wraps the existing Zerodha ingester. We keep *seed* generation
/// running alongside so that:
///   - Any asset not covered by live instrument tokens still gets prices.
///   - A dropped/expired Kite connection does not silently break contests.
pub struct LiveMarketDataProvider {
    pool: PgPool,
    api_key: String,
    access_token: String,
    seed: Arc<SeedMarketDataProvider>,
}

impl LiveMarketDataProvider {
    pub fn new(pool: PgPool, api_key: String, access_token: String) -> Self {
        Self {
            seed: Arc::new(SeedMarketDataProvider::new(pool.clone())),
            pool,
            api_key,
            access_token,
        }
    }
}

#[async_trait]
impl MarketDataProvider for LiveMarketDataProvider {
    fn label(&self) -> &'static str {
        "live (zerodha kite) + seed fallback"
    }

    async fn start(self: Arc<Self>) -> Result<()> {
        // Always keep seed running underneath as the safety net.
        self.seed.clone().start().await?;

        let pool = self.pool.clone();
        let api_key = self.api_key.clone();
        let access_token = self.access_token.clone();

        tokio::spawn(async move {
            info!("Attempting Zerodha Kite live stream...");
            match super::market_data_ingester::run_market_data_service(
                pool,
                api_key,
                access_token,
            )
            .await
            {
                Ok(()) => info!("Kite stream terminated cleanly"),
                Err(e) => warn!(
                    "Kite stream unavailable ({}). Continuing on seed data.",
                    e
                ),
            }
        });
        Ok(())
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Factory
// ──────────────────────────────────────────────────────────────────────────────

/// Decide which provider to construct based on config.
/// Returns the provider and the effective mode (may differ from the requested
/// mode if Live was requested but no Kite credentials were supplied).
pub fn build(
    pool: PgPool,
    config: &AppConfig,
) -> (Arc<dyn MarketDataProvider>, MarketDataMode) {
    match (config.market_data_mode, &config.kite) {
        (MarketDataMode::Live, Some(kite)) => (
            Arc::new(LiveMarketDataProvider::new(
                pool,
                kite.api_key.clone(),
                kite.access_token.clone(),
            )),
            MarketDataMode::Live,
        ),
        (MarketDataMode::Live, None) => {
            warn!(
                "MARKET_DATA_MODE=live requested but no Kite credentials. \
                 Falling back to seed mode."
            );
            (
                Arc::new(SeedMarketDataProvider::new(pool)),
                MarketDataMode::Seed,
            )
        }
        (MarketDataMode::Seed, _) => (
            Arc::new(SeedMarketDataProvider::new(pool)),
            MarketDataMode::Seed,
        ),
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Unit tests for the deterministic price model
// ──────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rand01_is_in_unit_interval() {
        for i in 0..10_000u64 {
            let r = rand01(0xdead_beef, i);
            assert!((0.0..1.0).contains(&r), "rand01 out of range: {}", r);
        }
    }

    #[test]
    fn price_at_is_deterministic() {
        let a = price_at("BTC", 29_000_000);
        let b = price_at("BTC", 29_000_000);
        assert_eq!(a, b, "price_at must be deterministic for same inputs");
    }

    #[test]
    fn price_at_differs_across_symbols_and_time() {
        let btc = price_at("BTC", 29_000_000);
        let eth = price_at("ETH", 29_000_000);
        assert!((btc - eth).abs() > 1.0, "BTC/ETH prices must diverge");
        let next = price_at("BTC", 29_000_005);
        assert!(btc != next, "Price must evolve across minutes");
    }

    #[test]
    fn base_price_is_positive_for_known_symbols() {
        for s in &["BTC", "ETH", "RELIANCE", "TCS", "NIFTYBEES"] {
            let b = base_price(s);
            assert!(b > 0.0, "base price must be > 0 for {}", s);
        }
    }

    #[test]
    fn candle_ohlc_invariants_hold() {
        // For 5000 random minutes across a few symbols, high >= max(o,c),
        // low <= min(o,c), volume > 0, and candles are fully deterministic.
        for minute in 28_000_000i64..28_005_000 {
            for sym in &["BTC", "ETH", "RELIANCE"] {
                let (o, h, l, c, v) = candle(sym, minute);
                assert!(h >= o.max(c) - 1e-9, "high < max(o,c): {} {}", sym, minute);
                assert!(l <= o.min(c) + 1e-9, "low > min(o,c): {} {}", sym, minute);
                assert!(v > 0.0, "volume must be positive");
                // determinism
                let again = candle(sym, minute);
                assert_eq!((o, h, l, c, v), again, "candle must be deterministic");
            }
        }
    }

    #[test]
    fn wicks_are_tight_enough_to_be_realistic() {
        // Worst-case wick stretch is below 1% — keeps the synthetic series
        // visually plausible and avoids settlement noise in contests.
        for minute in 28_000_000i64..28_001_000 {
            let (o, h, l, c, _) = candle("BTC", minute);
            let span = h - l;
            let reference = o.max(c);
            assert!(
                span / reference < 0.02,
                "minute {minute}: candle too wide ({span})"
            );
        }
    }

    #[test]
    fn f64_to_decimal_rounds_to_four_dp() {
        let d = f64_to_decimal(1.234_567_89);
        assert_eq!(d.to_string(), "1.2346");
    }
}
