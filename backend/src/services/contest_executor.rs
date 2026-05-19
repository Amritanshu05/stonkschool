/// Contest Executor — background service that:
/// 1. Transitions contests between lifecycle states on schedule
/// 2. Computes portfolio values for all participants in live contests
/// 3. Updates the leaderboard and broadcasts via WebSocket (fire-and-forget DB update)
/// 4. Settles ended contests and distributes prizes
use sqlx::PgPool;
use uuid::Uuid;
use rust_decimal::Decimal;
use tracing::{error, info};
use std::time::Duration;
use chrono::NaiveDateTime;

pub struct ContestExecutor {
    pool: PgPool,
}

impl ContestExecutor {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Main loop — runs every 10 seconds so state transitions feel responsive.
    pub async fn run(self) {
        info!("Contest executor started");
        loop {
            if let Err(e) = self.tick().await {
                error!("Contest executor error: {:?}", e);
            }
            tokio::time::sleep(Duration::from_secs(10)).await;
        }
    }

    async fn tick(&self) -> anyhow::Result<()> {
        self.open_joining_for_upcoming().await?;
        self.lock_allocations_and_go_live().await?;
        self.update_live_leaderboards().await?;
        self.settle_ended_contests().await?;
        Ok(())
    }

    /// DRAFT/UPCOMING → JOINING_OPEN when start_time is within 15 minutes
    async fn open_joining_for_upcoming(&self) -> anyhow::Result<()> {
        let updated = sqlx::query(
            r#"
            UPDATE contests
            SET status = 'joining_open', updated_at = (NOW() AT TIME ZONE 'UTC')
            WHERE status IN ('draft', 'upcoming')
              AND (NOW() AT TIME ZONE 'UTC') >= start_time - INTERVAL '15 minutes'
              AND (NOW() AT TIME ZONE 'UTC') < start_time
            "#,
        )
        .execute(&self.pool)
        .await?
        .rows_affected();

        if updated > 0 {
            info!("Opened joining for {} contest(s)", updated);
        }
        Ok(())
    }

    /// JOINING_OPEN → LIVE at start_time
    async fn lock_allocations_and_go_live(&self) -> anyhow::Result<()> {
        let updated = sqlx::query(
            r#"
            UPDATE contests
            SET status = 'live', updated_at = (NOW() AT TIME ZONE 'UTC')
            WHERE status IN ('joining_open', 'allocation_locked')
              AND (NOW() AT TIME ZONE 'UTC') >= start_time
            "#,
        )
        .execute(&self.pool)
        .await?
        .rows_affected();

        if updated > 0 {
            info!("Started {} contest(s)", updated);
        }
        Ok(())
    }

    /// For every LIVE contest, recompute each participant's portfolio value
    /// using the latest market price for each allocated asset, then rank them.
    async fn update_live_leaderboards(&self) -> anyhow::Result<()> {
        #[derive(sqlx::FromRow)]
        struct LiveContest {
            id: Uuid,
            virtual_capital: Decimal,
            start_time: NaiveDateTime,
        }

        let live_contests = sqlx::query_as::<_, LiveContest>(
            "SELECT id, virtual_capital, start_time FROM contests WHERE status = 'live'",
        )
        .fetch_all(&self.pool)
        .await?;

        for contest in live_contests {
            if let Err(e) = self
                .update_one_contest(&contest.id, contest.virtual_capital, contest.start_time)
                .await
            {
                error!("Leaderboard update failed for contest {}: {:?}", contest.id, e);
            }
        }
        Ok(())
    }

