---

# 1. API Overview

**API Style:** REST (JSON over HTTPS)
**Real-time:** WebSockets (documented separately)
**Backend:** Rust + Axum
**Authentication:** Google OAuth (session cookie-based, no JWT)
**Base URL:** `/api/v1`

All endpoints assume:

* `Content-Type: application/json`
* Session cookie present for authenticated routes

---

# 2. High-Level API Architecture Diagram (Textual)

```
[ Frontend SPA ]
      |
      | HTTPS (REST)
      v
[ API Gateway / Axum Router ]
      |
      +-----------------------------+
      |                             |
[ Auth APIs ]              [ Core APIs ]
                                   |
            +----------+-----------+----------+
            |          |                      |
        [ Users ]  [ Replay ]          [ Contests ]
            |          |                      |
         [ Wallet ]  [ Trading ]      [ Leaderboard ]
```

---

# 3. Authentication APIs

---

## 3.1 Start Google OAuth

**Endpoint Name:** Start OAuth
**Route:** `/auth/google`
**Method:** `GET`
**Auth Required:** ❌ No

**Description**
Redirects user to Google OAuth consent screen.

**Response**

* `302 Redirect` to Google

**Error Codes**

* `500` – OAuth configuration error

**Notes**

* Frontend should simply redirect browser

---

## 3.2 OAuth Callback

**Endpoint Name:** OAuth Callback
**Route:** `/auth/google/callback`
**Method:** `GET`
**Auth Required:** ❌ No

**Description**
Handles Google OAuth callback, creates session.

**Response (Success)**

```json
{
  "success": true,
  "user_id": "uuid"
}
```

**Response (Error)**

```json
{
  "success": false,
  "error": "OAUTH_FAILED"
}
```

**Error Codes**

* `401` – OAuth failed
* `500` – Internal error

**Notes**

* Sets secure HTTP-only session cookie

---

## 3.3 Logout

**Route:** `/auth/logout`
**Method:** `POST`
**Auth Required:** ✅ Yes

**Response**

```json
{ "success": true }
```

---

# 4. User & Profile APIs

---

## 4.1 Get Current User

**Route:** `/users/me`
**Method:** `GET`
**Auth Required:** ✅ Yes

**Response**

```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "display_name": "TraderX",
  "wallet_balance": 100000,
  "stats": {
    "contests_played": 5,
    "contests_won": 1
  }
}
```

**Errors**

* `401` – Not authenticated

---

# 5. Wallet APIs

---

## 5.1 Get Wallet Balance

**Route:** `/wallet`
**Method:** `GET`
**Auth Required:** ✅ Yes

**Response**

```json
{
  "balance": 98500,
  "currency": "VCOIN"
}
```

---

## 5.2 Wallet Transactions

**Route:** `/wallet/transactions`
**Method:** `GET`
**Auth Required:** ✅ Yes

**Response**

