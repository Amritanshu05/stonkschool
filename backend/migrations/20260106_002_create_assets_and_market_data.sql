-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto', 'equity', 'etf', 'index')),
    exchange TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Market prices (time-series data)
CREATE TABLE market_prices (
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    open NUMERIC(12,4) NOT NULL,
    high NUMERIC(12,4) NOT NULL,
    low NUMERIC(12,4) NOT NULL,
    close NUMERIC(12,4) NOT NULL,
    volume NUMERIC(20,4),
    PRIMARY KEY (asset_id, timestamp)
);

-- Replay sessions
CREATE TABLE replay_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Replay trades (paper trading)
CREATE TABLE replay_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    replay_id UUID NOT NULL REFERENCES replay_sessions(id) ON DELETE CASCADE,
    side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    price NUMERIC(12,4) NOT NULL,
    quantity NUMERIC(12,4) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_market_prices_asset_timestamp ON market_prices(asset_id, timestamp DESC);
CREATE INDEX idx_replay_sessions_user_id ON replay_sessions(user_id);
CREATE INDEX idx_replay_trades_replay_id ON replay_trades(replay_id);
