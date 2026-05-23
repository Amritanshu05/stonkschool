# 🚀 StonkSchool Production Deployment Guide

**Last Updated:** January 11, 2026  
**Status:** Backend compiles ✅ | Ready for database + API setup ⚠️

---

## 📋 Prerequisites Checklist

Before deploying to production, ensure you have:

- [ ] ✅ **Backend compiles** (already done - January 2026)
- [ ] 🔑 **Zerodha Kite Connect Account** (for live market data)
- [ ] 🗄️ **PostgreSQL 14+** installed and accessible
- [ ] 🔐 **Google OAuth credentials** (for user authentication)
- [ ] ☁️ **Production server** (Cloud VM or container platform)
- [ ] 🌐 **Domain name** (optional but recommended)
- [ ] 📧 **Email service** (for notifications - future)

---

## 🔑 Step 1: Zerodha Kite Connect Setup

### 1.1 Create Kite Connect Account

1. **Visit:** https://kite.trade/
2. **Sign up** for Kite Connect Developer account
3. **Pricing:** Check current pricing (₹2000/month as of 2024)

### 1.2 Create Application

1. Go to **Kite Connect Developer Console**
2. Click **"Create New App"**
3. Fill in details:
   - **App Name:** StonkSchool
   - **App Type:** Connect
   - **Redirect URL:** `https://yourdomain.com/api/v1/auth/kite/callback`
   - **Webhook URL:** (optional) `https://yourdomain.com/api/v1/webhooks/kite`

### 1.3 Get API Credentials

After app creation, you'll receive:
- **API Key** (e.g., `abc123xyz`)
- **API Secret** (e.g., `def456uvw`)

**⚠️ CRITICAL:** Keep these credentials secure!

### 1.4 Generate Access Token

Zerodha access tokens **expire daily** and require manual login flow:

```bash
# Step 1: Generate login URL
https://kite.zerodha.com/connect/login?api_key=YOUR_API_KEY&v=3

# Step 2: User logs in → redirected to your callback with request_token

# Step 3: Exchange request_token for access_token
curl -X POST "https://api.kite.trade/session/token" \
  -d "api_key=YOUR_API_KEY" \
  -d "request_token=RECEIVED_REQUEST_TOKEN" \
  -d "checksum=SHA256(api_key+request_token+api_secret)"

# Response:
{
  "access_token": "xyz789abc",
  "refresh_token": null  // Zerodha doesn't provide refresh tokens
}
```

**📝 Note:** You'll need to implement automated token refresh (see Step 7)

### 1.5 Test Connection

```bash
# Verify token works
curl "https://api.kite.trade/user/profile" \
  -H "X-Kite-Version: 3" \
  -H "Authorization: token YOUR_API_KEY:YOUR_ACCESS_TOKEN"
```

---

## 🗄️ Step 2: PostgreSQL Database Setup

### 2.1 Production Database Installation

**Option A: Managed Database (Recommended)**
```bash
# AWS RDS PostgreSQL
# - Automated backups
# - High availability
# - Scaling
# - Pricing: ~$15-50/month

# DigitalOcean Managed PostgreSQL
# - Similar features
# - Pricing: ~$15/month for basic

# Render.com PostgreSQL
# - Free tier available
# - Good for testing
```

**Option B: Self-Hosted**
```bash
# Ubuntu Server
sudo apt update
sudo apt install postgresql-14 postgresql-contrib

# Configure for remote access
sudo nano /etc/postgresql/14/main/postgresql.conf
# Uncomment: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### 2.2 Create Database

```bash
# Connect as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE stonkschool;
CREATE USER stonkschool_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE stonkschool TO stonkschool_user;

# For PostgreSQL 15+, also grant schema privileges
\c stonkschool
GRANT ALL ON SCHEMA public TO stonkschool_user;
```

### 2.3 Configure Connection String

```bash
# Format:
DATABASE_URL=postgresql://username:password@host:port/database

# Example (local):
DATABASE_URL=postgresql://stonkschool_user:password@localhost:5432/stonkschool

# Example (managed):
DATABASE_URL=postgresql://stonkschool_user:password@db.example.com:5432/stonkschool

# Example (AWS RDS):
DATABASE_URL=postgresql://admin:password@stonkschool.abc123.us-east-1.rds.amazonaws.com:5432/stonkschool
```

### 2.4 Run Migrations

```bash
cd backend

