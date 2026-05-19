use axum::{
    extract::{Query, State},
    http::{header, HeaderValue},
    response::{IntoResponse, Redirect, Response},
    routing::{get, post},
    Router, Json,
};
use serde::{Deserialize, Serialize};
use oauth2::{
    AuthorizationCode, AuthUrl, ClientId, ClientSecret, CsrfToken, RedirectUrl,
    Scope, TokenResponse, TokenUrl,
    basic::BasicClient, reqwest::async_http_client,
};
use uuid::Uuid;
use chrono::{Duration, Utc};
use crate::{
    error::{AppError, Result},
    middleware::{session::SESSION_COOKIE_NAME, SessionUser},
    modules::AppState,
};

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/google", get(google_auth_start))
        .route("/google/callback", get(google_auth_callback))
        .route("/logout", post(logout))
        .with_state(state)
}

#[derive(Debug, Deserialize)]
struct AuthCallbackQuery {
    code: String,
    #[allow(dead_code)]
    state: String,
}

#[derive(Debug, Serialize)]
struct AuthResponse {
    success: bool,
    user_id: Option<Uuid>,
    error: Option<String>,
}

async fn google_auth_start(
    State(state): State<AppState>,
) -> Result<Redirect> {
    let client = create_oauth_client(&state)?;

    let (auth_url, _csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("email".to_string()))
        .add_scope(Scope::new("profile".to_string()))
        .url();

    Ok(Redirect::to(auth_url.as_str()))
}

async fn google_auth_callback(
    State(state): State<AppState>,
    Query(params): Query<AuthCallbackQuery>,
) -> Result<Response> {
    let client = create_oauth_client(&state)?;

    let token_result = client
        .exchange_code(AuthorizationCode::new(params.code))
        .request_async(async_http_client)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("OAuth exchange failed: {}", e)))?;

    let user_info = fetch_google_user_info(token_result.access_token().secret()).await?;
    let user = get_or_create_user(&state, &user_info).await?;
    let session_id = create_session(&state, user.id).await?;

    // Build Set-Cookie header: HttpOnly, SameSite=Lax, 30 days
    let cookie_value = format!(
        "{}={}; Path=/; HttpOnly; SameSite=Lax; Max-Age={}",
        SESSION_COOKIE_NAME,
        session_id,
        30 * 24 * 3600,
    );

    let redirect_url = format!("{}/dashboard", state.config.frontend_url);
    let response = (
        [(
            header::SET_COOKIE,
            HeaderValue::from_str(&cookie_value)
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Cookie header error: {}", e)))?,
        )],
        Redirect::to(&redirect_url),
    )
        .into_response();

    Ok(response)
}

async fn logout(
    State(state): State<AppState>,
    session_user: SessionUser,
) -> Result<Response> {
    sqlx::query("DELETE FROM user_sessions WHERE id = $1")
        .bind(session_user.session_id)
        .execute(&state.db.pool)
        .await?;

    // Clear the cookie by setting Max-Age=0
    let cookie_value = format!(
        "{}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        SESSION_COOKIE_NAME
    );

    let response = (
        [(
            header::SET_COOKIE,
            HeaderValue::from_str(&cookie_value)
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Cookie header error: {}", e)))?,
        )],
        Json(AuthResponse {
            success: true,
            user_id: None,
            error: None,
        }),
    )
        .into_response();

    Ok(response)
}

fn create_oauth_client(state: &AppState) -> Result<BasicClient> {
    Ok(BasicClient::new(
        ClientId::new(state.config.google_oauth.client_id.clone()),
        Some(ClientSecret::new(state.config.google_oauth.client_secret.clone())),
        AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid auth URL: {}", e)))?,
        Some(
            TokenUrl::new("https://oauth2.googleapis.com/token".to_string())
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid token URL: {}", e)))?,
        ),
    )
    .set_redirect_uri(
        RedirectUrl::new(state.config.google_oauth.redirect_url.clone())
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid redirect URL: {}", e)))?,
    ))
}

#[derive(Debug, Deserialize)]
struct GoogleUserInfo {
    sub: String,
    email: String,
    name: Option<String>,
}

async fn fetch_google_user_info(access_token: &str) -> Result<GoogleUserInfo> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch user info: {}", e)))?;

    response
        .json::<GoogleUserInfo>()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse user info: {}", e)))
}

#[derive(Debug, sqlx::FromRow)]
struct User {
    id: Uuid,
    #[allow(dead_code)]
    email: String,
}

async fn get_or_create_user(state: &AppState, user_info: &GoogleUserInfo) -> Result<User> {
    let existing_user = sqlx::query_as::<_, User>(
        "SELECT id, email FROM users WHERE google_id = $1",
    )
    .bind(&user_info.sub)
    .fetch_optional(&state.db.pool)
    .await?;

    if let Some(user) = existing_user {
        sqlx::query("UPDATE users SET last_login_at = NOW() WHERE id = $1")
            .bind(user.id)
            .execute(&state.db.pool)
            .await?;
        return Ok(user);
    }

    let user_id = Uuid::new_v4();

    sqlx::query(
        "INSERT INTO users (id, google_id, email, created_at, last_login_at)
         VALUES ($1, $2, $3, NOW(), NOW())",
    )
    .bind(user_id)
    .bind(&user_info.sub)
    .bind(&user_info.email)
    .execute(&state.db.pool)
    .await?;

    let display_name = user_info
        .name
        .clone()
        .unwrap_or_else(|| user_info.email.split('@').next().unwrap_or("User").to_string());

    sqlx::query(
        "INSERT INTO user_profiles (user_id, display_name, created_at)
         VALUES ($1, $2, NOW())",
    )
    .bind(user_id)
    .bind(&display_name)
    .execute(&state.db.pool)
    .await?;

    // Give 1,000 virtual coins on signup (100000 with 2 decimal places)
    sqlx::query(
        "INSERT INTO wallets (user_id, balance, updated_at)
         VALUES ($1, $2, NOW())",
    )
    .bind(user_id)
    .bind(rust_decimal::Decimal::new(100000, 2))
    .execute(&state.db.pool)
    .await?;

    let wallet_id: Uuid = sqlx::query_scalar("SELECT id FROM wallets WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(&state.db.pool)
        .await?;

    sqlx::query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, created_at)
         VALUES ($1, $2, $3, NOW())",
    )
    .bind(wallet_id)
    .bind(rust_decimal::Decimal::new(100000, 2))
    .bind("initial")
    .execute(&state.db.pool)
    .await?;

    Ok(User {
        id: user_id,
        email: user_info.email.clone(),
    })
}

async fn create_session(state: &AppState, user_id: Uuid) -> Result<Uuid> {
    let session_id = Uuid::new_v4();
    let expires_at = Utc::now() + Duration::days(30);

    sqlx::query(
        "INSERT INTO user_sessions (id, user_id, expires_at, created_at)
         VALUES ($1, $2, $3, NOW())",
    )
    .bind(session_id)
    .bind(user_id)
    .bind(expires_at.naive_utc())
    .execute(&state.db.pool)
    .await?;

    Ok(session_id)
}
