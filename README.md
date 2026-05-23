# 🎓 StonkSchool

![Status](https://img.shields.io/badge/status-Backend_Complete-brightgreen)
![Rust](https://img.shields.io/badge/language-Rust-orange)
![Next.js](https://img.shields.io/badge/framework-Next.js-blue)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue)

StonkSchool is an educational and skills-based fantasy trading platform. It provides a risk-free environment for users to learn financial markets, test trading strategies using historical market replays, and compete in standard-capital contests across Crypto, ETFs, and Equities. 

This project aims to bridge the gap between static theory and live-pressure trading by gamifying market learning without putting real capital on the line.

---

## 🎯 Architecture & Tech Stack

StonkSchool uses a unified **Rust** backend processing real real-time data, and a modern **Next.js** frontend.

### Backend (Fully Operational)
- **Framework:** Rust + Axum 0.7 
- **Database:** PostgreSQL 14 handled via SQLx
- **Authentication:** Google OAuth 2.0
- **Real-Time Gateway:** WebSockets + `zerodha-ss` (Live Market Data Implementation)
- **Features Details:** [Backend Running Status](./BACKEND_RUNNING_STATUS.md)

### Frontend (In Development)
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS / utility-classes
- **State/Data:** API fetching + WebSockets for Contests/Live pricing

---

## 🚀 Core Features

* **Market Replay Engine:** Stream historical OHLC data on-demand and make paper trades in a time-controlled environment.
* **Skill-based Contests:** Equal-capital, zero real-risk fantasy trading tournaments.
* **Pre-Commit Allocation:** Users lock dynamic portfolio weights before contests begin to ensure absolute fairness.
* **Live WebSockets:** Live streaming leaderboards, real-time portfolio scoring, and replay charting.
* **Virtual Economy:** Fully operational virtual wallet and immutable ledger logic out-of-the-box.

---

## 📖 Essential Documentation for Contributors (AI & Human)

If you are picking up this project to build out the frontend, it relies heavily on the documented contracts already established in this repository. Ensure you read the following context documents:

1. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** – Overview of all functional backend components.
2. **[HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** – Architectural workflow, WebSocket messaging formats, and system boundaries.
3. **[API_Specification_Document.md](./Documents/API_Specification_Document.md)** – Strict API contracts for writing your API client layer.
4. **[Feature_Requirements_Document_(FRD).md](./Documents/Feature_Requirements_Document_(FRD).md)** – Business rules, state machine flow, and MVP targets.

---

## 🛠️ Getting Started

### 1. Database Setup
Ensure PostgreSQL 14 is running locally. Copy `.env.example` to `.env` in the `backend/` directory according to backend instructions.
```bash
# Apply sqlx migrations to spin up the 14 local DB tables
cd backend
sqlx migrate run
```

### 2. Run the Backend Server
```bash
cd backend
cargo run
```
The server will boot up via localhost at `http://0.0.0.0:3000`. Test it by navigating to `http://localhost:3000/health`.

### 3. Run the Frontend 
```bash
cd frontend
npm install
npm run dev
```

---

## ⚖️ License & Disclaimers

**Disclaimer:** StonkSchool involves simulated fantasy transactions using virtual coins strictly for educational reasons. No real brokerage capital is bridged or permitted.