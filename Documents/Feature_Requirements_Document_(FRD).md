---

## 1. Feature: Google OAuth Authentication

**Description**
Users authenticate using Google OAuth to create and access their account securely without passwords.

**Business Justification**

* Reduces onboarding friction
* Improves trust and security
* Eliminates password management complexity

**User Stories**

* As a **new user**, I want to sign in using Google so that I can start quickly.
* As a **returning user**, I want secure login without remembering passwords.

**Acceptance Criteria**

* User can log in using Google account
* New users get an auto-created profile
* Returning users land on Dashboard
* Logout functionality works correctly

**Priority**: P0
**Dependencies**: Google OAuth API, User service

---

## 2. Feature: User Profile & Wallet (Virtual Coins)

**Description**
Each user has a profile with virtual coin balance, stats, and history.

**Business Justification**

* Required for demo trading & contests
* Enables fair competition and tracking

**User Stories**

* As a **user**, I want virtual coins so that I can trade without real money.
* As a **user**, I want to see my stats and past performance.

**Acceptance Criteria**

* User wallet initialized with default coins
* Wallet updates after replay or contest
* Profile shows contest history and stats

**Priority**: P0
**Dependencies**: Auth, Database

---

## 3. Feature: Historical Market Data & Replay Engine

**Description**
Users can replay historical market data (stocks, crypto, indices) in a time-controlled environment.

**Business Justification**

* Core educational value
* Differentiates from static tutorials

**User Stories**

* As a **learner**, I want to replay past markets so that I understand price movements.
* As a **student**, I want to pause/fast-forward market replay.

**Acceptance Criteria**

* User selects asset + date range
* Replay streams price data via WebSockets
* Controls: play, pause, speed
* Deterministic replay (same data every time)

**Priority**: P0
**Dependencies**: Market data storage, WebSockets

---

## 4. Feature: Demo Trading (Paper Trading – Spot)

**Description**
Users can place buy/sell trades with virtual coins during replay sessions.

**Business Justification**

* Hands-on learning
* Builds confidence before contests

**User Stories**

* As a **user**, I want to buy/sell assets during replay to test strategies.
* As a **user**, I want to see real-time P&L.

**Acceptance Criteria**

* Buy/sell actions update portfolio
* P&L updates in real time
* Trades recorded in history
* No real money involved

**Priority**: P0
**Dependencies**: Replay engine, Wallet

---

## 5. Feature: Learning Hub (Educational Content)

**Description**
Structured learning content covering markets, crypto, indices, baskets.

**Business Justification**

* Positions product as education-first
* Reduces “gambling app” perception

**User Stories**

* As a **beginner**, I want simple explanations of market concepts.
* As a **user**, I want to practice immediately after learning.

**Acceptance Criteria**

* Topics grouped by category
* Each topic has CTA to replay/practice
* Content accessible without contests

**Priority**: P1
**Dependencies**: None (content-driven)

---

## 6. Feature: Contest Listing & Discovery

**Description**
Users can browse available contests across three tracks.

**Business Justification**

* Entry point to monetization
* Drives engagement and retention

**User Stories**

* As a **user**, I want to see active contests so that I can join.
* As a **user**, I want to understand rules before joining.

**Acceptance Criteria**

* Contest cards show entry fee, prize pool, duration
* Filter by track (Crypto / ETF / Basket)
* Contest detail page explains rules clearly

**Priority**: P0
**Dependencies**: Contest service

---

## 7. Feature: Contest Join & Allocation (Pre-Commit)

**Description**
Users join contests, receive equal virtual capital, and lock allocations before contest start.

**Business Justification**

* Ensures fairness
* Solves data latency issues
* Simplifies backend logic

**User Stories**

* As a **contest participant**, I want to allocate my capital before the contest starts.
* As a **user**, I want assurance that no one can change trades mid-contest.

**Acceptance Criteria**

* User pays entry fee successfully
* Allocation UI with sliders (% based)
* Lock confirmation modal
* Allocations immutable after lock

**Priority**: P0
**Dependencies**: Wallet, Payment gateway, Contest engine

---

## 8. Feature: Contest Execution & Live Leaderboard

**Description**
Contest runs automatically using live or delayed data; leaderboard updates in real time.

**Business Justification**

* Core “Dream11-like” excitement
* Drives repeat usage

**User Stories**

* As a **user**, I want to see my rank during the contest.
* As a **user**, I want transparent performance tracking.

**Acceptance Criteria**

* Contest starts at scheduled time
* Portfolio value updates correctly
* Leaderboard updates via WebSockets
* No trading actions allowed during contest

**Priority**: P0
**Dependencies**: Market data, WebSockets, Contest engine

---

## 9. Feature: Contest Results & Performance Breakdown

**Description**
Final rankings, prize distribution, and learning insights after contest ends.

**Business Justification**

* Closure & trust
* Reinforces learning loop

**User Stories**

* As a **user**, I want to see why I won or lost.
* As a **user**, I want to analyze asset performance.

**Acceptance Criteria**

* Final leaderboard displayed
* Prize distribution shown clearly
* Asset-wise performance breakdown
* Replay of contest prices available

**Priority**: P0
**Dependencies**: Contest execution, Analytics

---

## 10. Feature: Real-Time Updates (WebSockets)

**Description**
WebSockets used for replay streaming, contest updates, and leaderboards.

**Business Justification**

* Smooth UX
* Eliminates polling overhead

**User Stories**

* As a **user**, I want real-time updates without refreshing.
* As a **user**, I want smooth replay experience.

**Acceptance Criteria**

* WebSocket connection established on replay/contest screens
* Handles reconnect gracefully
* Scales to concurrent users

**Priority**: P0
**Dependencies**: Backend infrastructure

---

## 11. Feature: Admin Contest Management (Internal)

**Description**
Admins can create, configure, and monitor contests.

**Business Justification**

* Operational control
* Enables rapid experimentation

**User Stories**

* As an **admin**, I want to create contests easily.
* As an **admin**, I want to define assets and prize rules.

**Acceptance Criteria**

* Admin can create/edit contests
* Define track, assets, duration, fees
* View participant count and status

**Priority**: P1
**Dependencies**: Contest engine

---

## 12. System Flow Diagram (High-Level)

```
[ Landing Page ]
        |
        v
[ Google OAuth ]
        |
        v
[ Dashboard ]
   |      |        |
   v      v        v
[ Learn ][ Replay ][ Contests ]
                 |
                 v
        [ Join Contest ]
                 |
        [ Allocation Lock ]
                 |
        [ Contest Live ]
                 |
        [ Leaderboard ]
                 |
        [ Results & Analysis ]
                 |
           (Loop Back)
```

