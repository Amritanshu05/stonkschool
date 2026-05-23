# 🧪 MVP Testing Guide

**Status:** Backend Running ✅  
**Date:** January 13, 2026

## Quick Start

### 1. Start the Backend

```powershell
# Make sure PostgreSQL is running
h:\Projects\Newprojects\stonkschool\postgresql\pgsql\bin\pg_ctl.exe `
  -D h:\Projects\Newprojects\stonkschool\postgresql\pgsql\data status

# If not running, start it
h:\Projects\Newprojects\stonkschool\postgresql\pgsql\bin\pg_ctl.exe `
  -D h:\Projects\Newprojects\stonkschool\postgresql\pgsql\data `
  -l h:\Projects\Newprojects\stonkschool\postgresql\logfile.txt start

# Start backend
cd h:\Projects\Newprojects\stonkschool\backend
cargo run
```

Backend will start on: `http://localhost:3000`

---

## Test Cases

### ✅ 1. Health Check
**Purpose:** Verify server is running

```bash
curl http://localhost:3000/health
```

**Expected:** `{"status":"ok"}` or similar success response

**Status:** ✅ TESTED & WORKING

---

### 🔐 2. Google OAuth Login
**Purpose:** Test user authentication flow

**Steps:**
1. Open browser: `http://localhost:3000/api/v1/auth/google`
2. Should redirect to Google login page
3. Login with your Google account
4. Should redirect to callback URL
5. Check backend logs for user creation

**Expected Logs:**
```
INFO: User created with Google ID: ...
INFO: Session created: ...
```

**Authorized Redirect URIs:**
- `http://localhost:3000/api/v1/auth/google/callback`
- `http://localhost:5000/api/v1/auth/google/callback` (frontend)

**Status:** ⏳ READY TO TEST

---

### 👤 3. Get Current User
**Purpose:** Verify session works after login

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Cookie: session_id=YOUR_SESSION_ID"
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "google_id": "...",
  "created_at": "..."
}
```

**Status:** ⏳ NEEDS LOGIN FIRST

---

### 💰 4. Check Wallet Balance
**Purpose:** Verify wallet system

```bash
curl http://localhost:3000/api/v1/wallet \
  -H "Cookie: session_id=YOUR_SESSION_ID"
```

**Expected Response:**
```json
{
  "balance": 100000,
  "user_id": "uuid-here"
}
```

**Note:** New users get 100,000 virtual coins

**Status:** ⏳ NEEDS LOGIN FIRST

---

### 📊 5. List Assets
**Purpose:** Check if assets can be queried

```bash
curl http://localhost:3000/api/v1/assets
```

**Expected Response:**
```json
{
  "assets": []
}
```

**Note:** Empty until assets are seeded

**Status:** ⏳ READY TO TEST

---

### 🏆 6. List Contests
**Purpose:** Verify contest system

```bash
curl http://localhost:3000/api/v1/contests
```

**Expected Response:**
```json
{
  "contests": []
}
```

**Note:** Empty until contests are created

**Status:** ⏳ READY TO TEST

---

### 📈 7. Zerodha Market Data (Advanced)
**Purpose:** Test live market data ingestion

**Check backend logs for:**
```
INFO: Connecting to Kite Connect WebSocket...
INFO: Subscribed to instruments: [...]
INFO: Market tick received: {...}
```

**Note:** Requires valid Zerodha access token (currently configured)

**Status:** ⏳ NEEDS MARKET HOURS

---

### 🔌 8. WebSocket Connection
**Purpose:** Test real-time updates

**Using websocat or browser:**
```bash
websocat ws://localhost:3000/ws/replay/REPLAY_ID_HERE
```

**Expected:** WebSocket connection established

**Status:** ⏳ NEEDS REPLAY SESSION FIRST

---

## Database Verification

### Check Tables
```powershell
h:\Projects\Newprojects\stonkschool\postgresql\pgsql\bin\psql.exe `
  -U postgres -h localhost -d stonkschool `
  -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
