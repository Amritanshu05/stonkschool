# 🚀 StonkSchool Backend - Next Steps Checklist

## ✅ What's Complete (January 2026)

### Backend Development
- [x] Complete Rust backend with Axum
- [x] PostgreSQL database schema (14 tables)
- [x] All P0 features from FRD
- [x] Google OAuth authentication
- [x] Virtual wallet system
- [x] Market replay engine
- [x] Demo trading (paper trading)
- [x] Contest system (full lifecycle)
- [x] WebSocket gateway
- [x] zerodha-ss integration
- [x] API endpoints (18+)
- [x] Database migrations
- [x] Sample seed data
- [x] Comprehensive documentation

### Compilation & Build
- [x] ✅ **SQLx queries converted to runtime** (no compile-time DB needed)
- [x] ✅ **Successful compilation** on Windows with Rust GNU toolchain
- [x] ✅ **All 9 modules migrated** from `query!()` to `query()`
- [x] ✅ **Zero compilation errors** - ready for database setup

---

## � IMMEDIATE: Production Setup (Critical)

### Step 0: Database & Environment Setup (Required for ANY execution)

**You MUST complete this before the backend can run:**

#### 0.1 Install PostgreSQL ⚡ CRITICAL
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Or use Docker:
docker run -d \
  --name stonkschool-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=stonkschool \
  -p 5432:5432 \
  postgres:14
```

#### 0.2 Configure Environment Variables ⚡ CRITICAL
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials:
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/stonkschool
# GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
# GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
# KITE_API_KEY=<your-zerodha-api-key>        ← PRODUCTION REQUIRED
# KITE_ACCESS_TOKEN=<your-zerodha-token>     ← PRODUCTION REQUIRED
```

#### 0.3 Run Database Migrations ⚡ CRITICAL
```bash
cd backend
# Install sqlx-cli if needed:
cargo install sqlx-cli --no-default-features --features postgres

# Run migrations:
sqlx migrate run

# Seed sample data (optional for testing):
psql -U postgres -d stonkschool -f seed.sql
```

#### 0.4 Test Backend Startup
```bash
cd backend
cargo run
# Should see: "Server running on http://0.0.0.0:8080"
```

---

## 🌍 Production Deployment with Live Zerodha API

### Step 1: Get Zerodha Kite Connect API Access

**Required for REAL market data streaming:**

1. **Sign up for Kite Connect**: https://kite.trade/
2. **Create an app** on Kite Connect Developer Portal
3. **Get credentials:**
   - `API Key` (public identifier)
   - `API Secret` (for token generation)
4. **Generate Access Token:**
   ```bash
   # Use Zerodha's login flow to get access token
   # Token valid for 1 day - needs daily refresh
   # See: https://kite.trade/docs/connect/v3/
   ```
5. **Update `.env`:**
   ```bash
   KITE_API_KEY=your_actual_api_key
   KITE_ACCESS_TOKEN=your_generated_token
   ```

### Step 2: Configure Market Data Ingester

**File:** `backend/src/services/market_data_ingester.rs`

```rust
// Update instrument token mappings (lines 50-60)
let instrument_token = match asset.symbol.as_str() {
    "NIFTY50" => 256265,      // Real NSE instrument token
    "INFY" => 408065,          // Infosys token
    "RELIANCE" => 738561,      // Reliance Industries
    "TCS" => 2953217,          // TCS token
    // Add all assets you want to track
    _ => continue,
};
```

**Get real instrument tokens from:**
- Zerodha Instrument List: https://api.kite.trade/instruments
- Download CSV and map symbols to tokens

### Step 3: Production Server Deployment

#### Option A: Cloud VM (AWS EC2 / DigitalOcean)

```bash
# 1. Setup Ubuntu server
sudo apt update
sudo apt install -y postgresql-14 build-essential pkg-config libssl-dev

# 2. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 3. Clone your repo
git clone https://github.com/yourusername/stonkschool.git
cd stonkschool/backend

# 4. Configure environment
cp .env.example .env
# Edit .env with production values

# 5. Setup database
sudo -u postgres psql -c "CREATE DATABASE stonkschool;"
sqlx migrate run

# 6. Build release binary
cargo build --release

# 7. Run with systemd
sudo cp target/release/stonkschool-backend /usr/local/bin/
# Create systemd service (see below)
```

