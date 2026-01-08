use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Authentication failed")]
    Unauthorized,

    #[error("Resource not found")]
    NotFound,

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Payment required: {0}")]
    PaymentRequired(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Internal server error")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_code, message) = match self {
            AppError::Database(ref e) => {
                tracing::error!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "DB_ERROR", self.to_string())
            }
            AppError::Unauthorized => {
                (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", self.to_string())
            }
            AppError::NotFound => {
                (StatusCode::NOT_FOUND, "NOT_FOUND", self.to_string())
            }
            AppError::Validation(ref msg) => {
                (StatusCode::BAD_REQUEST, "VALIDATION_ERROR", msg.clone())
            }
            AppError::Conflict(ref msg) => {
                (StatusCode::CONFLICT, "CONFLICT", msg.clone())
            }
            AppError::PaymentRequired(ref msg) => {
                (StatusCode::PAYMENT_REQUIRED, "PAYMENT_REQUIRED", msg.clone())
            }
            AppError::Forbidden(ref msg) => {
                (StatusCode::FORBIDDEN, "FORBIDDEN", msg.clone())
            }
            AppError::Internal(ref e) => {
                tracing::error!("Internal error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Internal server error".to_string())
            }
        };

        let body = Json(json!({
            "success": false,
            "error": error_code,
            "message": message,
        }));

        (status, body).into_response()
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
