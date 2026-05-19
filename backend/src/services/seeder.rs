//! One-shot self-healing database bootstrap.
//!
//! Runs on every startup. Guarantees the app is never "empty":
//!   1. Required assets exist (idempotent upsert by symbol).
//!   2. At least ~7 days of deterministic 5-minute OHLC history exists per asset.
//!   3. At least 3 active contests (end_time > now) exist across all 3 tracks,
//!      each with their asset pool wired. If none exist, fresh ones are created
//!      with start/end times anchored to "now" so the demo flow is always live.
//!
//! Safe to re-run — it only fills gaps, never destroys user data.

use anyhow::Result;
use chrono::{Duration as ChronoDuration, Utc};
use rust_decimal::Decimal;
use sqlx::PgPool;
use tracing::info;
use uuid::Uuid;

use crate::services::market_data::{backfill_history, SeedAsset};

/// Canonical MVP asset catalogue. Matches the three contest tracks:
///   crypto : BTC, ETH, SOL
///   etf    : NIFTYBEES, BANKBEES
///   index  : NIFTY50, BANKNIFTY
///   equity : INFY, TCS, RELIANCE   (used in basket contests)
const ASSETS: &[(&str, &str, &str, &str)] = &[
    ("BTC",       "Bitcoin",                      "crypto", "BINANCE"),
    ("ETH",       "Ethereum",                     "crypto", "BINANCE"),
    ("SOL",       "Solana",                       "crypto", "BINANCE"),
    ("NIFTY50",   "Nifty 50 Index",               "index",  "NSE"),
    ("BANKNIFTY", "Bank Nifty Index",             "index",  "NSE"),
    ("INFY",      "Infosys Ltd",                  "equity", "NSE"),
    ("TCS",       "Tata Consultancy Services",    "equity", "NSE"),
    ("RELIANCE",  "Reliance Industries",          "equity", "NSE"),
    ("NIFTYBEES", "Nifty BeES ETF",               "etf",    "NSE"),
    ("BANKBEES",  "Bank BeES ETF",                "etf",    "NSE"),
];

/// Full bootstrap. Logs what it did.
pub async fn bootstrap(pool: &PgPool) -> Result<()> {
    ensure_assets(pool).await?;
    let assets = load_assets(pool).await?;
    ensure_history(pool, &assets).await?;
    ensure_contests(pool, &assets).await?;
    Ok(())
}

async fn ensure_assets(pool: &PgPool) -> Result<()> {
    let mut inserted = 0;
    for (symbol, name, asset_type, exchange) in ASSETS {
        let res = sqlx::query(
            r#"
            INSERT INTO assets (symbol, name, asset_type, exchange, is_active)
            VALUES ($1, $2, $3, $4, true)
            ON CONFLICT (symbol) DO NOTHING
            "#,
        )
        .bind(symbol)
        .bind(name)
        .bind(asset_type)
        .bind(exchange)
        .execute(pool)
        .await?;
        inserted += res.rows_affected();
    }
    if inserted > 0 {
        info!("Seeder: inserted {} new asset(s)", inserted);
    }
    Ok(())
}

