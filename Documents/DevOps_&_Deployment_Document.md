---

# 1. Deployment Philosophy

This MVP is designed to be:

* **Simple to deploy**
* **Cheap to run**
* **Safe to rollback**
* **Scalable later**

Architecture choice:

* **Single Rust (Axum) backend**
* **SPA frontend**
* **WebSockets for real-time**
* **Managed database**
* **Container-based deployment**

We deliberately avoid over-complex infra (Kubernetes) for MVP.

---

# 2. Environments

| Environment  | Purpose                |
| ------------ | ---------------------- |
| `local`      | Developer machines     |
| `staging`    | Pre-production testing |
| `production` | Live users             |

Each environment has **isolated DB, secrets, and OAuth config**.

---

# 3. Branching Strategy (Git)

### Strategy: **Trunk-based + short-lived branches**

```
main        → always deployable
feature/*   → short-lived feature branches
hotfix/*    → urgent fixes
```

### Rules

* `main` is protected
* PR required for merge
* CI must pass before merge
* Feature branches deleted after merge

---

# 4. CI/CD Pipeline (Step-by-Step)

### Tooling

* GitHub Actions (CI/CD)
* Docker
* Cloud provider (VPS / managed platform)

---

## 4.1 CI Pipeline (On Pull Request)

### Trigger

* PR opened or updated → `main`

### Steps

1. **Checkout code**
2. **Install Rust toolchain**
3. **Run formatting**

   ```bash
   cargo fmt --check
   ```
4. **Run linting**

   ```bash
   cargo clippy -- -D warnings
   ```
5. **Run tests**

   ```bash
   cargo test
   ```
6. **Build backend**

   ```bash
   cargo build --release
   ```
7. **Build frontend**

   ```bash
   npm install
   npm run build
   ```

### Outcome

* CI must pass to allow merge

---

## 4.2 CD Pipeline (On Merge to main)

### Trigger

* Merge into `main`

### Steps

1. Build Docker image
2. Tag image with commit SHA
3. Push to container registry
4. Deploy to target environment
5. Run smoke health checks
6. Mark deployment successful

---

# 5. Build & Run Commands

## Backend (Rust + Axum)

### Local

```bash
cargo run
```

### Production build

```bash
cargo build --release
```

---

## Frontend (SPA)

```bash
npm install
npm run build
```

Build output served as static files.

---

# 6. Deployment Workflow

### Step-by-Step (Production)

1. Developer merges PR to `main`
2. CI builds & tests code
3. CD builds Docker image:

   ```
   trading-mvp-backend:<commit-sha>
   ```
4. Image pushed to registry
5. Server pulls new image
6. Old container stopped
7. New container started
8. Health endpoint checked
9. Traffic switched to new version

---

# 7. Server / Cloud Configuration

### Recommended MVP Setup

#### Compute

* 1× VPS (4 GB RAM, 2 vCPU)
* Docker installed
* Nginx as reverse proxy

#### Services on Server

* Backend container
* Frontend static files
* Nginx
* Monitoring agent

---

### Nginx Responsibilities

* HTTPS termination
* Reverse proxy to Axum backend
* WebSocket forwarding
* Static file serving

---

### WebSocket Configuration (Important)

```
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

# 8. Database Deployment

### Database

* PostgreSQL (Managed preferred)

### Configuration

* Daily automated backups
* Read/write credentials per environment
* SSL enforced

---

# 9. Environment Variables

### Backend (.env)

| Variable                     | Purpose                |
| ---------------------------- | ---------------------- |
| `DATABASE_URL`               | PostgreSQL connection  |
| `GOOGLE_OAUTH_CLIENT_ID`     | OAuth                  |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth                  |
| `SESSION_SECRET`             | Cookie encryption      |
| `MARKET_DATA_API_KEY`        | Market data            |
| `PAYMENT_GATEWAY_KEY`        | Payments               |
| `ENV`                        | local / staging / prod |

---

### Frontend

| Variable                | Purpose       |
| ----------------------- | ------------- |
| `VITE_API_BASE_URL`     | Backend URL   |
| `VITE_WS_BASE_URL`      | WebSocket URL |
| `VITE_GOOGLE_CLIENT_ID` | OAuth         |

---

# 10. Secrets Management

* No secrets in repo
* Stored in:

  * GitHub Secrets (CI)
  * Server environment variables
* Rotated periodically

---

# 11. Rollback Strategy

### Immediate Rollback (Fast)

1. Identify last stable image
2. Stop current container
3. Start previous image
4. Reattach traffic

```bash
docker run trading-mvp-backend:<previous-sha>
```

### DB Rollback

* No destructive migrations in MVP
* Backups available for restore

---

# 12. Monitoring & Logging

### Logging

* Structured JSON logs
* stdout/stderr collected by Docker

### Metrics

* API latency
* WebSocket connections
* Error rates

### Alerts

* High error rate
* Container crash
* DB unavailable

---

# 13. Deployment Diagram (Textual)

```
[ Developer ]
     |
     v
[ GitHub Repo ]
     |
     v
[ GitHub Actions CI/CD ]
     |
     v
[ Container Registry ]
     |
     v
[ VPS Server ]
     |
     +--> [ Nginx ]
     |        |
     |        +--> [ Frontend (Static) ]
     |        |
     |        +--> [ Axum Backend (Docker) ]
     |
     +--> [ PostgreSQL (Managed) ]
     |
     +--> [ Market Data APIs ]
     |
     +--> [ Google OAuth ]
```