# Install sqlx-cli (one-time)
cargo install sqlx-cli --no-default-features --features postgres

# Run all migrations
export DATABASE_URL="postgresql://user:pass@host:5432/stonkschool"
sqlx migrate run

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

**Expected output:**
```
 users
 user_profiles
 user_sessions
 wallets
 wallet_transactions
 assets
 market_prices
 replay_sessions
 replay_trades
 contests
 contest_participants
 contest_allocations
 contest_assets
 contest_leaderboard
```

### 2.5 Seed Initial Data

```bash
# Add sample assets for testing
psql $DATABASE_URL -f seed.sql

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM assets;"
```

---

## 🔐 Step 3: Google OAuth Setup

### 3.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. **Create New Project** → "StonkSchool"
3. **Enable APIs:**
   - Google+ API
   - People API

### 3.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in:
   - **App name:** StonkSchool
   - **User support email:** your-email@example.com
   - **Authorized domains:** yourdomain.com
   - **Developer contact:** your-email@example.com
4. **Scopes:** Add `email`, `profile`, `openid`
5. **Test users:** Add your email for testing

### 3.3 Create OAuth Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Choose **Web application**
3. Add:
   - **Authorized JavaScript origins:** `https://yourdomain.com`
   - **Authorized redirect URIs:** `https://yourdomain.com/api/v1/auth/google/callback`
4. **Save** and note down:
   - **Client ID** (e.g., `123456.apps.googleusercontent.com`)
   - **Client Secret** (e.g., `GOCSPX-abc123xyz`)

---

## ⚙️ Step 4: Environment Configuration

### 4.1 Create Production `.env`

```bash
cd backend
cp .env.example .env
nano .env
```

### 4.2 Configure All Variables

```bash
# Server
HOST=0.0.0.0
PORT=8080
RUST_LOG=info

# Database
DATABASE_URL=postgresql://stonkschool_user:STRONG_PASSWORD@db.example.com:5432/stonkschool

# Google OAuth
GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/auth/google/callback

# Zerodha Kite
KITE_API_KEY=your_kite_api_key
KITE_ACCESS_TOKEN=your_daily_access_token

# Security
SESSION_SECRET=generate_random_64_char_string_here
FRONTEND_URL=https://yourdomain.com

# Optional: Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn
```

### 4.3 Generate Secure Secrets

```bash
# Generate SESSION_SECRET (64 chars)
openssl rand -hex 32

# Or in PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🐳 Step 5: Docker Deployment (Recommended)

### 5.1 Create Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
# Build stage
FROM rust:1.75-bookworm as builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./
COPY ../zerodha-ss ../zerodha-ss

# Copy source
COPY src ./src
COPY migrations ./migrations

# Build release binary
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y \
    ca-certificates \
    libssl3 \
    libpq5 && \
    rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/target/release/stonkschool-backend /usr/local/bin/

# Copy migrations
COPY --from=builder /app/migrations /app/migrations

WORKDIR /app

EXPOSE 8080

CMD ["stonkschool-backend"]
```

### 5.2 Create Docker Compose

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://stonkschool:${DB_PASSWORD}@db:5432/stonkschool
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      KITE_API_KEY: ${KITE_API_KEY}
      KITE_ACCESS_TOKEN: ${KITE_ACCESS_TOKEN}
      SESSION_SECRET: ${SESSION_SECRET}
      RUST_LOG: info
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - stonkschool

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: stonkschool
      POSTGRES_USER: stonkschool
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - stonkschool
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U stonkschool"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - stonkschool

volumes:
  postgres_data:

networks:
  stonkschool:
    driver: bridge
