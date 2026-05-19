use anyhow::Result;
use sqlx::{postgres::PgPoolOptions, PgPool, Executor};

#[derive(Clone)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = PgPoolOptions::new()
            .max_connections(50)
            // Pin every connection to UTC so Postgres `NOW()` always matches the
            // UTC values we store from Rust (`Utc::now().naive_utc()`). Without
            // this, executor comparisons drift by the server's local offset.
            .after_connect(|conn, _meta| {
                Box::pin(async move {
                    conn.execute("SET TIME ZONE 'UTC'").await?;
                    Ok(())
                })
            })
            .connect(database_url)
            .await?;

        // Schema migrations are bundled at compile time and applied automatically
        // on startup. They are tracked via `_sqlx_migrations`, so this is idempotent.
        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }
}