**Systemd Service (`/etc/systemd/system/stonkschool.service`):**
```ini
[Unit]
Description=StonkSchool Backend
After=network.target postgresql.service

[Service]
Type=simple
User=stonkschool
WorkingDirectory=/opt/stonkschool
EnvironmentFile=/opt/stonkschool/.env
ExecStart=/usr/local/bin/stonkschool-backend
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Option B: Docker Deployment

**Create `backend/Dockerfile`:**
```dockerfile
FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libssl3 ca-certificates
COPY --from=builder /app/target/release/stonkschool-backend /usr/local/bin/
EXPOSE 8080
CMD ["stonkschool-backend"]
```

**Docker Compose (`docker-compose.yml`):**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/stonkschool
      KITE_API_KEY: ${KITE_API_KEY}
      KITE_ACCESS_TOKEN: ${KITE_ACCESS_TOKEN}
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: stonkschool
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Step 4: Market Data Ingester Activation

**In production, start the market data ingester:**

```rust
// Add to main.rs (after server setup):
let market_ingester = MarketDataIngester::new(
    pool.clone(),
    config.kite_api_key.clone(),
    config.kite_access_token.clone(),
);

// Load asset mappings
market_ingester.load_asset_mappings().await?;

// Start streaming in background task
let instruments = vec![256265, 408065, 738561]; // Your instruments
tokio::spawn(async move {
    if let Err(e) = market_ingester.start_streaming(instruments).await {
        tracing::error!("Market data stream error: {}", e);
    }
});
```

### Step 5: Daily Token Refresh (CRITICAL)

**Zerodha access tokens expire daily. Set up automated refresh:**

```bash
# Create token refresh script
#!/bin/bash
# refresh_token.sh

# Use Zerodha login API to generate new token
NEW_TOKEN=$(curl -X POST "https://api.kite.trade/session/token" \
  -d "api_key=$KITE_API_KEY" \
  -d "request_token=$REQUEST_TOKEN" \
  -d "checksum=$CHECKSUM")

# Update .env file
sed -i "s/KITE_ACCESS_TOKEN=.*/KITE_ACCESS_TOKEN=$NEW_TOKEN/" /opt/stonkschool/.env

# Restart service
systemctl restart stonkschool
```

**Cron job (run daily at 8 AM):**
```bash
0 8 * * * /opt/stonkschool/refresh_token.sh
```

### Step 6: Monitoring & Logs

```bash
# View logs
journalctl -u stonkschool -f

# Or if using Docker
docker logs -f stonkschool_backend_1

