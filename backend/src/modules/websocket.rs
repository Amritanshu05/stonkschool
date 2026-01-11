use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    response::IntoResponse,
};
use futures_util::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::{error::Result, modules::AppState};

#[derive(Debug, Serialize)]
struct ReplayTick {
    timestamp: String,
    price: f64,
}

#[derive(Debug, Serialize)]
struct LeaderboardUpdate {
    rank: i32,
    user: String,
    value: f64,
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
        close: rust_decimal::Decimal,
    }
    
    let prices = match sqlx::query_as::<_, PriceData>(
        r#"
        SELECT timestamp, close
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
        let tick = ReplayTick {
            timestamp: price.timestamp.to_string(),
            price: price.close.to_string().parse().unwrap_or(0.0),
        };
        
        let msg = serde_json::to_string(&tick).unwrap();
        
        if socket.send(Message::Text(msg)).await.is_err() {
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
        
        let msg = serde_json::to_string(&updates).unwrap();
        
        if socket.send(Message::Text(msg)).await.is_err() {
            tracing::info!("Client disconnected");
            break;
        }
    }
}