```

### 5.3 Create Nginx Config

**File:** `nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            return 301 https://$host$request_uri;
        }

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /ws {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

### 5.4 Deploy with Docker

```bash
# Create .env file with secrets
cat > .env << EOF
DB_PASSWORD=your_secure_db_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KITE_API_KEY=your_kite_api_key
KITE_ACCESS_TOKEN=your_kite_access_token
SESSION_SECRET=your_64_char_secret
EOF

# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend sqlx migrate run

# Check status
docker-compose ps
```

---

## 🖥️ Step 6: Traditional Server Deployment

### 6.1 Prepare Ubuntu Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y \
  build-essential \
  pkg-config \
  libssl-dev \
  libpq-dev \
  postgresql-client \
  curl \
  git
```

### 6.2 Install Rust

```bash
# Install rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Verify
rustc --version
```

### 6.3 Clone and Build

```bash
# Clone repository
git clone https://github.com/yourusername/stonkschool.git
cd stonkschool/backend

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Build release binary
cargo build --release

# Binary location: target/release/stonkschool-backend
```

### 6.4 Create Systemd Service

**File:** `/etc/systemd/system/stonkschool.service`

```ini
[Unit]
Description=StonkSchool Backend API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=stonkschool
Group=stonkschool
WorkingDirectory=/opt/stonkschool
EnvironmentFile=/opt/stonkschool/.env
ExecStart=/opt/stonkschool/stonkschool-backend
Restart=always
RestartSec=10

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/stonkschool/logs

[Install]
WantedBy=multi-user.target
```

### 6.5 Deploy Application

```bash
# Create deployment directory
sudo mkdir -p /opt/stonkschool
sudo chown stonkschool:stonkschool /opt/stonkschool

# Copy files
sudo cp target/release/stonkschool-backend /opt/stonkschool/
sudo cp .env /opt/stonkschool/
sudo cp -r migrations /opt/stonkschool/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable stonkschool
sudo systemctl start stonkschool

# Check status
sudo systemctl status stonkschool

# View logs
sudo journalctl -u stonkschool -f
```

---

## 🔄 Step 7: Automated Token Refresh

### 7.1 Create Token Refresh Script

**File:** `/opt/stonkschool/scripts/refresh_kite_token.sh`

```bash
#!/bin/bash
set -e

LOG_FILE="/opt/stonkschool/logs/token_refresh.log"
ENV_FILE="/opt/stonkschool/.env"

echo "[$(date)] Starting token refresh..." >> "$LOG_FILE"

# TODO: Implement Kite login automation
# This requires handling their login flow programmatically
# Options:
# 1. Selenium/Puppeteer automation
# 2. Manual daily login via cron alert
# 3. Third-party token management service

# For now, send alert to refresh manually
echo "[$(date)] MANUAL ACTION REQUIRED: Refresh Kite token" >> "$LOG_FILE"
# Send email/Slack notification

# Future: Implement automated flow
# NEW_TOKEN=$(your_automation_script)
# sed -i "s/KITE_ACCESS_TOKEN=.*/KITE_ACCESS_TOKEN=$NEW_TOKEN/" "$ENV_FILE"
# systemctl restart stonkschool

echo "[$(date)] Token refresh check complete" >> "$LOG_FILE"
```

### 7.2 Schedule Daily Refresh

```bash
# Make executable
chmod +x /opt/stonkschool/scripts/refresh_kite_token.sh

# Add cron job (run at 7 AM IST daily, before market opens)
crontab -e

# Add:
0 7 * * * /opt/stonkschool/scripts/refresh_kite_token.sh
```

---

## 📊 Step 8: Market Data Configuration

### 8.1 Update Instrument Mappings

**File:** `backend/src/services/market_data_ingester.rs`

Download instrument list:
```bash
curl -o instruments.csv "https://api.kite.trade/instruments"
```

Update code (lines 50-65):
```rust
let instrument_token = match asset.symbol.as_str() {
    // NSE Equity
    "RELIANCE" => 738561,
    "TCS" => 2953217,
    "INFY" => 408065,
    "HDFC" => 1333569,
    "ICICIBANK" => 1270529,
    
    // NSE Indices
    "NIFTY50" => 256265,
    "BANKNIFTY" => 260105,
    "NIFTYIT" => 261369,
    
    // Add more from instruments.csv
    _ => {
        tracing::warn!("Unmapped symbol: {}", asset.symbol);
        continue;
    }
};
```

### 8.2 Start Market Data Ingester

Add to `main.rs` (after server setup):

```rust
// Start market data ingester
let market_ingester = MarketDataIngester::new(
    pool.clone(),
    config.kite_api_key.clone(),
    config.kite_access_token.clone(),
);

// Load mappings from DB
market_ingester.load_asset_mappings().await?;

// Get instruments to track
let instruments: Vec<u32> = vec![
    256265,  // NIFTY50
    738561,  // RELIANCE
    408065,  // INFY
    2953217, // TCS
    // Add all instruments from config
];

// Start streaming in background
tokio::spawn(async move {
    loop {
        tracing::info!("Starting market data stream...");
        if let Err(e) = market_ingester.start_streaming(instruments.clone()).await {
            tracing::error!("Market data stream error: {}", e);
            // Reconnect after 5 seconds
            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
        }
    }
});
```

---

## 🔍 Step 9: Monitoring & Observability

### 9.1 Setup Logging

```bash
# Create log directory
sudo mkdir -p /var/log/stonkschool
sudo chown stonkschool:stonkschool /var/log/stonkschool

# Update systemd service
sudo nano /etc/systemd/system/stonkschool.service

# Add:
Environment="RUST_LOG=info"
StandardOutput=append:/var/log/stonkschool/stdout.log
StandardError=append:/var/log/stonkschool/stderr.log
```

### 9.2 Setup Log Rotation

**File:** `/etc/logrotate.d/stonkschool`

```
/var/log/stonkschool/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 stonkschool stonkschool
}
```

### 9.3 Health Checks

Create health check endpoint (add to `main.rs`):

```rust
async fn health_check() -> &'static str {
    "OK"
}