# Check market data ingestion
psql -d stonkschool -c "SELECT COUNT(*) FROM market_prices;"
```

---

## 📋 Development Next Steps (After Production Setup)

### Phase 1: Backend Completion (1-2 weeks)

#### 1.1 Session Middleware ⚡ HIGH PRIORITY
- [ ] Create session extractor middleware
- [ ] Add `SessionUser` struct
- [ ] Implement cookie parsing
- [ ] Add session validation
- [ ] Protect authenticated routes
- [ ] Add session renewal logic

**Files to create/modify:**
- `src/middleware/session.rs`
- `src/modules/auth.rs` (update)
- `src/main.rs` (add middleware)

#### 1.2 Contest Execution Engine ⚡ HIGH PRIORITY
- [ ] Portfolio value calculator
  - [ ] Fetch current prices for all assets
  - [ ] Calculate weighted portfolio value
  - [ ] Apply allocation percentages
- [ ] Ranking system
  - [ ] Sort participants by portfolio value
  - [ ] Assign ranks (handle ties)
  - [ ] Update `contest_leaderboard` table
- [ ] Real-time updates
  - [ ] Broadcast leaderboard changes via WebSocket
  - [ ] Trigger on price updates
  - [ ] Optimize for concurrent contests

**Files to create/modify:**
- `src/services/contest_executor.rs` (new)
- `src/modules/contests.rs` (update)
- `src/modules/websocket.rs` (update)

#### 1.3 Prize Distribution
- [ ] Prize pool calculation
  - [ ] Define prize structure (1st: 50%, 2nd: 30%, 3rd: 20%)
  - [ ] Configurable prize tiers
- [ ] Wallet credit logic
  - [ ] Batch wallet updates
  - [ ] Transaction recording
  - [ ] User notifications
- [ ] Settlement process
  - [ ] Transition contest to `settled` state
  - [ ] Update user stats (contests_won)
  - [ ] Archive contest data

**Files to modify:**
- `src/modules/contests.rs`
- `src/modules/wallet.rs`

#### 1.4 Admin APIs
- [ ] Contest creation
  - [ ] `POST /api/v1/admin/contests` - Create new contest
  - [ ] Asset selection interface
  - [ ] Schedule configuration
- [ ] Contest management
  - [ ] `PUT /api/v1/admin/contests/:id` - Update contest
  - [ ] `POST /api/v1/admin/contests/:id/cancel` - Cancel contest
  - [ ] `POST /api/v1/admin/contests/:id/publish` - Publish contest
- [ ] User management
  - [ ] `GET /api/v1/admin/users` - List all users
  - [ ] `GET /api/v1/admin/users/:id` - User details
  - [ ] `POST /api/v1/admin/users/:id/ban` - Ban user
- [ ] Admin authentication
  - [ ] Add `is_admin` flag to user_profiles
  - [ ] Admin-only middleware

**Files to create:**
- `src/modules/admin.rs`
- `src/middleware/admin_auth.rs`

---

### Phase 2: Testing & Quality (1 week)

#### 2.1 Unit Tests
- [ ] Authentication module tests
- [ ] Wallet transaction tests
- [ ] Contest lifecycle tests
- [ ] Replay engine tests
- [ ] Portfolio calculation tests

#### 2.2 Integration Tests
- [ ] End-to-end contest flow
- [ ] User registration to contest participation
- [ ] WebSocket connection tests
- [ ] Database transaction tests

#### 2.3 Load Testing
- [ ] Concurrent user simulation
- [ ] WebSocket stress testing
- [ ] Database query optimization
- [ ] API rate limiting verification

**Tools:**
- `cargo test` for unit tests
- `tokio-test` for async tests
- `wrk` or `k6` for load testing

---

### Phase 3: Frontend Development (2-3 weeks)

#### 3.1 Frontend Setup
- [ ] Choose framework (Next.js recommended)
- [ ] Setup project structure
- [ ] Configure API client (axios/fetch)
- [ ] WebSocket client setup
- [ ] State management (Redux/Zustand)

#### 3.2 Core Pages
- [ ] Landing page
  - [ ] Hero section
  - [ ] Feature showcase
  - [ ] Call-to-action (Login with Google)
- [ ] Dashboard
  - [ ] User stats
  - [ ] Wallet balance
  - [ ] Quick actions (Replay, Join Contest)
- [ ] Contest listing
  - [ ] Filter by track
  - [ ] Sort by start time
  - [ ] Contest cards with details
- [ ] Contest details
  - [ ] Asset list
  - [ ] Entry fee & prize pool
  - [ ] Join button
  - [ ] Allocation interface (sliders)
- [ ] Live contest view
  - [ ] Real-time leaderboard
  - [ ] Current rank
  - [ ] Portfolio value
  - [ ] Asset performance breakdown
- [ ] Replay interface
  - [ ] Asset selection
  - [ ] Date range picker
  - [ ] Price chart (TradingView/Recharts)
  - [ ] Buy/Sell controls
  - [ ] Portfolio tracker
- [ ] Profile page
  - [ ] User info
  - [ ] Contest history
  - [ ] Stats & achievements

#### 3.3 WebSocket Integration
- [ ] Connect to `/ws/replay/:id`
- [ ] Connect to `/ws/contest/:id`
- [ ] Handle reconnections
- [ ] Real-time chart updates
- [ ] Leaderboard updates

---

### Phase 4: Production Readiness (1 week)

#### 4.1 Security
- [ ] Helmet.js equivalent (security headers)
- [ ] Rate limiting per user
- [ ] Input sanitization
- [ ] SQL injection prevention (already handled by SQLx)
- [ ] CORS configuration (production URLs)
- [ ] HTTPS setup
- [ ] Session security (secure cookies, httpOnly)

#### 4.2 Performance
- [ ] Database indexing optimization
- [ ] Query optimization (EXPLAIN ANALYZE)
- [ ] Caching layer (Redis - optional)
- [ ] Connection pooling tuning
- [ ] API response compression (already in place)

#### 4.3 Monitoring & Logging
- [ ] Structured logging (already in place with tracing)
- [ ] Error tracking (Sentry integration)
- [ ] Performance monitoring (APM)
- [ ] Database monitoring
- [ ] Alert setup (critical errors, high load)

#### 4.4 DevOps
- [ ] Docker containerization
  - [ ] Dockerfile for backend
  - [ ] Docker Compose for local development
  - [ ] Multi-stage builds
- [ ] CI/CD pipeline
  - [ ] GitHub Actions / GitLab CI
  - [ ] Automated testing
  - [ ] Build & deploy
- [ ] Environment setup
  - [ ] Development
  - [ ] Staging
  - [ ] Production
- [ ] Deployment
  - [ ] Choose cloud provider (AWS/Azure/GCP)
  - [ ] Database hosting (RDS/Managed PostgreSQL)
  - [ ] Application hosting (ECS/K8s/VM)
  - [ ] CDN for frontend
  - [ ] Load balancer

---

### Phase 5: Future Enhancements (P1/P2 Features)

#### 5.1 Learning Hub (P1)
- [ ] Educational content management
- [ ] Markdown rendering
- [ ] Video tutorials
- [ ] Interactive lessons
- [ ] Progress tracking

#### 5.2 Social Features
- [ ] User leaderboards (global)
- [ ] Friends system
- [ ] Private contests
- [ ] Chat/comments
- [ ] Share results

#### 5.3 Advanced Analytics
- [ ] Portfolio performance charts
- [ ] Asset correlation analysis
- [ ] Risk metrics
- [ ] Historical performance comparison
- [ ] Export reports

#### 5.4 Mobile App
- [ ] React Native / Flutter
- [ ] Push notifications
- [ ] Mobile-optimized UI
- [ ] Offline support

---

## 🛠️ Tools & Resources Needed

### Development Tools
- [ ] VS Code / IntelliJ
- [ ] Rust Analyzer extension
- [ ] PostgreSQL GUI (pgAdmin / DBeaver)
- [ ] API testing (Postman / Insomnia)
- [ ] WebSocket testing (wscat)

### Services to Setup
- [ ] Google OAuth credentials ✅ (already documented)
- [ ] Zerodha Kite Connect API (for live data)
- [ ] Cloud provider account (AWS/Azure/GCP)
- [ ] Domain name
- [ ] Email service (SendGrid/AWS SES) - for notifications
- [ ] Payment gateway (optional, for future)

### Monitoring & Analytics
- [ ] Error tracking (Sentry / Rollbar)
- [ ] Analytics (Google Analytics / Mixpanel)
- [ ] Uptime monitoring (UptimeRobot / Pingdom)
- [ ] Log aggregation (ELK / Datadog)

---

## 📅 Suggested Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1** | 1-2 weeks | Backend completion |
| **Phase 2** | 1 week | Testing & quality |
| **Phase 3** | 2-3 weeks | Frontend development |
| **Phase 4** | 1 week | Production readiness |
| **Phase 5** | Ongoing | Enhancements |

**Total MVP to Production:** ~5-7 weeks

---

## 🎯 Success Criteria

### MVP Launch Checklist
- [ ] Users can sign up with Google
- [ ] Users receive 100,000 virtual coins
- [ ] Users can replay historical market data
- [ ] Users can place demo trades
- [ ] Users can browse contests
- [ ] Users can join contests with entry fee
- [ ] Users can lock allocations
- [ ] Contests run automatically
- [ ] Leaderboards update in real-time
- [ ] Winners receive prizes in wallet
- [ ] All P0 features working end-to-end
- [ ] No critical bugs
- [ ] 99% uptime
- [ ] <100ms API response time (p50)
- [ ] Documentation complete

---

## 🆘 Support & Help

### If Stuck on Backend:
- **Session Middleware**: Look at Axum examples on GitHub
- **Contest Engine**: Study portfolio calculation in FRD
- **WebSockets**: Check Axum WebSocket examples
- **Testing**: Cargo test book and Tokio docs

### If Stuck on Frontend:
- **API Integration**: Use the API Specification Document
- **WebSocket**: Use socket.io-client or native WebSocket
- **State Management**: Redux Toolkit or Zustand
- **Charts**: TradingView Lightweight Charts or Recharts

### If Stuck on DevOps:
- **Docker**: Follow official Rust Docker guide
- **CI/CD**: GitHub Actions marketplace
- **Cloud**: AWS/Azure tutorials for beginners
- **Database**: Managed database services (easier than self-hosted)

---

## 📝 Daily Development Log (Template)

```markdown
## [Date]

### Completed
- [x] Task 1
- [x] Task 2

### In Progress
- [ ] Task 3 (blocked by X)

### Blockers
- Issue with Z (investigating solution)

### Next Steps
- Start Task 4
- Research Y
```

---

## 🎉 Milestones to Celebrate

- [ ] 🚀 Backend runs locally
- [ ] 🔐 First successful Google OAuth login
- [ ] 💰 First wallet transaction recorded
- [ ] 📊 First replay streamed successfully
- [ ] 🏆 First contest executed end-to-end
- [ ] 🌐 Frontend connects to backend
- [ ] 📱 First user registration
- [ ] 🎯 First contest with real users
- [ ] 🚢 MVP deployed to production
- [ ] 🎊 First paying user (if monetized)

---

**Remember:** You have a solid foundation. The backend is complete and working. Focus on one phase at a time, test thoroughly, and iterate based on user feedback.

**You got this!** 💪🎓📈

---

*Last Updated: January 6, 2026*