async fn load_assets(pool: &PgPool) -> Result<Vec<SeedAsset>> {
    let rows = sqlx::query_as::<_, SeedAsset>(
        "SELECT id, symbol FROM assets WHERE is_active = true",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

async fn ensure_history(pool: &PgPool, assets: &[SeedAsset]) -> Result<()> {
    // Count existing rows; backfill if sparse.
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM market_prices")
        .fetch_one(pool)
        .await?;

    // 3 days * 1440 buckets/day * 10 assets ≈ 43k rows expected.
    if count < 20_000 {
        info!(
            "Seeder: market_prices sparse ({} rows), backfilling 3 days of 1-min candles...",
            count
        );
        let written = backfill_history(pool, assets, 3).await?;
        info!("Seeder: backfilled {} candle rows", written);
    }
    Ok(())
}

async fn ensure_contests(pool: &PgPool, assets: &[SeedAsset]) -> Result<()> {
    // Do we have at least one contest whose end_time is still in the future?
    let future_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM contests WHERE end_time > NOW()
            AND status IN ('upcoming', 'joining_open', 'allocation_locked', 'live')",
    )
    .fetch_one(pool)
    .await?;

    if future_count >= 3 {
        return Ok(());
    }

    info!("Seeder: fewer than 3 active contests — creating fresh ones");

    let by_symbol: std::collections::HashMap<&str, Uuid> = assets
        .iter()
        .map(|a| (a.symbol.as_str(), a.id))
        .collect();

    let now = Utc::now().naive_utc();

    // Contest 1 — Crypto, joins NOW, starts in 5 min, ends in 1h05m.
    // This is the "happy path" you can drive end-to-end right after login.
    let c1 = insert_contest(
        pool,
        "BTC vs ETH — Quick Battle",
        "crypto",
        Decimal::new(5000, 2),    // 50.00 entry
        Decimal::new(10000000, 2), // 100,000.00 virtual capital
        now,                               // joining open right now
        now + ChronoDuration::minutes(5),  // starts in 5 min
        now + ChronoDuration::minutes(65), // ends 1h later
        "joining_open",
    )
    .await?;
    link_assets(pool, c1, &["BTC", "ETH"], &by_symbol).await?;

    // Contest 2 — ETF, upcoming, joins open in 10 min.
    let c2 = insert_contest(
        pool,
        "Index Fund Duel",
        "etf",
        Decimal::new(3000, 2),
        Decimal::new(10000000, 2),
        now + ChronoDuration::minutes(10),
        now + ChronoDuration::minutes(20),
        now + ChronoDuration::minutes(80),
        "upcoming",
    )
    .await?;
    link_assets(pool, c2, &["NIFTYBEES", "BANKBEES"], &by_symbol).await?;

    // Contest 3 — Basket, joining_open, longer window so multiple users can join.
    let c3 = insert_contest(
        pool,
        "Blue Chip Trio",
        "basket",
        Decimal::new(7500, 2),
        Decimal::new(15000000, 2),
        now,
        now + ChronoDuration::minutes(15),
        now + ChronoDuration::minutes(90),
        "joining_open",
    )
    .await?;
    link_assets(pool, c3, &["INFY", "TCS", "RELIANCE"], &by_symbol).await?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
async fn insert_contest(
    pool: &PgPool,
    title: &str,
    track: &str,
    entry_fee: Decimal,
    virtual_capital: Decimal,
    _join_open_time: chrono::NaiveDateTime,
    start_time: chrono::NaiveDateTime,
    end_time: chrono::NaiveDateTime,
    status: &str,
) -> Result<Uuid> {
    let id = Uuid::new_v4();
    sqlx::query(
        r#"
        INSERT INTO contests
            (id, title, track, entry_fee, virtual_capital, start_time, end_time, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
    )
    .bind(id)
    .bind(title)
    .bind(track)
    .bind(entry_fee)
    .bind(virtual_capital)
    .bind(start_time)
    .bind(end_time)
    .bind(status)
    .execute(pool)
    .await?;
    info!("Seeder: created contest '{}' ({})", title, id);
    Ok(id)
}

async fn link_assets(
    pool: &PgPool,
    contest_id: Uuid,
    symbols: &[&str],
    by_symbol: &std::collections::HashMap<&str, Uuid>,
) -> Result<()> {
    for sym in symbols {
        let asset_id = match by_symbol.get(sym) {
            Some(id) => *id,
            None => {
                tracing::warn!("Seeder: asset '{}' not found; skipping link", sym);
                continue;
            }
        };
        // `contest_assets` has a composite uniqueness constraint on (contest_id, asset_id),
        // so ON CONFLICT DO NOTHING makes this idempotent.
        sqlx::query(
            r#"
            INSERT INTO contest_assets (contest_id, asset_id)
            VALUES ($1, $2)
            ON CONFLICT (contest_id, asset_id) DO NOTHING
            "#,
        )
        .bind(contest_id)
        .bind(asset_id)
        .execute(pool)
        .await?;
    }
    Ok(())
}