// Add route
.route("/health", get(health_check))
```

### 9.4 Monitoring Tools

**Option A: Simple uptime monitoring**
- UptimeRobot (free)
- Ping health endpoint every 5 minutes

**Option B: Full observability (Recommended for production)**
```bash
# Prometheus metrics
# Add to Cargo.toml:
# prometheus = "0.13"
# axum-prometheus = "0.4"

# Grafana dashboards
# Sentry for error tracking
```

---

## 🧪 Step 10: Production Testing

### 10.1 API Testing

```bash
# Health check
curl https://yourdomain.com/health

# Auth flow
curl https://yourdomain.com/api/v1/auth/google

# List contests (after auth)
curl -H "Cookie: session=YOUR_SESSION" \
  https://yourdomain.com/api/v1/contests

# WebSocket test
wscat -c wss://yourdomain.com/ws/contest/CONTEST_ID
```

### 10.2 Load Testing

```bash
# Install wrk
sudo apt install wrk

# Run load test
wrk -t4 -c100 -d30s https://yourdomain.com/api/v1/contests
```

### 10.3 Database Monitoring

```sql
-- Check market data ingestion
SELECT 
    a.symbol,
    COUNT(*) as price_records,
    MAX(mp.timestamp) as latest_update
FROM market_prices mp
JOIN assets a ON mp.asset_id = a.id
WHERE mp.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY a.symbol;

-- Active contests
SELECT COUNT(*) FROM contests WHERE status = 'live';

-- User activity
SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours';
```

---

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql "$DATABASE_URL"

# Check if service can reach DB
telnet db-host 5432
```

### Kite API Issues

```bash
# Verify token
curl "https://api.kite.trade/user/profile" \
  -H "X-Kite-Version: 3" \
  -H "Authorization: token API_KEY:ACCESS_TOKEN"

# Check rate limits (3 req/sec for quote APIs)
```

### WebSocket Not Working

```bash
# Check nginx config for WebSocket upgrade
# Verify firewall allows WSS (443)
# Check backend logs for connection errors
```

---

## 📈 Production Checklist

- [ ] ✅ Backend compiles successfully
- [ ] 🔑 Zerodha Kite API credentials obtained
- [ ] 🗄️ PostgreSQL database deployed and migrated
- [ ] 🔐 Google OAuth configured
- [ ] ⚙️ All environment variables set
- [ ] 🐳 Application deployed (Docker or systemd)
- [ ] 🔄 Token refresh automation configured
- [ ] 📊 Market data ingester activated
- [ ] 🔍 Monitoring and logging set up
- [ ] 🧪 Load testing completed
- [ ] 🌐 Domain and SSL configured
- [ ] 📧 Alert system for critical failures
- [ ] 💾 Backup strategy implemented
- [ ] 📖 Documentation updated

---

## 🎉 Launch Ready!

Your StonkSchool backend is now production-ready with:
- ✅ Real-time market data from Zerodha
- ✅ Scalable architecture
- ✅ Secure authentication
- ✅ Monitoring and logging
- ✅ Automated recovery

**Next:** Build the frontend and start onboarding users! 🚀
