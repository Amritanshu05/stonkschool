# 📋 StonkSchool Backend - Quick Reference

## ✅ Current Build Status

- ✅ **Compiles successfully** (January 2026)
- ✅ SQLx runtime queries (no DATABASE_URL needed for compilation)
- ⚠️ **Requires PostgreSQL for execution**
- ⚠️ **Requires Zerodha API keys for market data**

---

## 🚀 Quick Start Commands

```powershell
# Navigate to backend
cd H:\Projects\Newprojects\stonkschool\backend

# Build (works without database)
cargo build

# Run (REQUIRES database and .env setup)
cargo run

# Run with logs
RUST_LOG=debug cargo run

# Run tests
cargo test

# Format code
cargo fmt

# Lint
cargo clippy

# Seed database
psql -U postgres -d stonkschool -f seed.sql
```

---

## 📁 Key Files Location

| Component | File Path |
|-----------|-----------|
| **Main Entry** | `src/main.rs` |
| **Config** | `src/config.rs` |
| **Database** | `src/db.rs` |
| **Errors** | `src/error.rs` |
| **Auth** | `src/modules/auth.rs` |
| **Users** | `src/modules/users.rs` |
| **Wallet** | `src/modules/wallet.rs` |
| **Contests** | `src/modules/contests.rs` |
| **Replay** | `src/modules/replay.rs` |
| **WebSocket** | `src/modules/websocket.rs` |
| **Market Data** | `src/services/market_data_ingester.rs` |
| **Migrations** | `migrations/` |
| **Env Config** | `.env` |

---

## 🌐 API Endpoints Reference

### Authentication
```
GET  /api/v1/auth/google           → Start OAuth
GET  /api/v1/auth/google/callback  → OAuth callback  
POST /api/v1/auth/logout           → Logout
```

### Users & Wallet
```
GET /api/v1/users/me               → Current user
GET /api/v1/wallet                 → Wallet balance
GET /api/v1/wallet/transactions    → Transaction history
```

### Assets & Market Data
```
GET /api/v1/assets                     → List assets
GET /api/v1/assets?type=crypto         → Filter by type
GET /api/v1/market-data/:asset_id      → Historical prices
  ?from=2024-01-01T00:00:00Z
  &to=2024-01-02T00:00:00Z
```

### Replay
```
POST /api/v1/replay                → Create session
POST /api/v1/replay/:id/trade      → Place demo trade
WS   /ws/replay/:id                → Price stream
```

### Contests
```
GET  /api/v1/contests                      → List all
GET  /api/v1/contests/:id                  → Details
POST /api/v1/contests/:id/join             → Join
POST /api/v1/contests/:id/allocate         → Lock allocation
GET  /api/v1/contests/:id/status           → Live status
GET  /api/v1/contests/:id/results          → Final results
GET  /api/v1/contests/:id/leaderboard      → Rankings
WS   /ws/contest/:id                       → Live updates
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Authentication |
| `user_profiles` | User info & stats |
| `user_sessions` | Session cookies |
| `wallets` | Virtual coin balance |
| `wallet_transactions` | Ledger |
| `assets` | Tradable instruments |
| `market_prices` | OHLC time-series |
| `replay_sessions` | Replay instances |
| `replay_trades` | Paper trades |
| `contests` | Contest records |
| `contest_assets` | Asset pools |
| `contest_participants` | User joins |
| `contest_allocations` | Locked positions |
| `contest_leaderboard` | Rankings |

---

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/stonkschool
PORT=3000
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/v1/auth/google/callback
SESSION_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5173
RUST_LOG=debug
```

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### Database Connection Failed
```powershell
net start postgresql-x64-14
psql -U postgres -c "SELECT 1"
```

### Compilation Error
```powershell
cargo clean
cargo build
```

### SQLx Migration Error
```powershell
sqlx migrate run
```

---

## 📊 Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
# Expected: OK
```

### List Assets
```bash
curl http://localhost:3000/api/v1/assets
```

### List Contests
```bash
curl http://localhost:3000/api/v1/contests
```

### Create Replay (authenticated)
```bash
curl -X POST http://localhost:3000/api/v1/replay \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": "550e8400-e29b-41d4-a716-446655440001",
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-02T00:00:00Z"
  }'
```

---

## 📚 Documentation Links

- **Main README**: `backend/README.md`
- **Quick Start**: `backend/QUICKSTART.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **Architecture**: `ARCHITECTURE_DIAGRAMS.md`
- **Next Steps**: `NEXT_STEPS.md`
- **API Spec**: `Documents/API_Specification_Document.md`
- **Database Design**: `Documents/Database_Design_Document.md`

---

## 🛠️ Development Workflow

1. **Make changes** to code
2. **Format**: `cargo fmt`
3. **Lint**: `cargo clippy`
4. **Test**: `cargo test`
5. **Run**: `cargo run`
6. **Test API**: Use Postman/curl
7. **Commit**: `git add . && git commit -m "message"`
8. **Push**: `git push`

---

## 🔐 Session Cookie Format

```
stonkschool_session=<session_id>; HttpOnly; Secure; SameSite=Strict
```

---

## 📦 Key Dependencies

| Crate | Version | Purpose |
|-------|---------|---------|
| `axum` | 0.7 | Web framework |
| `sqlx` | 0.7 | Database ORM |
| `tokio` | 1.0 | Async runtime |
| `serde` | 1.0 | Serialization |
| `oauth2` | 4.4 | OAuth client |
| `zerodha-tl` | 0.1.0 | Market data |
| `tracing` | 0.1 | Logging |

---

## 🎯 Contest States

```
draft → upcoming → joining_open → allocation_locked 
→ live → ended → settled
```

Any state can transition to `cancelled`.

---

## 💡 Quick Tips

- Always check RUST_LOG env var for detailed logs
- Use `sqlx migrate run` to apply new migrations
- WebSocket clients must handle reconnection
- All monetary values use `Decimal`, not `f64`
- Timestamps are UTC (ISO 8601)
- UUIDs are version 4
- Session expires after 30 days

---

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 400 | Bad Request (validation) |
| 401 | Unauthorized |
| 402 | Payment Required (insufficient balance) |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (already exists) |
| 500 | Internal Server Error |

---

## 📞 Support

- Check logs: Look at terminal output
- Database: Use pgAdmin or `psql`
- API testing: Use Postman
- WebSocket: Use `wscat` or browser dev tools

---

**Keep this reference handy while developing!** 📌
