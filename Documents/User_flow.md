## 1. Entry Points

**Primary Entry Points**

* Landing page (web)
* Shared contest link
* “Learn trading without risk” CTA

**User intent at entry**

* Curious about trading
* Wants to practice without losing money
* Attracted by competition / rewards

---

## 2. Core User Journey (Happy Path)

### Step 1: Landing → Authentication

* User lands on homepage
* Sees value proposition + demo visuals
* Clicks **“Get Started”**
* Auth via **Google OAuth**

**Emotion:** Curious → Safe (low friction, trusted login)

**Screen**

* Landing Page
* Google OAuth popup

---

### Step 2: Onboarding (Lightweight)

* User selects:

  * Experience level (Beginner / Intermediate)
  * Primary interest (Crypto / Stocks / Indices)
* Intro tooltip explaining:

  * Virtual coins
  * No real trading
  * Skill-based contests

**Emotion:** Relief (“no real money risk”), excitement

**Screen**

* Onboarding setup screen

---

### Step 3: Home Dashboard

User sees:

* Wallet (virtual coins)
* Quick actions:

  * **Learn**
  * **Practice**
  * **Join Contest**
* Ongoing & upcoming contests
* Personal stats snapshot

**Emotion:** Motivated, oriented

**Screen**

* Dashboard / Home

---

## 3. Learning & Practice Journey

### Path A: Learn (Education First)

1. User clicks **Learn**
2. Selects topic:

   * Market basics
   * Crypto fundamentals
   * Indices & ETFs
3. Short content + visual examples
4. CTA: **“Try this in Replay”**

**Emotion:** Confident, curious

**Screens**

* Learning Hub
* Topic Detail
* CTA to Replay

---

### Path B: Practice (Replay & Demo Trading)

1. User selects **Replay Market**
2. Chooses:

   * Asset (stock / index / crypto)
   * Historical date range
3. Replay starts (WebSocket-driven)
4. User places demo buy/sell trades
5. Portfolio updates in real time
6. End of replay → results summary

**Emotion:** Tension → Insight → Satisfaction

**Screens**

* Replay Setup
* Replay Trading Screen
* Replay Results

**Possible Confusion Point**

* Understanding P&L → solved via inline tooltips

---

## 4. Contest Journey (Core Product Loop)

### Step 1: Discover Contest

* User clicks **Join Contest**
* Sees list of contests:

  * Crypto
  * Index / ETF
  * Basket contests
* Contest card shows:

  * Entry fee
  * Duration
  * Prize pool
  * Allowed assets

**Emotion:** Excitement, competitiveness

**Screen**

* Contest Listing

---

### Step 2: Join & Allocation (Pre-Commit)

1. User selects contest
2. Pays entry fee
3. Gets equal virtual capital
4. Allocation screen:

   * Select allowed assets
   * Allocate % via sliders
5. User clicks **Lock Allocation**

**Emotion:** Nervous + strategic thinking

**Critical Point**

* Allocation lock confirmation (cannot edit after)

**Screens**

* Contest Detail
* Allocation Builder
* Lock Confirmation Modal

---

### Step 3: Contest Runs

* Contest starts automatically
* User watches portfolio value change
* Live leaderboard updates via WebSockets
* No trading actions allowed

**Emotion:** High tension, dopamine-driven

**Screen**

* Contest Live View
* Leaderboard

---

### Step 4: Results & Rewards

* Contest ends
* Final ranking displayed
* Prize distribution shown
* User sees:

  * Asset-wise performance
  * What worked / didn’t

**Emotion:** Joy (win) or reflection (loss)

**Screens**

* Contest Results
* Performance Breakdown

---

## 5. Alternate & Edge Paths

### A. User Loses Contest

* Sees educational breakdown
* CTA: **“Replay this contest”** or **“Improve via Practice”**

**Emotion:** Mild frustration → motivation

---

### B. User Drops Midway

* In replay: progress auto-saved
* In contest: allocation already locked → contest continues

---

### C. Payment Failure

* Retry option
* Wallet untouched
* Clear error messaging

---

## 6. Key Failure / Confusion Points

| Point                           | Risk               | Mitigation                             |
| ------------------------------- | ------------------ | -------------------------------------- |
| Allocation locking              | Fear of mistake    | Preview + confirmation modal           |
| Contest fairness                | Trust issues       | Transparent rules + asset price replay |
| P&L understanding               | Beginner confusion | Inline explanations                    |
| Education vs betting perception | Regulatory risk    | Strong “learning-first” messaging      |

---

## 7. Screen List (MVP)

1. Landing Page
2. Google OAuth
3. Onboarding
4. Dashboard
5. Learning Hub
6. Replay Setup
7. Replay Trading Screen
8. Contest Listing
9. Contest Detail
10. Allocation Builder
11. Contest Live View
12. Leaderboard
13. Results & Analytics
14. Profile & History

