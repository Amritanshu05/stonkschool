use axum::{
    extract::State,
    routing::get,
    Router, Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::NaiveDateTime;
use crate::{error::Result, modules::AppState};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/", get(get_wallet_balance))
        .route("/transactions", get(get_transactions))
        .with_state(state)
}

#[derive(Debug, Serialize)]
struct WalletResponse {
    balance: Decimal,
    currency: String,
}

#[derive(Debug, Serialize)]
struct TransactionResponse {
    id: Uuid,
    amount: Decimal,
    r#type: String,
    created_at: NaiveDateTime,
}

async fn get_wallet_balance(
    State(state): State<AppState>,
    // TODO: Extract user from session
) -> Result<Json<WalletResponse>> {
    let user_id = Uuid::new_v4(); // Placeholder
    
    #[derive(sqlx::FromRow)]
    struct WalletData {
        balance: Decimal,
    }
    
    let wallet = sqlx::query_as::<_, WalletData>(
        "SELECT balance FROM wallets WHERE user_id = $1"
    )
    .bind(user_id)
    .fetch_one(&state.db.pool)
    .await?;
    
    Ok(Json(WalletResponse {
        balance: wallet.balance,
        currency: "VCOIN".to_string(),
    }))
}

async fn get_transactions(
    State(state): State<AppState>,
    // TODO: Extract user from session
) -> Result<Json<Vec<TransactionResponse>>> {
    let user_id = Uuid::new_v4(); // Placeholder
    
    #[derive(sqlx::FromRow)]
    struct TransactionData {
        id: Uuid,
        amount: Decimal,
        r#type: String,
        created_at: NaiveDateTime,
    }
    
    let transactions = sqlx::query_as::<_, TransactionData>(
        r#"
        SELECT wt.id, wt.amount, wt.type, wt.created_at
        FROM wallet_transactions wt
        INNER JOIN wallets w ON wt.wallet_id = w.id
        WHERE w.user_id = $1
        ORDER BY wt.created_at DESC
        LIMIT 50
        "#
    )
    .bind(user_id)
    .fetch_all(&state.db.pool)
    .await?;
    
    Ok(Json(
        transactions
            .into_iter()
            .map(|t| TransactionResponse {
                id: t.id,
                amount: t.amount,
                r#type: t.r#type,
                created_at: t.created_at,
            })
            .collect(),
    ))
}
