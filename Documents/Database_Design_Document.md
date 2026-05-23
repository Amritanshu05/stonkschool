---

# 1. Database Overview

The MVP uses a **relational database (PostgreSQL)** as the primary datastore, with **time-series tables** for market prices.

Design goals:

* Strong data integrity (FKs, constraints)
* Clear separation of concerns
* Normalized schema (3NF)
* Directly implementable without ambiguity
* Optimized for **contest scoring, replay, and analytics**

---

# 2. High-Level ER Diagram (Textual)

```
[ users ]───1──────────1───[ user_profiles ]
    │
    │1
    │
    │N
[ wallets ]───1──────────N───[ wallet_transactions ]

[ users ]───1──────────N───[ user_sessions ]

[ contests ]───1──────────N───[ contest_participants ]
                                  │
                                  │1
                                  │
                                  │1
                         [ contest_allocations ]
                                  │
                                  │N
                                  │
                            [ contest_assets ]

[ contests ]───1──────────N───[ contest_leaderboard ]

[ assets ]───1──────────N───[ market_prices ]

[ replay_sessions ]───1─────N───[ replay_trades ]

[ users ]───1──────────N───[ replay_sessions ]
```

---

# 3. Core Tables (Detailed)

---

## 3.1 users

Stores authenticated user identity (OAuth-based).

| Field         | Type      | Constraints      | Purpose          |
| ------------- | --------- | ---------------- | ---------------- |
| id            | UUID      | PK               | Internal user ID |
| google_id     | TEXT      | UNIQUE, NOT NULL | Google OAuth ID  |
| email         | TEXT      | UNIQUE, NOT NULL | User email       |
| created_at    | TIMESTAMP | NOT NULL         | Account creation |
| last_login_at | TIMESTAMP |                  | Last login       |

---

## 3.2 user_profiles

Extended user metadata & stats.

| Field            | Type      | Constraints                   | Purpose       |
| ---------------- | --------- | ----------------------------- | ------------- |
| user_id          | UUID      | PK, FK → users(id)            | Profile owner |
| display_name     | TEXT      | NOT NULL                      | Shown name    |
| experience_level | TEXT      | CHECK (beginner/intermediate) | Self-declared |
| total_contests   | INT       | DEFAULT 0                     | Stats         |
| contests_won     | INT       | DEFAULT 0                     | Stats         |
| created_at       | TIMESTAMP | NOT NULL                      |               |

---

## 3.3 user_sessions

Active login sessions (cookie-based).

| Field      | Type      | Constraints    | Purpose        |
| ---------- | --------- | -------------- | -------------- |
| id         | UUID      | PK             | Session ID     |
| user_id    | UUID      | FK → users(id) | Owner          |
| expires_at | TIMESTAMP | NOT NULL       | Session expiry |
| created_at | TIMESTAMP | NOT NULL       |                |

---

## 3.4 wallets

Virtual coin balances.

| Field      | Type          | Constraints            | Purpose             |
| ---------- | ------------- | ---------------------- | ------------------- |
| id         | UUID          | PK                     | Wallet ID           |
| user_id    | UUID          | UNIQUE, FK → users(id) | One wallet per user |
| balance    | NUMERIC(20,2) | NOT NULL               | Virtual coins       |
| updated_at | TIMESTAMP     | NOT NULL               |                     |

---

## 3.5 wallet_transactions

Immutable wallet ledger.

| Field        | Type          | Constraints                     | Purpose          |
| ------------ | ------------- | ------------------------------- | ---------------- |
| id           | UUID          | PK                              | Transaction ID   |
| wallet_id    | UUID          | FK → wallets(id)                | Wallet           |
| amount       | NUMERIC(20,2) | NOT NULL                        | +credit / -debit |
| type         | TEXT          | CHECK (entry_fee, prize, reset) | Reason           |
| reference_id | UUID          |                                 | Contest ID etc.  |
| created_at   | TIMESTAMP     | NOT NULL                        |                  |

---

# 4. Market & Asset Tables

---

## 4.1 assets

All tradable entities.

| Field      | Type    | Constraints                        | Purpose         |
| ---------- | ------- | ---------------------------------- | --------------- |
| id         | UUID    | PK                                 | Asset ID        |
| symbol     | TEXT    | UNIQUE                             | BTC, NIFTY_ETF  |
| name       | TEXT    | NOT NULL                           | Human name      |
| asset_type | TEXT    | CHECK (crypto, equity, etf, index) | Category        |
| exchange   | TEXT    |                                    | Source exchange |
| is_active  | BOOLEAN | DEFAULT true                       |                 |

---

## 4.2 market_prices (time-series)

Price history (minute-level).

| Field     | Type          | Constraints     | Purpose     |
| --------- | ------------- | --------------- | ----------- |
| asset_id  | UUID          | FK → assets(id) | Asset       |
| timestamp | TIMESTAMP     | NOT NULL        | Candle time |
| open      | NUMERIC(12,4) | NOT NULL        | OHLC        |
| high      | NUMERIC(12,4) | NOT NULL        |             |
| low       | NUMERIC(12,4) | NOT NULL        |             |
| close     | NUMERIC(12,4) | NOT NULL        |             |

