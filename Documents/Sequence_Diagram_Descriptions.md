---

# 1. User Signup / Login (Google OAuth)

### Actors

* User
* Frontend (Web App)
* Backend (Axum API)
* Google OAuth Server
* Database

### Sequence Steps

1. **User** clicks “Login with Google” on Frontend
2. **Frontend** redirects browser to `/auth/google`
3. **Backend** redirects user to Google OAuth consent screen
4. **User** approves access on Google
5. **Google OAuth** redirects back to `/auth/google/callback` with auth code
6. **Backend** exchanges code with Google for user profile
7. **Backend** checks:

   * If user exists → fetch user
   * Else → create new user + profile + wallet
8. **Backend** creates session (secure cookie)
9. **Backend** redirects user to Dashboard
10. **Frontend** loads authenticated state

### Notes

* No JWT used
* Session is cookie-based
* Failure at step 6 leads to OAuth error screen

---

# 2. Core Feature Operation #1 — Market Replay + Demo Trading

### Actors

* User
* Frontend
* Backend (Replay Engine)
* Market Data Service
* Database

### Sequence Steps

1. **User** selects “Replay Market”
2. **Frontend** sends `POST /replay` with asset + date range
3. **Backend**:

   * Validates request
   * Creates replay session record
4. **Backend** returns `replay_id` + WebSocket URL
5. **Frontend** opens WebSocket `/ws/replay/{replay_id}`
6. **Replay Engine**:

   * Fetches historical price data
   * Streams price ticks over WebSocket
7. **Frontend** renders live chart updates
8. **User** places demo trade (buy/sell)
9. **Frontend** sends `POST /replay/{id}/trade`
10. **Demo Trading Engine**:

    * Validates trade
    * Updates virtual portfolio
    * Persists trade in DB
11. **Backend** pushes updated P&L via WebSocket
12. **Replay ends** → summary generated and shown to user

### Failure Points

* Invalid date range
* WebSocket disconnect → auto-reconnect

---

# 3. Core Feature Operation #2 — Contest Join → Allocation → Live Leaderboard

### Actors

* User
* Frontend
* Backend (Contest Service)
* Wallet Service
* Contest Engine
* Market Data Service
* Database

### Sequence Steps

1. **User** opens Contest Listing (`GET /contests`)
2. **User** selects a contest
3. **Frontend** sends `POST /contests/{id}/join`
4. **Backend**:

   * Checks wallet balance
   * Debits entry fee
   * Creates contest_participant record
5. **Backend** returns virtual capital
6. **User** allocates capital (UI sliders)
7. **Frontend** sends `POST /contests/{id}/allocate`
8. **Backend**:

   * Validates allocation = 100%
   * Locks allocation (immutable)
9. **Contest start time reached**
10. **Contest Engine**:

    * Fetches market prices
    * Calculates portfolio values
11. **WebSocket Gateway** pushes:

    * Live leaderboard
    * Portfolio value updates
12. **Contest ends**
13. **Backend**:

    * Finalizes rankings
    * Credits winners’ wallets
14. **User** views results screen

### Key Guarantees

* No trading after allocation lock
* Deterministic scoring

---

# 4. AI / Intelligent Processing Flow (Optional / Post-MVP)

*(Lightweight, non-blocking — no core dependency)*

### Actors

* User
* Frontend
* Backend
* AI Analysis Module

### Sequence Steps

1. **User** opens Contest Results
2. **Frontend** requests performance analysis
3. **Backend** sends trade/portfolio data to AI module
4. **AI Module** generates:

   * What worked
   * What failed
   * Simple improvement tips
5. **Backend** returns AI insights
6. **Frontend** renders insights panel

### Notes

* Async, non-blocking
* Failure does not affect core flow

---

# 5. Payment / Transaction / Confirmation Flow

### Actors

* User
* Frontend
* Backend
* Payment Gateway
* Wallet Service
* Database

### Sequence Steps

1. **User** clicks “Join Contest”
2. **Frontend** initiates payment
3. **Backend** creates payment intent
4. **User** completes payment on gateway
5. **Gateway** sends success callback to Backend
6. **Backend**:

   * Verifies payment signature
   * Credits wallet (if add-funds) or confirms entry fee
   * Writes wallet transaction ledger
7. **Backend** confirms contest join
8. **Frontend** updates UI state

### Failure Handling

* Payment failure → no wallet change
* Duplicate callback → idempotency check

---

# 6. Summary: Why These Sequences Matter

* Clearly separates **learning**, **competition**, and **money flow**
* Ensures fairness, transparency, and low technical risk
* Suitable for:

  * UI prototyping
  * Backend implementation
  * System design reviews

---
