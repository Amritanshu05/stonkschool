use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
    response::{IntoResponse, Response},
};
use cookie::Cookie;
use uuid::Uuid;
use chrono::Utc;
use crate::{error::AppError, modules::AppState};

pub const SESSION_COOKIE_NAME: &str = "stonkschool_session";

/// Authenticated user extracted from session cookie.
/// Use as a handler extractor to require authentication.
#[derive(Debug, Clone)]
pub struct SessionUser {
    pub user_id: Uuid,
    pub session_id: Uuid,
}

#[async_trait]
impl FromRequestParts<AppState> for SessionUser {
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // Extract the Cookie header
        let cookie_header = parts
            .headers
            .get(axum::http::header::COOKIE)
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        // Find our session cookie
        let session_id_str = cookie_header
            .split(';')
            .filter_map(|s| Cookie::parse(s.trim()).ok())
            .find(|c| c.name() == SESSION_COOKIE_NAME)
            .map(|c| c.value().to_string());

        let session_id_str = match session_id_str {
            Some(s) => s,
            None => return Err(AppError::Unauthorized.into_response()),
        };

        let session_id = match Uuid::parse_str(&session_id_str) {
            Ok(id) => id,
            Err(_) => return Err(AppError::Unauthorized.into_response()),
        };

        // Look up session in database
        #[derive(sqlx::FromRow)]
        struct SessionRow {
            user_id: Uuid,
            expires_at: chrono::NaiveDateTime,
        }

        let session = sqlx::query_as::<_, SessionRow>(
            "SELECT user_id, expires_at FROM user_sessions WHERE id = $1",
        )
        .bind(session_id)
        .fetch_optional(&state.db.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("DB error: {}", e)).into_response())?;

        let session = match session {
            Some(s) => s,
            None => return Err(AppError::Unauthorized.into_response()),
        };

        // Check expiry
        let now = Utc::now().naive_utc();
        if session.expires_at < now {
            // Clean up expired session
            let _ = sqlx::query("DELETE FROM user_sessions WHERE id = $1")
                .bind(session_id)
                .execute(&state.db.pool)
                .await;
            return Err(AppError::Unauthorized.into_response());
        }

        Ok(SessionUser {
            user_id: session.user_id,
            session_id,
        })
    }
}
