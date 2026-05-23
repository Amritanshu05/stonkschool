---

## 1. Architectural Overview

The MVP follows a **modular, service-oriented architecture** with a **single Rust backend (Axum)** logically separated into components/modules.
Real-time behavior is achieved using **WebSockets**, while standard operations use **HTTP APIs**.

There is **no polling**, **no JWT**, and **no Node.js**.
Authentication is handled via **Google OAuth**, and all user-facing real-time updates are pushed.

---

## 2. High-Level Architecture Style

* **Frontend**: Web client (SPA)
* **Backend**: Rust + Axum (modular monolith, clean boundaries)
* **Real-time layer**: WebSockets
* **Data layer**: Relational DB + Time-series storage
* **External services**: Google OAuth, Market Data APIs, Payments

This keeps MVP **simple, fast to ship, and scalable later** into microservices if needed.

---

## 3. Core Components / Modules

### 3.1 Frontend Client (Web App)

**Responsibility**

* UI rendering
* User interactions
* WebSocket connections
* OAuth initiation

**Key Functions**

* Landing & onboarding
* Dashboard & learning screens
* Replay & demo trading UI
* Contest allocation & live leaderboard
* Results visualization

**Dependencies**

* Backend API
* WebSocket Gateway
* Google OAuth

**Communication**

* HTTPS (REST)
* WebSockets (bi-directional)

---

### 3.2 API Gateway / Backend Server (Axum)

**Responsibility**

* Entry point for all requests
* Route requests to internal modules
* Enforce auth & authorization

**Key Functions**

* Request validation
* OAuth session handling
* Rate limiting
* WebSocket upgrades

**Dependencies**

* Auth Module
* All internal services

**Communication**

* HTTP (internal calls)
* WebSockets

---

### 3.3 Authentication Module (Google OAuth)

**Responsibility**

* User authentication & session management

**Key Functions**

* Google OAuth flow
* User creation / lookup
* Session creation (cookie-based)

**Dependencies**

* Google OAuth APIs
* User Service

**Communication**

* HTTPS (Google)
* Internal function calls

---

### 3.4 User & Profile Service

**Responsibility**

* User identity
* Profile data
* Performance history

**Key Functions**

* Create/update user profile
* Store contest history
* Expose stats

**Dependencies**

* Database

**Communication**

* Internal calls
* REST APIs

---

### 3.5 Wallet Service (Virtual Coins)

**Responsibility**

* Manage virtual coin balances
* Contest entry fees
* Prize distribution

**Key Functions**

* Initialize wallets
* Debit entry fees
* Credit winnings
* Maintain ledger

**Dependencies**

* Database
* Payment Service (optional)

**Communication**

* Internal calls

---

### 3.6 Market Data Service

**Responsibility**

* Fetch, store, and serve market price data

**Key Functions**

* Ingest historical data
* Normalize price feeds
* Serve data to replay & contests

**Dependencies**

* External Market Data APIs
* Time-series storage

**Communication**

* Scheduled jobs
* Internal calls

---

### 3.7 Replay Engine (Real-Time Simulation)

**Responsibility**

* Stream historical price data deterministically

**Key Functions**

* Replay scheduling
* Speed control
* Emit price ticks

**Dependencies**

* Market Data Service
* WebSocket Gateway

**Communication**

* WebSockets (push)

---

### 3.8 Demo Trading Engine (Paper Trading)

**Responsibility**

* Execute buy/sell orders during replay

**Key Functions**

* Order validation
* Portfolio updates
* P&L calculation

**Dependencies**

* Replay Engine
* Wallet Service

**Communication**

* Internal calls
* WebSockets (updates)

---

### 3.9 Contest Management Service

**Responsibility**

* Contest lifecycle management

**Key Functions**

* Contest creation
* Join/exit logic
* Allocation lock
* Contest state transitions

**Dependencies**

* Wallet Service
* Market Data Service
* Contest Engine

**Communication**

* REST APIs
* Internal calls

---

### 3.10 Contest Engine (Scoring & Execution)

**Responsibility**

* Run contests based on locked allocations

**Key Functions**

* Track contest progress
* Calculate portfolio values
* Rank participants

**Dependencies**

* Market Data Service
* Allocation Store

**Communication**

* Internal calls
* WebSockets (leaderboard updates)

---

### 3.11 WebSocket Gateway

**Responsibility**

* Manage persistent client connections

**Key Functions**

* Upgrade HTTP → WS
* Broadcast updates
* Handle reconnects

**Dependencies**

* Replay Engine
* Contest Engine

**Communication**

* WebSockets only

---

### 3.12 Payment Service (Optional for MVP)

**Responsibility**

* Handle entry fees & payouts

**Key Functions**

* Payment initiation
* Success/failure callbacks

**Dependencies**

* External payment gateway
* Wallet Service

**Communication**

* HTTPS (external)
* Internal calls

---

### 3.13 Admin Management Module

**Responsibility**

* Internal admin tooling

**Key Functions**

* Create/edit contests
* Monitor activity

**Dependencies**

* Contest Service
* Market Data Service

**Communication**

* REST APIs

---

## 4. Component Interaction Flow (Step-by-Step)

### Example: Contest Flow

1. User logs in via Google OAuth
2. Frontend fetches contests via REST
3. User joins contest → Wallet debited
4. User locks allocation
5. Contest Engine schedules contest
6. Market Data Service feeds prices
7. Contest Engine calculates portfolio values
8. WebSocket Gateway pushes leaderboard updates
9. Contest ends → Wallet credits winners
10. Results stored in User Service

---

## 5. Communication Protocols Summary

| Interaction                | Protocol              |
| -------------------------- | --------------------- |
| Frontend → Backend         | HTTPS (REST)          |
| Frontend ↔ Replay          | WebSockets            |
| Frontend ↔ Contest Updates | WebSockets            |
| Backend → Google OAuth     | HTTPS                 |
| Backend → Market Data APIs | HTTPS                 |
| Internal services          | Direct function calls |

---

## 6. Component Dependency Diagram (Textual)

```
[ Frontend Web App ]
        |
        | HTTPS / WebSocket
        v
[ API Gateway (Axum) ]
        |
        +--------------------+
        |                    |
        v                    v
[ Auth Module ]      [ User & Wallet ]
        |                    |
        +----------+---------+
                   |
                   v
        [ Contest Management Service ]
                   |
        +----------+----------+
        |                     |
        v                     v
[ Replay Engine ]      [ Contest Engine ]
        |                     |
        v                     v
[ Market Data Service ]     [ Leaderboards ]
        |
        v
[ Time-Series Storage ]

(WebSocket Gateway bridges Replay/Contest → Frontend)
```

---

## 7. Why This Architecture Works for MVP

### ✅ Pros

* Simple to implement
* No over-engineering
* Real-time without polling
* Easy to scale later
* Clear separation of concerns

### ⚠️ Trade-offs

* Modular monolith (not microservices yet)
* Heavy reliance on WebSockets
* Needs careful concurrency handling (Rust advantage)

---

## 8. Evolution Path (Post-MVP)

* Split Market Data & Contest Engine into separate services
* Introduce message queue for scaling
* Add caching layer
* Multi-region WebSocket scaling

---

## 9. Final Notes

This architecture is:

* **Technically sound**
* **CS-project appropriate**
* **Startup-scalable**
* **Latency-safe**
* **Compliance-friendly**

---