**Primary Key:** (asset_id, timestamp)

---

# 5. Contest System Tables

---

## 5.1 contests

Contest master record.

| Field           | Type          | Constraints                   | Purpose        |
| --------------- | ------------- | ----------------------------- | -------------- |
| id              | UUID          | PK                            | Contest ID     |
| title           | TEXT          | NOT NULL                      | Name           |
| track           | TEXT          | CHECK (crypto, etf, basket)   | Contest type   |
| entry_fee       | NUMERIC(10,2) | NOT NULL                      | Fee            |
| virtual_capital | NUMERIC(20,2) | NOT NULL                      | Starting coins |
| start_time      | TIMESTAMP     | NOT NULL                      |                |
| end_time        | TIMESTAMP     | NOT NULL                      |                |
| status          | TEXT          | CHECK (upcoming, live, ended) |                |
| created_at      | TIMESTAMP     | NOT NULL                      |                |

---

## 5.2 contest_assets

Allowed assets per contest.

| Field      | Type         | Constraints       | Purpose                  |
| ---------- | ------------ | ----------------- | ------------------------ |
| id         | UUID         | PK                |                          |
| contest_id | UUID         | FK → contests(id) |                          |
| asset_id   | UUID         | FK → assets(id)   |                          |
| weight     | NUMERIC(5,2) |                   | Basket weight (nullable) |

---

## 5.3 contest_participants

Users joined in contests.

| Field       | Type          | Constraints       | Purpose         |
| ----------- | ------------- | ----------------- | --------------- |
| id          | UUID          | PK                |                 |
| contest_id  | UUID          | FK → contests(id) |                 |
| user_id     | UUID          | FK → users(id)    |                 |
| joined_at   | TIMESTAMP     | NOT NULL          |                 |
| locked_at   | TIMESTAMP     |                   | Allocation lock |
| final_value | NUMERIC(20,2) |                   | Result          |

**Unique:** (contest_id, user_id)

---

## 5.4 contest_allocations

Locked allocations per user.

| Field          | Type         | Constraints                   | Purpose      |
| -------------- | ------------ | ----------------------------- | ------------ |
| id             | UUID         | PK                            |              |
| participant_id | UUID         | FK → contest_participants(id) |              |
| asset_id       | UUID         | FK → assets(id)               |              |
| allocation_pct | NUMERIC(5,2) | CHECK (<=100)                 | % allocation |

---

## 5.5 contest_leaderboard

Final rankings snapshot.

| Field           | Type          | Constraints       | Purpose |
| --------------- | ------------- | ----------------- | ------- |
| id              | UUID          | PK                |         |
| contest_id      | UUID          | FK → contests(id) |         |
| user_id         | UUID          | FK → users(id)    |         |
| rank            | INT           | NOT NULL          |         |
| portfolio_value | NUMERIC(20,2) | NOT NULL          |         |

---

# 6. Replay & Demo Trading Tables

---

## 6.1 replay_sessions

A single replay instance.

| Field      | Type      | Constraints     | Purpose |
| ---------- | --------- | --------------- | ------- |
| id         | UUID      | PK              |         |
| user_id    | UUID      | FK → users(id)  |         |
| asset_id   | UUID      | FK → assets(id) |         |
| start_time | TIMESTAMP | NOT NULL        |         |
| end_time   | TIMESTAMP | NOT NULL        |         |
| created_at | TIMESTAMP | NOT NULL        |         |

---

## 6.2 replay_trades

Paper trades during replay.

| Field     | Type          | Constraints              | Purpose |
| --------- | ------------- | ------------------------ | ------- |
| id        | UUID          | PK                       |         |
| replay_id | UUID          | FK → replay_sessions(id) |         |
| side      | TEXT          | CHECK (buy, sell)        |         |
| price     | NUMERIC(12,4) | NOT NULL                 |         |
| quantity  | NUMERIC(12,4) | NOT NULL                 |         |
| timestamp | TIMESTAMP     | NOT NULL                 |         |

---

# 7. Indexing Strategy

| Table                | Index                      |
| -------------------- | -------------------------- |
| users                | (email), (google_id)       |
| market_prices        | (asset_id, timestamp DESC) |
| contests             | (status, start_time)       |
| contest_participants | (contest_id), (user_id)    |
| contest_allocations  | (participant_id)           |
| wallet_transactions  | (wallet_id, created_at)    |
| replay_sessions      | (user_id, created_at)      |

---

# 8. Data Normalization Strategy

* **3rd Normal Form (3NF)** followed
* No derived values stored (P&L computed)
* Immutable ledgers for money
* Contest results snapshotted for auditability
* Time-series isolated from transactional tables

---

# 9. Sample Data Rows

### users

```
id: u1
google_id: g123
email: user@gmail.com
```

### assets

```
id: a1
symbol: BTC
asset_type: crypto
```

### contests

```
id: c1
title: BTC Daily Sprint
track: crypto
entry_fee: 50
virtual_capital: 100000
```

### contest_allocations

```
participant_id: p1
asset_id: a1
allocation_pct: 100
```