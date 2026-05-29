use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    response::IntoResponse,
};
use serde::Serialize;
use uuid::Uuid;
use crate::modules::AppState;

#[derive(Debug, Serialize)]
struct ReplayBar {
    time: i64,
    open: f64,
    high: f64,
    low: f64,
    close: f64,
}

#[derive(Debug, Serialize)]
struct ReplayBarMessage {
    #[serde(rename = "type")]
    msg_type: &'static str,
    bar: ReplayBar,
}

#[derive(Debug, Serialize)]
struct ReplayPnlMessage {
    #[serde(rename = "type")]
    msg_type: &'static str,
    value: f64,
}

#[derive(Debug, Serialize)]
struct LeaderboardUpdate {
    rank: i32,
    user: String,
    value: f64,
}

#[derive(Debug, Serialize)]
struct LeaderboardUpdateMessage {
    #[serde(rename = "type")]
    msg_type: &'static str,
    entries: Vec<LeaderboardUpdate>,
}

pub async fn replay_handler(
    ws: WebSocketUpgrade,
    Path(replay_id): Path<Uuid>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_replay_socket(socket, replay_id, state))
}

pub async fn contest_handler(
    ws: WebSocketUpgrade,
    Path(contest_id): Path<Uuid>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_contest_socket(socket, contest_id, state))
}

async fn handle_replay_socket(mut socket: WebSocket, replay_id: Uuid, state: AppState) {
    tracing::info!("New WebSocket connection for replay: {}", replay_id);
    
    // Fetch replay session details
    #[derive(sqlx::FromRow)]
    struct ReplayData {
        asset_id: Uuid,
        start_time: chrono::NaiveDateTime,
        end_time: chrono::NaiveDateTime,
    }
    
    let replay = match sqlx::query_as::<_, ReplayData>(
        "SELECT asset_id, start_time, end_time FROM replay_sessions WHERE id = $1"
    )
    .bind(replay_id)
    .fetch_optional(&state.db.pool)
    .await
    {
        Ok(Some(r)) => r,
        Ok(None) => {
            let _ = socket.send(Message::Text(
                serde_json::json!({"error": "Replay not found"}).to_string()
            )).await;
            return;
        }
        Err(e) => {
            tracing::error!("Database error: {}", e);
            return;
        }
    };
    
    // Fetch price data
    #[derive(sqlx::FromRow)]
    struct PriceData {
        timestamp: chrono::NaiveDateTime,
        open: rust_decimal::Decimal,
        high: rust_decimal::Decimal,
        low: rust_decimal::Decimal,
        close: rust_decimal::Decimal,
    }
    
    let prices = match sqlx::query_as::<_, PriceData>(
        r#"
        SELECT timestamp, open, high, low, close
        FROM market_prices
        WHERE asset_id = $1 AND timestamp BETWEEN $2 AND $3
        ORDER BY timestamp ASC
        "#
    )
    .bind(replay.asset_id)
    .bind(replay.start_time)
    .bind(replay.end_time)
    .fetch_all(&state.db.pool)
    .await
    {
        Ok(p) => p,
        Err(e) => {
            tracing::error!("Failed to fetch prices: {}", e);
            return;
        }
    };
    
    // Stream price data
    for price in prices {
        let unix_seconds = price.timestamp.and_utc().timestamp();
        let open_f = price.open.to_string().parse().unwrap_or(0.0);
        let high_f = price.high.to_string().parse().unwrap_or(0.0);
        let low_f = price.low.to_string().parse().unwrap_or(0.0);
        let close_f = price.close.to_string().parse().unwrap_or(0.0);

        let bar_msg = ReplayBarMessage {
            msg_type: "bar",
            bar: ReplayBar {
                time: unix_seconds,
                open: open_f,
                high: high_f,
                low: low_f,
                close: close_f,
            },
        };
        
        let msg = serde_json::to_string(&bar_msg).unwrap();
        if socket.send(Message::Text(msg)).await.is_err() {
            tracing::info!("Client disconnected");
            break;
        }

        // Fetch current trades to calculate session P&L
        let trades = sqlx::query!(
            "SELECT side, price, quantity FROM replay_trades WHERE replay_id = $1",
            replay_id
        )
        .fetch_all(&state.db.pool)
        .await
        .unwrap_or_default();

        let mut cash = 0.0;
        let mut position = 0.0;
        for t in trades {
            let p = t.price.to_string().parse::<f64>().unwrap_or(0.0);
            let q = t.quantity.to_string().parse::<f64>().unwrap_or(0.0);
            if t.side == "buy" {
                cash -= p * q;
                position += q;
            } else if t.side == "sell" {
                cash += p * q;
                position -= q;
            }
        }
        let pnl_value = cash + position * close_f;

        let pnl_msg = ReplayPnlMessage {
            msg_type: "pnl",
            value: pnl_value,
        };

        let msg_pnl = serde_json::to_string(&pnl_msg).unwrap();
        if socket.send(Message::Text(msg_pnl)).await.is_err() {
            tracing::info!("Client disconnected");
            break;
        }
        
        // Simulate real-time delay (1 tick per second)
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    }
    
    let _ = socket.send(Message::Close(None)).await;
}

async fn handle_contest_socket(mut socket: WebSocket, contest_id: Uuid, state: AppState) {
    tracing::info!("New WebSocket connection for contest: {}", contest_id);
    
    // TODO: Implement live contest updates and leaderboard streaming
    // This would involve:
    // 1. Subscribing to market data updates
    // 2. Computing portfolio values for all participants
    // 3. Updating leaderboard in real-time
    // 4. Broadcasting updates to all connected clients
    
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
        
        // Fetch current leaderboard
        #[derive(sqlx::FromRow)]
        struct LeaderboardData {
            rank: i32,
            display_name: String,
            portfolio_value: rust_decimal::Decimal,
        }
        
        let leaderboard = match sqlx::query_as::<_, LeaderboardData>(
            r#"
            SELECT cl.rank, up.display_name, cl.portfolio_value
            FROM contest_leaderboard cl
            INNER JOIN users u ON cl.user_id = u.id
            INNER JOIN user_profiles up ON u.id = up.user_id
            WHERE cl.contest_id = $1
            ORDER BY cl.rank ASC
            LIMIT 10
            "#
        )
        .bind(contest_id)
        .fetch_all(&state.db.pool)
        .await
        {
            Ok(l) => l,
            Err(e) => {
                tracing::error!("Failed to fetch leaderboard: {}", e);
                break;
            }
        };
        
        let updates: Vec<LeaderboardUpdate> = leaderboard
            .into_iter()
            .map(|entry| LeaderboardUpdate {
                rank: entry.rank,
                user: entry.display_name,
                value: entry.portfolio_value.to_string().parse().unwrap_or(0.0),
            })
            .collect();
        
        let update_msg = LeaderboardUpdateMessage {
            msg_type: "leaderboard_update",
            entries: updates,
        };
        
        let msg = serde_json::to_string(&update_msg).unwrap();
        
        if socket.send(Message::Text(msg)).await.is_err() {
            tracing::info!("Client disconnected");
            break;
        }
    }
}
