# StonkSchool Frontend

Next.js 14 (App Router) + TypeScript + Tailwind. Designed to feel like a calm, premium fintech product — heavy whitespace, small radii, soft shadows, calm green. Talks to the existing Rust/Axum backend over `fetch` (`credentials: include`) and WebSockets.

## Quick start

```bash
# 1. Make sure the backend is running on http://localhost:3000
#    (see backend/README — uses seed mode by default)

cd frontend
cp .env.local.example .env.local        # only if .env.local does not exist
npm install
npm run dev                              # starts on http://localhost:3001
```

The backend's `FRONTEND_URL` must match the port Next is on (`3001`). The Google OAuth callback will redirect there automatically.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run type-check` | TypeScript check (no emit) |
| `npm run lint` | ESLint via `next lint` |

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Rust backend HTTP base |
| `NEXT_PUBLIC_WS_URL`  | `ws://localhost:3000`   | WebSocket base |

## File map

```
src/
├─ app/
│  ├─ layout.tsx                       # root html + Inter font
│  ├─ globals.css                      # Tailwind base + design tokens
│  ├─ page.tsx                         # landing (public)
│  ├─ login/page.tsx                   # Google sign-in
│  ├─ error.tsx, not-found.tsx
│  └─ (app)/                           # authenticated route group (shares AppShell)
│     ├─ layout.tsx
│     ├─ dashboard/page.tsx
│     ├─ learn/page.tsx, learn/[slug]/page.tsx
│     ├─ contests/page.tsx
│     ├─ contests/[id]/page.tsx
│     ├─ contests/[id]/allocate/page.tsx
│     ├─ contests/[id]/live/page.tsx
│     ├─ contests/[id]/results/page.tsx
│     ├─ replay/page.tsx
│     └─ replay/[id]/page.tsx
├─ components/
│  ├─ ui/                              # Button, Card, Badge, Stat, Avatar, Logo, Skeleton, EmptyState
│  ├─ shell/                           # AppShell, AppHeader, Footer, PageHeader, RequireAuth
│  ├─ landing/                         # Hero, Features, HowItWorks, Trust
│  ├─ dashboard/DashboardView.tsx
│  ├─ learn/LearnView.tsx
│  ├─ contests/                        # ContestList, ContestDetail, Allocate, Live, Results
│  └─ replay/                          # ReplayLanding, ReplaySession, ReplayChart
└─ lib/
   ├─ api.ts                           # fetch wrapper + ApiError + WS_URL
   ├─ types.ts                         # mirrors backend response shapes
   ├─ hooks.ts                         # SWR hooks for every endpoint
   ├─ useWebsocket.ts                  # JSON WebSocket hook with auto-reconnect
   ├─ format.ts                        # VC, %, dates
   └─ cn.ts                            # tiny class-name joiner
```

## Backend wiring (frontend → backend)

| Screen | Route | Backend endpoint |
| --- | --- | --- |
| Landing | `/` | none (uses `/api/v1/auth/google` link) |
| Login | `/login` | `GET /api/v1/auth/google` (redirect) |
| Dashboard | `/dashboard` | `/users/me`, `/users/me/contests`, `/wallet`, `/wallet/transactions`, `/contests` |
| Learn | `/learn`, `/learn/[slug]` | none (static MVP content) |
| Contests | `/contests` | `/contests` |
| Contest detail | `/contests/[id]` | `/contests/:id`, `/contests/:id/leaderboard`, `/contests/:id/join` |
| Allocate | `/contests/[id]/allocate` | `/contests/:id`, `/contests/:id/allocate` |
| Live | `/contests/[id]/live` | `/contests/:id`, `/contests/:id/status`, `/contests/:id/leaderboard`, `ws /ws/contest/:id` |
| Results | `/contests/[id]/results` | `/contests/:id`, `/contests/:id/results`, `/contests/:id/leaderboard` |
| Replay picker | `/replay` | `/assets`, `/replay` |
| Replay session | `/replay/[id]` | `/replay/:id/trade`, `ws /ws/replay/:id` |

## Design tokens

Defined in `tailwind.config.ts`:

* `brand` — original teal scale, primary at `#0DA068`.
* `bg`, `ink`, `line` — light surface system, ample whitespace, low chroma.
* `gain`, `loss`, `warn` — semantic colours for finance numbers.
* Radii: `8/12/14/18/24` (rounded but not bubbly).
* Shadows: `card`, `pop`, `ring` (subtle, layered, never glowy).
* Fonts: Inter via `next/font/google`. Tabular nums via `.num` utility.

## Notes & known limits

* **Auth is client-side gated.** `RequireAuth` waits for `/users/me`; on 401 it pushes `/login`. The cookie does the heavy lifting on the backend.
* **Real Google OAuth** requires the backend's Google client to allow `http://localhost:3001/dashboard` as a trusted post-callback target (already covered because the backend redirect target is computed from `FRONTEND_URL`).
* **Replay charts** use `lightweight-charts` (~70 KB gzipped). Loaded only on the replay session route.
* **The contest-WS** broadcasts every 5 seconds server-side; we render whatever ticks arrive without polling.
