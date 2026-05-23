## 1. Problem Statement

Retail traders and students often **believe they have good trading intuition or strategies**, but are **too afraid to test them with real money** due to risk, lack of confidence, and incomplete understanding of market instruments.

Existing solutions either:

* Teach theory without real market pressure, **or**
* Allow real trading with real money, which beginners are not ready for.

There is **no widely adopted platform** that allows users to **learn trading concepts, practice on real market behavior, and compete in a fair, skill-based environment without risking capital**.

---

## 2. Target Users & Beneficiaries

### Primary Users

* **Beginner retail traders** who want to learn markets safely
* **College students / CS & finance students** exploring trading and markets
* **Self-taught traders** testing strategies before risking capital

### Secondary Users

* **Intermediate traders** improving market intuition
* **Crypto-first users** who enjoy competition and leaderboards

### Who Benefits Most

* Users who learn best by **doing, failing, and competing**
* Users who want **real-market exposure without financial loss**
* Users motivated by **gamification and rankings**

---

## 3. Core Use-Case (One Sentence)

> *A platform where users learn trading by replaying real markets, practicing with virtual money, and competing in skill-based contests using equal capital.*

---

## 4. Why This Solution Matters (Value Proposition)

### Educational Value

* Hands-on learning using **real historical and live market data**
* Clear understanding of **how prices move, sectors rotate, and indices behave**

### Psychological Safety

* No fear of losing real money
* Encourages experimentation and learning from mistakes

### Gamification & Engagement

* Competitive contests create **real emotional pressure**
* Leaderboards and rankings drive continuous improvement

### Fairness & Trust

* Equal starting capital
* Pre-commit allocation model removes latency and cheating advantages

---

## 5. MVP Scope

### ✅ Features INCLUDED in MVP

#### A. Learning & Practice

* Historical market data access
* Market replay engine
* Demo trading (paper trading) on **spot equities**
* Portfolio tracking and P&L visualization
* Educational content covering:

  * Market basics
  * Indices & ETFs
  * Sector behavior
  * Crypto market dynamics

#### B. Contest System (Dream11-style)

* Entry-fee based contests with prize pools
* Equal virtual capital for all participants
* **Pre-commit allocation model** (no live trading during contests)
* Real-market data (delayed/live acceptable)
* Leaderboards and rankings

#### C. Contest Tracks (Exactly 3)

1. **Crypto** (e.g., BTC, ETH)
2. **Index / ETF contests**
3. **Predefined stock baskets**

   * Sector-based
   * Market-cap based
   * Equal-weight baskets

#### D. Platform Essentials

* Google OAuth authentication
* User profiles & performance history
* WebSocket-based real-time updates (leaderboards, replay, contest status)

---

### ❌ Features EXPLICITLY OUT of MVP

* Real money trading or brokerage integration
* Futures margin trading
* Options selling / shorting
* CFDs with leverage & liquidation logic
* User-submitted trading algorithms
* Custom basket creation by users
* Social trading / copy trading
* Advanced analytics (Greeks, Sharpe, etc.)
* Live tick-level execution engines

*(These are intentionally deferred to keep MVP simple, safe, and shippable.)*