    async fn update_one_contest(
        &self,
        contest_id: &Uuid,
        virtual_capital: Decimal,
        contest_start: NaiveDateTime,
    ) -> anyhow::Result<()> {
        // Get all participants with locked allocations
        #[derive(sqlx::FromRow)]
        struct Participant {
            user_id: Uuid,
            participant_id: Uuid,
        }

        let participants = sqlx::query_as::<_, Participant>(
            r#"
            SELECT cp.user_id, cp.id as participant_id
            FROM contest_participants cp
            WHERE cp.contest_id = $1 AND cp.locked_at IS NOT NULL
            "#,
        )
        .bind(contest_id)
        .fetch_all(&self.pool)
        .await?;

        let mut portfolio_values: Vec<(Uuid, Decimal)> = Vec::new();

        for p in participants {
            let value = self
                .compute_portfolio_value(p.participant_id, virtual_capital, contest_start)
                .await
                .unwrap_or(virtual_capital);
            portfolio_values.push((p.user_id, value));
        }

        // Sort descending by value, assign ranks
        portfolio_values.sort_by(|a, b| b.1.cmp(&a.1));

        for (rank, (user_id, value)) in portfolio_values.iter().enumerate() {
            let rank_i32 = (rank + 1) as i32;
            sqlx::query(
                r#"
                INSERT INTO contest_leaderboard (contest_id, user_id, rank, portfolio_value, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (contest_id, user_id)
                DO UPDATE SET rank = $3, portfolio_value = $4, updated_at = NOW()
                "#,
            )
            .bind(contest_id)
            .bind(user_id)
            .bind(rank_i32)
            .bind(value)
            .execute(&self.pool)
            .await?;
        }

        Ok(())
    }

    /// Weighted portfolio value:
    ///   value = sum( (alloc_pct/100) * virtual_capital * (latest_price / entry_price) )
    /// where `entry_price` = most recent close at-or-before contest start_time.
    async fn compute_portfolio_value(
        &self,
        participant_id: Uuid,
        virtual_capital: Decimal,
        contest_start: NaiveDateTime,
    ) -> anyhow::Result<Decimal> {
        #[derive(sqlx::FromRow)]
        struct AllocRow {
            asset_id: Uuid,
            allocation_pct: Decimal,
        }

        let allocations = sqlx::query_as::<_, AllocRow>(
            "SELECT asset_id, allocation_pct FROM contest_allocations WHERE participant_id = $1",
        )
        .bind(participant_id)
        .fetch_all(&self.pool)
        .await?;

        if allocations.is_empty() {
            return Ok(virtual_capital);
        }

        let mut total = Decimal::ZERO;

        for alloc in allocations {
            // Latest price available
            let latest: Option<Decimal> = sqlx::query_scalar(
                "SELECT close FROM market_prices WHERE asset_id = $1 ORDER BY timestamp DESC LIMIT 1",
            )
            .bind(alloc.asset_id)
            .fetch_optional(&self.pool)
            .await?;

            // Entry price: most recent close at-or-before contest start
            let entry: Option<Decimal> = sqlx::query_scalar(
                "SELECT close FROM market_prices
                 WHERE asset_id = $1 AND timestamp <= $2
                 ORDER BY timestamp DESC LIMIT 1",
            )
            .bind(alloc.asset_id)
            .bind(contest_start)
            .fetch_optional(&self.pool)
            .await?;

            // Fall back to earliest price if nothing before start
            let entry = match entry {
                Some(e) => Some(e),
                None => sqlx::query_scalar::<_, Decimal>(
                    "SELECT close FROM market_prices WHERE asset_id = $1 ORDER BY timestamp ASC LIMIT 1",
                )
                .bind(alloc.asset_id)
                .fetch_optional(&self.pool)
                .await?,
            };

            let weight = alloc.allocation_pct / Decimal::new(100, 0);
            let portion = virtual_capital * weight;

            let value = match (latest, entry) {
                (Some(l), Some(e)) if e != Decimal::ZERO => portion * l / e,
                _ => portion,
            };

            total += value;
        }

        Ok(total)
    }

    /// LIVE → ENDED when now >= end_time, then settle prizes
    async fn settle_ended_contests(&self) -> anyhow::Result<()> {
        // Mark ended
        let updated = sqlx::query(
            r#"
            UPDATE contests
            SET status = 'ended', updated_at = (NOW() AT TIME ZONE 'UTC')
            WHERE status = 'live'
              AND (NOW() AT TIME ZONE 'UTC') >= end_time
            "#,
        )
        .execute(&self.pool)
        .await?
        .rows_affected();

        if updated > 0 {
            info!("Ended {} contest(s)", updated);
        }

        // Settle all ended (but not yet settled) contests.
        // Prize pool is derived on the fly = entry_fee * number_of_participants.
        #[derive(sqlx::FromRow)]
        struct EndedContest {
            id: Uuid,
            prize_pool: Decimal,
        }

        let ended = sqlx::query_as::<_, EndedContest>(
            r#"
            SELECT
                c.id,
                COALESCE(c.entry_fee * COUNT(cp.id)::numeric, 0) AS prize_pool
            FROM contests c
            LEFT JOIN contest_participants cp ON cp.contest_id = c.id
            WHERE c.status = 'ended'
            GROUP BY c.id, c.entry_fee
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        for contest in ended {
            if let Err(e) = self.settle_contest(contest.id, contest.prize_pool).await {
                error!("Settlement failed for contest {}: {:?}", contest.id, e);
            }
        }

        Ok(())
    }

    async fn settle_contest(&self, contest_id: Uuid, prize_pool: Decimal) -> anyhow::Result<()> {
        // Copy final leaderboard ranks into contest_participants
        sqlx::query(
            r#"
            UPDATE contest_participants cp
            SET
                final_rank  = cl.rank,
                final_value = cl.portfolio_value
            FROM contest_leaderboard cl
            WHERE cl.contest_id = $1
              AND cl.user_id = cp.user_id
              AND cp.contest_id = $1
            "#,
        )
        .bind(contest_id)
        .execute(&self.pool)
        .await?;

        // Distribute prizes: 1st=50%, 2nd=30%, 3rd=20%
        let prize_tiers: &[(i32, Decimal)] = &[
            (1, Decimal::new(50, 2)),
            (2, Decimal::new(30, 2)),
            (3, Decimal::new(20, 2)),
        ];

        for (rank, pct) in prize_tiers {
            let payout = prize_pool * pct;

            // Find winner at this rank
            let winner: Option<Uuid> = sqlx::query_scalar(
                r#"
                SELECT cp.user_id
                FROM contest_participants cp
                WHERE cp.contest_id = $1 AND cp.final_rank = $2
                LIMIT 1
                "#,
            )
            .bind(contest_id)
            .bind(rank)
            .fetch_optional(&self.pool)
            .await?;

            if let Some(user_id) = winner {
                // Credit wallet
                sqlx::query(
                    "UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2",
                )
                .bind(payout)
                .bind(user_id)
                .execute(&self.pool)
                .await?;

                // Record transaction
                let wallet_id: Option<Uuid> =
                    sqlx::query_scalar("SELECT id FROM wallets WHERE user_id = $1")
                        .bind(user_id)
                        .fetch_optional(&self.pool)
                        .await?;

                if let Some(wid) = wallet_id {
                    sqlx::query(
                        "INSERT INTO wallet_transactions (wallet_id, amount, type, reference_id, created_at)
                         VALUES ($1, $2, 'prize', $3, NOW())",
                    )
                    .bind(wid)
                    .bind(payout)
                    .bind(contest_id)
                    .execute(&self.pool)
                    .await?;
                }

                // Update payout on participant record
                sqlx::query(
                    "UPDATE contest_participants SET payout = $1 WHERE contest_id = $2 AND user_id = $3",
                )
                .bind(payout)
                .bind(contest_id)
                .bind(user_id)
                .execute(&self.pool)
                .await?;

                // Update stats
                if *rank == 1 {
                    sqlx::query(
                        "UPDATE user_profiles SET contests_won = contests_won + 1 WHERE user_id = $1",
                    )
                    .bind(user_id)
                    .execute(&self.pool)
                    .await?;
                }
            }
        }

        // Update total_contests for all participants
        sqlx::query(
            r#"
            UPDATE user_profiles up
            SET total_contests = total_contests + 1
            FROM contest_participants cp
            WHERE cp.user_id = up.user_id AND cp.contest_id = $1
            "#,
        )
        .bind(contest_id)
        .execute(&self.pool)
        .await?;

        // Mark contest as settled
        sqlx::query("UPDATE contests SET status = 'settled', updated_at = (NOW() AT TIME ZONE 'UTC') WHERE id = $1")
            .bind(contest_id)
            .execute(&self.pool)
            .await?;

        info!("Contest {} settled successfully", contest_id);
        Ok(())
    }
}
