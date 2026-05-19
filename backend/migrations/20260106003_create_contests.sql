-- Contests table
CREATE TABLE contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    track TEXT NOT NULL CHECK (track IN ('crypto', 'etf', 'basket')),
    entry_fee NUMERIC(10,2) NOT NULL,
    virtual_capital NUMERIC(20,2) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'upcoming', 'joining_open', 'allocation_locked', 'live', 'ended', 'settled', 'cancelled')) DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Contest assets
CREATE TABLE contest_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    weight NUMERIC(5,2),
    UNIQUE(contest_id, asset_id)
);

-- Contest participants
CREATE TABLE contest_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMP,
    final_value NUMERIC(20,2),
    final_rank INT,
    payout NUMERIC(20,2),
    UNIQUE(contest_id, user_id)
);

-- Contest allocations (locked before contest start)
CREATE TABLE contest_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES contest_participants(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    allocation_pct NUMERIC(5,2) NOT NULL CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
    UNIQUE(participant_id, asset_id)
);

-- Contest leaderboard
CREATE TABLE contest_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    portfolio_value NUMERIC(20,2) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(contest_id, user_id)
);

-- Indexes
CREATE INDEX idx_contests_status ON contests(status, start_time);
CREATE INDEX idx_contests_track ON contests(track);
CREATE INDEX idx_contest_participants_contest ON contest_participants(contest_id);
CREATE INDEX idx_contest_participants_user ON contest_participants(user_id);
CREATE INDEX idx_contest_allocations_participant ON contest_allocations(participant_id);
CREATE INDEX idx_contest_leaderboard_contest ON contest_leaderboard(contest_id);
CREATE INDEX idx_contest_leaderboard_rank ON contest_leaderboard(contest_id, rank);
