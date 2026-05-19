# 🚀 StonkSchool Backend - Quick Start Guide

## What You're Building

The StonkSchool backend is a **fantasy trading platform** where users:
- Learn trading through market replays
- Practice with virtual money (paper trading)
- Compete in skill-based contests using real market data
- **No real money trading involved**

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (React/Next)  │
└────────┬────────┘
         │ HTTPS/WebSocket
         ▼
┌─────────────────────────────────────┐
│   StonkSchool Backend (Rust/Axum)  │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐         │
│  │  Auth   │  │  Wallet  │         │
│  └─────────┘  └──────────┘         │
│  ┌─────────┐  ┌──────────┐         │
│  │ Contests│  │  Replay  │         │
│  └─────────┘  └──────────┘         │
│  ┌─────────┐  ┌──────────┐         │
│  │  Market │  │WebSocket │         │
│  │  Data   │  │ Gateway  │         │
│  └─────────┘  └──────────┘         │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌──────────────┐     ┌─────────────┐
    │  PostgreSQL  │     │  zerodha-ss │
    │   Database   │     │  (Live Data)│
    └──────────────┘     └─────────────┘
```

## 📋 Prerequisites Checklist

- [x] Rust 1.75+ installed (`rustup` recommended)
- [x] PostgreSQL 14+ running locally
- [x] Google OAuth credentials (see setup below)
- [x] Git (to clone zerodha-ss)

## 🔧 Setup Steps

### 1. Install Rust (if needed)

```powershell
# Download and install from https://rustup.rs/
# Or use:
winget install Rustlang.Rustup
```

### 2. Setup PostgreSQL

```powershell
# Install PostgreSQL (Windows)
winget install PostgreSQL.PostgreSQL

# Start PostgreSQL service
net start postgresql-x64-14

# Create database
psql -U postgres
CREATE DATABASE stonkschool;
\q
```

### 3. Configure Environment

```powershell
cd H:\Projects\Newprojects\stonkschool\backend
cp .env.example .env
```

Edit `.env` file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/stonkschool
PORT=3000

# Get these from Google Cloud Console (see below)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/v1/auth/google/callback

# Generate a random string (at least 32 chars)
SESSION_SECRET=generate_a_very_long_random_string_here

FRONTEND_URL=http://localhost:5173
RUST_LOG=debug
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "StonkSchool"
3. Enable APIs:
   - Google+ API
   - Google OAuth2 API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/v1/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

### 5. Build the Project

```powershell
cd backend
cargo build
```

This will:
- Download all Rust dependencies (~5-10 minutes first time)
- Compile the entire project
- Link with zerodha-ss library

### 6. Run Database Migrations

Migrations run automatically on first startup, but you can check:

```powershell
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate run
```

### 7. Start the Server

```powershell
cargo run
```

You should see:
```
Starting StonkSchool Backend...
Configuration loaded
Database connected and migrations applied
Server listening on 0.0.0.0:3000
```

## 🧪 Testing the API

### Health Check

```powershell
curl http://localhost:3000/health
# Expected: OK
```

### Start OAuth Flow

Open in browser:
```
http://localhost:3000/api/v1/auth/google
```

This will redirect you to Google login.

### Test Assets Endpoint

```powershell
curl http://localhost:3000/api/v1/assets
# Expected: [] (empty initially, need to seed data)
```

## 📊 Seeding Initial Data

Create a seed script or use SQL directly:

```sql
-- Connect to database
psql -U postgres -d stonkschool

-- Insert sample assets
INSERT INTO assets (id, symbol, name, asset_type, exchange, is_active) VALUES
  (gen_random_uuid(), 'BTC', 'Bitcoin', 'crypto', 'BINANCE', true),
  (gen_random_uuid(), 'ETH', 'Ethereum', 'crypto', 'BINANCE', true),
  (gen_random_uuid(), 'NIFTY50', 'Nifty 50 Index', 'index', 'NSE', true),
  (gen_random_uuid(), 'INFY', 'Infosys', 'equity', 'NSE', true);

-- Insert sample contest
INSERT INTO contests (id, title, track, entry_fee, virtual_capital, start_time, end_time, status) VALUES
  (gen_random_uuid(), 'BTC Daily Sprint', 'crypto', 50, 100000, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '25 hours', 'upcoming');

-- Link assets to contest
INSERT INTO contest_assets (id, contest_id, asset_id)
SELECT gen_random_uuid(), c.id, a.id
FROM contests c, assets a
WHERE c.title = 'BTC Daily Sprint' AND a.symbol IN ('BTC', 'ETH');
```

## 🔌 Using zerodha-ss for Live Data

The backend integrates the `zerodha-ss` library for real-time market data. To use it:

1. **Get Zerodha API credentials** (if using live data):
   - Sign up at [Zerodha Kite Connect](https://kite.trade/)
   - Get API key and access token

2. **Add to .env**:
   ```env
   KITE_API_KEY=your_api_key
   KITE_ACCESS_TOKEN=your_access_token
   ```

3. **Run market data ingester** (optional background service):
   ```powershell
   cargo run --bin market-data-ingester
   ```

This will stream live price data and populate the `market_prices` table.

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.rs              ← Entry point, starts Axum server
│   ├── config.rs            ← Environment config
│   ├── db.rs                ← PostgreSQL connection pool
│   ├── error.rs             ← Centralized error handling
│   ├── modules/             ← Feature modules
│   │   ├── auth.rs          ← Google OAuth
│   │   ├── users.rs         ← User profiles
│   │   ├── wallet.rs        ← Virtual coin wallet
│   │   ├── contests.rs      ← Contest management
│   │   ├── replay.rs        ← Market replay
│   │   └── websocket.rs     ← Real-time updates
│   └── services/            ← Background services
│       └── market_data_ingester.rs  ← zerodha-ss integration
├── migrations/              ← SQL schema migrations
├── Cargo.toml              ← Dependencies
├── .env                    ← Configuration
└── README.md               ← Full documentation
```

## 🧪 Development Workflow

### Running Tests

```powershell
cargo test
```

### Check Code Quality

```powershell
# Format code
cargo fmt

# Lint
cargo clippy
```

### Watch Mode (auto-reload on changes)

```powershell
cargo install cargo-watch
cargo watch -x run
```

## 📚 Next Steps

1. **Build the Frontend** - Connect React/Next.js app to this backend
2. **Implement Session Middleware** - Add cookie-based auth extraction
3. **Contest Execution Engine** - Build real-time portfolio calculation
4. **Admin Panel** - Create APIs for contest management
5. **Deploy** - See DevOps document for deployment guide

## 🐛 Common Issues

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <pid> /F
```

### Database Connection Failed

```powershell
# Check if PostgreSQL is running
net start postgresql-x64-14

# Test connection
psql -U postgres -d stonkschool -c "SELECT 1"
```

### Compilation Errors

```powershell
# Clean and rebuild
cargo clean
cargo build
```

## 📖 Documentation

- [Full Backend README](README.md)
- [API Specification](../stonkschool/Documents/API_Specification_Document.md)
- [Database Design](../stonkschool/Documents/Database_Design_Document.md)
- [Architecture](../stonkschool/Documents/Component_Architecture_Document.md)

## 🆘 Getting Help

Check the documentation in `../stonkschool/Documents/` for:
- MVP Vision
- Feature Requirements
- State Machine Diagrams
- Sequence Diagrams

---

**Ready to code!** 🎉 Start the server and begin building features following the FRD and Architecture docs.
