-- Seed script for initial data
-- Run with: psql -U postgres -d stonkschool -f seed.sql

-- Clear existing data (careful in production!)
TRUNCATE TABLE contest_leaderboard, contest_allocations, contest_participants, contest_assets, contests, 
            market_prices, replay_trades, replay_sessions, assets, 
            wallet_transactions, wallets, user_profiles, user_sessions, users CASCADE;

-- Insert sample assets
INSERT INTO assets (id, symbol, name, asset_type, exchange, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'BTC', 'Bitcoin', 'crypto', 'BINANCE', true),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'ETH', 'Ethereum', 'crypto', 'BINANCE', true),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'SOL', 'Solana', 'crypto', 'BINANCE', true),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'NIFTY50', 'Nifty 50 Index', 'index', 'NSE', true),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'BANKNIFTY', 'Bank Nifty Index', 'index', 'NSE', true),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'INFY', 'Infosys Ltd', 'equity', 'NSE', true),
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, 'TCS', 'Tata Consultancy Services', 'equity', 'NSE', true),
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, 'RELIANCE', 'Reliance Industries', 'equity', 'NSE', true),
  ('550e8400-e29b-41d4-a716-446655440009'::uuid, 'NIFTYBEES', 'Nifty BeES ETF', 'etf', 'NSE', true),
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'BANKBEES', 'Bank BeES ETF', 'etf', 'NSE', true);

-- Insert sample market prices (last 24 hours of data)
-- BTC prices
INSERT INTO market_prices (asset_id, timestamp, open, high, low, close, volume)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  NOW() - (interval '1 minute' * generate_series(0, 1440)),
  42000 + (random() * 1000 - 500),
  42000 + (random() * 1000),
  42000 - (random() * 1000),
  42000 + (random() * 1000 - 500),
  10000 + (random() * 5000)
FROM generate_series(0, 1440);

-- ETH prices
INSERT INTO market_prices (asset_id, timestamp, open, high, low, close, volume)
SELECT 
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  NOW() - (interval '1 minute' * generate_series(0, 1440)),
  2200 + (random() * 100 - 50),
  2200 + (random() * 100),
  2200 - (random() * 100),
  2200 + (random() * 100 - 50),
  50000 + (random() * 10000)
FROM generate_series(0, 1440);

-- Insert sample contests
INSERT INTO contests (id, title, track, entry_fee, virtual_capital, start_time, end_time, status) VALUES
  -- Crypto contests
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, 'BTC Daily Sprint', 'crypto', 50, 100000, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '26 hours', 'upcoming'),
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, 'Crypto Masters', 'crypto', 100, 200000, NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 days', 'upcoming'),
  
  -- ETF contests
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, 'Index Fund Challenge', 'etf', 30, 100000, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '27 hours', 'upcoming'),
  
  -- Basket contests
  ('650e8400-e29b-41d4-a716-446655440004'::uuid, 'Tech Stocks Showdown', 'basket', 75, 150000, NOW() + INTERVAL '4 hours', NOW() + INTERVAL '28 hours', 'upcoming'),
  ('650e8400-e29b-41d4-a716-446655440005'::uuid, 'Blue Chip Battle', 'basket', 60, 120000, NOW() + INTERVAL '5 hours', NOW() + INTERVAL '29 hours', 'upcoming');

-- Link assets to contests
-- BTC Daily Sprint (crypto)
INSERT INTO contest_assets (id, contest_id, asset_id) VALUES
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid), -- BTC
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid); -- ETH

-- Crypto Masters
INSERT INTO contest_assets (id, contest_id, asset_id) VALUES
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid), -- BTC
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid), -- ETH
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid); -- SOL

-- Index Fund Challenge (etf)
INSERT INTO contest_assets (id, contest_id, asset_id) VALUES
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440009'::uuid), -- NIFTYBEES
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid); -- BANKBEES

-- Tech Stocks Showdown (basket)
INSERT INTO contest_assets (id, contest_id, asset_id) VALUES
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid), -- INFY
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440007'::uuid); -- TCS

-- Blue Chip Battle (basket)
INSERT INTO contest_assets (id, contest_id, asset_id) VALUES
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid), -- INFY
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440007'::uuid), -- TCS
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid); -- RELIANCE

-- Update contest statuses (some should be open for joining)
UPDATE contests SET status = 'joining_open' WHERE id IN (
  '650e8400-e29b-41d4-a716-446655440001'::uuid,
  '650e8400-e29b-41d4-a716-446655440003'::uuid
);

-- Print summary
SELECT 'Seed data inserted successfully!' as status;
SELECT COUNT(*) as asset_count FROM assets;
SELECT COUNT(*) as contest_count FROM contests;
SELECT COUNT(*) as price_records FROM market_prices;