```

**Expected Output:**
```
_sqlx_migrations
assets
contest_allocations
contest_assets
contest_leaderboard
contest_participants
contests
market_prices
replay_sessions
replay_trades
user_profiles
user_sessions
users
wallet_transactions
wallets
```

**Status:** ✅ VERIFIED - 14 tables exist

---

### Check User After Login
```powershell
h:\Projects\Newprojects\stonkschool\postgresql\pgsql\bin\psql.exe `
  -U postgres -h localhost -d stonkschool `
  -c "SELECT id, google_id, created_at FROM users LIMIT 5;"
```

---

## Seed Sample Data (Optional)

### Create Test Assets
```sql
INSERT INTO assets (symbol, name, asset_type, exchange, is_active)
VALUES
  ('RELIANCE', 'Reliance Industries Ltd', 'equity', 'NSE', true),
  ('TCS', 'Tata Consultancy Services', 'equity', 'NSE', true),
  ('INFY', 'Infosys Ltd', 'equity', 'NSE', true),
  ('HDFCBANK', 'HDFC Bank Ltd', 'equity', 'NSE', true),
  ('ICICIBANK', 'ICICI Bank Ltd', 'equity', 'NSE', true);
```

Run with:
```powershell
h:\Projects\Newprojects\stonkschool\postgresql\pgsql\bin\psql.exe `
  -U postgres -h localhost -d stonkschool `
  -f h:\Projects\Newprojects\stonkschool\backend\seed.sql
```

---

## Frontend Integration

### Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_GOOGLE_CLIENT_ID=<REDACTED>
```

### CORS Configuration
Backend already has permissive CORS enabled for development:
```rust
.layer(CorsLayer::permissive())
```

---

## Common Issues & Fixes

### Issue: "Connection refused" on localhost:3000
**Fix:** Start the backend: `cargo run`

### Issue: "Database connection failed"
**Fix:** Start PostgreSQL:
```powershell
h:\Projects\Newprojects\stonkschool\postgresql\pgsql\bin\pg_ctl.exe `
  -D h:\Projects\Newprojects\stonkschool\postgresql\pgsql\data `
  -l h:\Projects\Newprojects\stonkschool\postgresql\logfile.txt start
```

### Issue: "Google OAuth redirect mismatch"
**Fix:** Add redirect URI to Google Cloud Console:
- Go to: https://console.cloud.google.com/apis/credentials
- Edit OAuth 2.0 Client
- Add: `http://localhost:3000/api/v1/auth/google/callback`

### Issue: "Invalid Zerodha access token"
**Fix:** Generate new access token:
1. Visit: https://kite.zerodha.com/connect/login?api_key=<REDACTED>
2. Login and authorize
3. Copy access token from URL
4. Update in `.env`: `KITE_ACCESS_TOKEN=new_token_here`

### Issue: Backend crashes after Ctrl+C
**Normal behavior** - Just restart: `cargo run`

---

## Performance Expectations

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| /health | <10ms | Simple response |
| /api/v1/auth/google | <50ms | Redirect only |
| /api/v1/assets | <100ms | DB query |
| /api/v1/contests | <100ms | DB query + joins |
| /ws/replay | <200ms | WebSocket handshake |

---

## Test Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Google OAuth redirects properly
- [ ] User can login and create account
- [ ] User session persists across requests
- [ ] Wallet shows 100,000 initial balance
- [ ] Assets endpoint returns data
- [ ] Contests endpoint returns data
- [ ] WebSocket connects successfully
- [ ] Database has 14 tables
- [ ] PostgreSQL stays running
- [ ] Backend logs show no errors
- [ ] CORS allows frontend requests

---

## Next Steps After Testing

1. **Frontend Development**
   - Build React/Vue frontend
   - Integrate with backend APIs
   - Implement OAuth flow
   - Add WebSocket for live updates

2. **Data Population**
   - Seed real market instruments
   - Add historical price data
   - Create sample contests

3. **Production Deployment**
   - Move to cloud PostgreSQL (Supabase/Neon)
   - Deploy backend to Render/Railway
   - Configure production OAuth credentials
   - Enable HTTPS/SSL

4. **Monitoring**
   - Add error tracking (Sentry)
   - Setup logging (CloudWatch)
   - Monitor API performance
   - Track user activity

---

**Status:** ✅ Backend ready for comprehensive testing!

**For Issues:** Check backend logs in terminal or PostgreSQL logs at:
`h:\Projects\Newprojects\stonkschool\postgresql\logfile.txt`

_Last Updated: January 13, 2026_