```json
[
  {
    "id": "uuid",
    "amount": -50,
    "type": "entry_fee",
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

---

# 6. Asset & Market Data APIs

---

## 6.1 List Assets

**Route:** `/assets`
**Method:** `GET`
**Auth Required:** ❌ No

**Query Params**

* `type` (optional): crypto | etf | equity

**Response**

```json
[
  {
    "id": "uuid",
    "symbol": "BTC",
    "type": "crypto"
  }
]
```

---

## 6.2 Get Historical Prices

**Route:** `/market-data/{asset_id}`
**Method:** `GET`
**Auth Required:** ✅ Yes

**Query Params**

* `from` (ISO timestamp)
* `to` (ISO timestamp)

**Response**

```json
[
  {
    "timestamp": "2024-01-01T10:00:00Z",
    "open": 42000,
    "high": 42100,
    "low": 41900,
    "close": 42050
  }
]
```

**Errors**

* `404` – Asset not found

---

# 7. Replay & Demo Trading APIs

---

## 7.1 Create Replay Session

**Route:** `/replay`
**Method:** `POST`
**Auth Required:** ✅ Yes

**Request**

```json
{
  "asset_id": "uuid",
  "from": "2024-01-01T09:15:00Z",
  "to": "2024-01-01T15:30:00Z"
}
```

**Response**

```json
{
  "replay_id": "uuid",
  "ws_url": "/ws/replay/uuid"
}
```

---

## 7.2 Place Demo Trade

**Route:** `/replay/{replay_id}/trade`
**Method:** `POST`
**Auth Required:** ✅ Yes

**Request**

```json
{
  "side": "buy",
  "quantity": 10
}
```

**Response**

```json
{ "success": true }
```

**Errors**

* `400` – Invalid quantity
* `409` – Replay not active

---

# 8. Contest APIs

---

## 8.1 List Contests

**Route:** `/contests`
**Method:** `GET`
**Auth Required:** ❌ No

**Response**

```json
[
  {
    "id": "uuid",
    "title": "BTC Daily Sprint",
    "track": "crypto",
    "entry_fee": 50,
    "start_time": "2025-01-01T10:00:00Z",
    "status": "upcoming"
  }
]
```

---

## 8.2 Contest Details

**Route:** `/contests/{contest_id}`
**Method:** `GET`
**Auth Required:** ❌ No

**Response**

```json
{
  "id": "uuid",
  "assets": [
    { "id": "uuid", "symbol": "BTC" }
  ],
  "rules": {
    "max_assets": 3,
    "min_allocation_pct": 5
  }
}
```

---

## 8.3 Join Contest

**Route:** `/contests/{contest_id}/join`
**Method:** `POST`
**Auth Required:** ✅ Yes

**Response**

```json
{
  "participant_id": "uuid",
  "virtual_capital": 100000
}
```

**Errors**

* `402` – Insufficient balance
* `409` – Contest full

---

## 8.4 Lock Allocation

**Route:** `/contests/{contest_id}/allocate`
**Method:** `POST`
**Auth Required:** ✅ Yes

**Request**

```json
{
  "allocations": [
    { "asset_id": "uuid", "pct": 60 },
    { "asset_id": "uuid", "pct": 40 }
  ]
}
```

**Response**

```json
{ "locked": true }
```

**Errors**

* `400` – Allocation sum ≠ 100
* `409` – Already locked
* `403` – Contest started

---

## 8.5 Contest Live Status

**Route:** `/contests/{contest_id}/status`
**Method:** `GET`
**Auth Required:** ✅ Yes

**Response**

```json
{
  "status": "live",
  "current_rank": 12,
  "portfolio_value": 101250
}
```

---

## 8.6 Contest Results

**Route:** `/contests/{contest_id}/results`
**Method:** `GET`
**Auth Required:** ✅ Yes

**Response**

```json
{
  "rank": 3,
  "final_value": 112000,
  "payout": 500
}
```

---

# 9. Leaderboard APIs

---

## 9.1 Get Leaderboard

**Route:** `/contests/{contest_id}/leaderboard`
**Method:** `GET`
**Auth Required:** ❌ No

**Response**

```json
[
  { "rank": 1, "user": "TraderA", "value": 120000 },
  { "rank": 2, "user": "TraderB", "value": 115000 }
]
```

---

# 10. Error Code Reference

| Code | Meaning                        |
| ---- | ------------------------------ |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized                   |
| 403  | Forbidden                      |
| 404  | Not Found                      |
| 409  | Conflict                       |
| 402  | Payment / balance issue        |
| 500  | Internal Server Error          |

---

# 11. API Constraints & Notes

* All monetary values use **NUMERIC**, not floats
* All timestamps in UTC (ISO 8601)
* Allocation immutable after lock
* Contest results are final and auditable
* No polling; live updates via WebSockets

---

# 12. API Interaction Flow (Contest Join)

```
GET  /contests
 → User selects contest
POST /contests/{id}/join
POST /contests/{id}/allocate
WS  /ws/contest/{id}
GET  /contests/{id}/results
```
