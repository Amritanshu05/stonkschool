# ==============================================================================
# Build Stage
# ==============================================================================
FROM rust:1.80-bookworm AS builder

WORKDIR /app

# Enable SQLx offline compilation
ENV SQLX_OFFLINE=true

# Copy the local vendored dependency first (context is repo root)
COPY zerodha-ss ./zerodha-ss

# Copy backend manifests
COPY backend/Cargo.toml backend/Cargo.lock ./backend/

# Create a dummy main file to compile and cache dependencies
RUN mkdir -p backend/src && \
    echo "fn main() { println!(\"dummy\"); }" > backend/src/main.rs

# Build dependencies in release mode (this layer will be cached unless dependencies change)
WORKDIR /app/backend
RUN cargo build --release
RUN rm -rf src

# Copy SQLx offline queries metadata
COPY backend/.sqlx ./.sqlx

# Copy migrations and database seed file
COPY backend/migrations ./migrations
COPY backend/seed.sql ./seed.sql

# Copy actual source code
COPY backend/src ./src

# Force compiler to rebuild main binary by touching the file
RUN touch src/main.rs
RUN cargo build --release

# ==============================================================================
# Runtime Stage
# ==============================================================================
FROM debian:bookworm-slim

# Install system dependencies (SSL certificates, Postgres libraries)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    libpq5 && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root system user for security
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh -m appuser

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/backend/target/release/stonkschool-backend /usr/local/bin/

# Copy migrations and seed.sql to runtime directory in case they are needed
COPY --from=builder /app/backend/migrations ./migrations
COPY --from=builder /app/backend/seed.sql ./seed.sql

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Run the app as non-root user
USER appuser

# Expose server port (respecting dynamic PORT injection on Railway)
EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["stonkschool-backend"]
