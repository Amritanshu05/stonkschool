# StonkSchool Backend

A fantasy trading and education platform backend built with Rust, Axum, and PostgreSQL. This backend powers the StonkSchool MVP - a platform where users learn trading through market replay, paper trading, and skill-based contests.

## Architecture

This is a **modular monolith** backend following the specifications from the StonkSchool documentation. It integrates the `zerodha-ss` library for real-time market data streaming.

### Core Components

- **Authentication Module**: Google OAuth-based authentication with session management
- **User & Profile Service**: User identity and performance tracking
- **Wallet Service**: Virtual coin management for contest entry fees and prizes
- **Market Data Service**: Historical and real-time market price data
- **Replay Engine**: Deterministic market replay with speed controls
- **Demo Trading Engine**: Paper trading during replay sessions
- **Contest Management**: Contest lifecycle, joining, and allocation locking
- **Contest Engine**: Portfolio calculation and leaderboard updates
- **WebSocket Gateway**: Real-time updates for replay and contests

## Tech Stack

- **Framework**: Axum (async web framework)
- **Database**: PostgreSQL with SQLx
- **Real-time**: WebSockets for live updates
- **Authentication**: OAuth2 (Google)
- **Market Data Integration**: zerodha-ss library

## Prerequisites

- Rust 1.75+ (edition 2021)
- PostgreSQL 14+
- Google OAuth credentials

## Setup

1. **Clone and navigate to backend**:
   ```bash
   cd stonkschool/backend
   ```

2. **Install dependencies**:
   ```bash
   cargo build
   ```

3. **Setup PostgreSQL**:
   ```bash
   # Create database
   createdb stonkschool
   
   # Migrations will run automatically on startup
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`
   - Copy Client ID and Secret to `.env`

## Running

### Development
```bash
cargo run
```

### Production
```bash
cargo build --release
./target/release/stonkschool-backend
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Documentation

The API follows RESTful conventions with base path `/api/v1`. See the [API Specification Document](../stonkschool/Documents/API_Specification_Document.md) for complete details.

### Key Endpoints

#### Authentication
- `GET /api/v1/auth/google` - Start OAuth flow
- `GET /api/v1/auth/google/callback` - OAuth callback
- `POST /api/v1/auth/logout` - Logout

#### Users & Wallet
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/wallet` - Get wallet balance
- `GET /api/v1/wallet/transactions` - Get transaction history

#### Assets & Market Data
- `GET /api/v1/assets` - List all assets
- `GET /api/v1/market-data/:asset_id` - Get historical prices

#### Replay & Demo Trading
- `POST /api/v1/replay` - Create replay session
- `POST /api/v1/replay/:id/trade` - Place demo trade

#### Contests
- `GET /api/v1/contests` - List contests
- `GET /api/v1/contests/:id` - Contest details
- `POST /api/v1/contests/:id/join` - Join contest
- `POST /api/v1/contests/:id/allocate` - Lock allocation
- `GET /api/v1/contests/:id/leaderboard` - View leaderboard

#### WebSockets
- `WS /ws/replay/:replay_id` - Real-time replay stream
- `WS /ws/contest/:contest_id` - Live contest updates

## Database Migrations

Migrations are automatically applied on startup using SQLx. Migration files are in `migrations/`:

- `001_create_users_and_wallets.sql` - User authentication and wallet system
- `002_create_assets_and_market_data.sql` - Asset and price data tables
- `003_create_contests.sql` - Contest system tables

## Project Structure

```
backend/
├── src/
│   ├── main.rs              # Application entry point
│   ├── config.rs            # Configuration management
│   ├── db.rs                # Database connection pool
│   ├── error.rs             # Error handling
│   └── modules/
│       ├── mod.rs           # Module exports
│       ├── auth.rs          # Authentication
│       ├── users.rs         # User management
│       ├── wallet.rs        # Wallet operations
│       ├── assets.rs        # Asset listing
│       ├── market_data.rs   # Market price data
│       ├── replay.rs        # Replay engine
│       ├── contests.rs      # Contest management
│       └── websocket.rs     # WebSocket handlers
├── migrations/              # SQL migrations
├── Cargo.toml              # Rust dependencies
└── .env.example            # Environment template
```

## Development Guidelines

### Adding New Features

1. Read the feature requirements in `../stonkschool/Documents/`
2. Follow the database schema in `Database_Design_Document.md`
3. Match API contracts in `API_Specification_Document.md`
4. Respect state machine rules from `State_Machine_Diagram_Description.md`

### Code Style

- Use `cargo fmt` for formatting
- Run `cargo clippy` for linting
- Follow Rust naming conventions
- Document public APIs with doc comments

### Testing

```bash
cargo test
```

## Integration with zerodha-ss

The backend integrates the `zerodha-ss` library for real-time market data streaming from Zerodha's Kite WebSocket. The library provides:

- Real-time tick data (LTP, Quote, Full depth)
- WebSocket connection management
- Binary protocol parsing
- Async streaming interface

For MVP, we primarily use it for:
1. **Live Market Data**: Ingesting real-time prices for contests
2. **Historical Data Population**: Building the market_prices table

## Next Steps

- [ ] Implement session middleware with cookie extraction
- [ ] Add market data ingestion service using zerodha-ss
- [ ] Build contest execution engine with portfolio calculations
- [ ] Implement prize distribution logic
- [ ] Add rate limiting per user
- [ ] Set up monitoring and logging aggregation
- [ ] Create admin panel APIs for contest management
- [ ] Add comprehensive integration tests

## Production Deployment

See `../stonkschool/Documents/DevOps_&_Deployment_Document.md` for deployment strategy.

## License

Proprietary - StonkSchool MVP

## Support

For questions or issues, refer to the project documentation in `../stonkschool/Documents/`.
