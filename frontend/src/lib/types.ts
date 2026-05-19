/** Mirrors the Rust backend response types. Keep in sync with `backend/src/modules`. */

export type Uuid = string;

export interface User {
  id: Uuid;
  email: string;
  display_name: string;
  wallet_balance: number;
  stats: {
    contests_played: number;
    contests_won: number;
  };
}

export interface Wallet {
  balance: number;
  currency: string;
}

export interface WalletTxn {
  id: Uuid;
  amount: number;
  type: "entry_fee" | "prize" | "reset" | "initial";
  created_at: string;
}

export type ContestStatus =
  | "draft"
  | "upcoming"
  | "joining_open"
  | "allocation_locked"
  | "live"
  | "ended"
  | "settled"
  | "cancelled";

export interface ContestListItem {
  id: Uuid;
  title: string;
  track: string;
  entry_fee: number;
  start_time: string;
  status: ContestStatus;
}

export interface AssetInfo {
  id: Uuid;
  symbol: string;
}

export interface ContestDetails {
  id: Uuid;
  title: string;
  track: string;
  entry_fee: number;
  virtual_capital: number;
  start_time: string;
  end_time: string;
  status: ContestStatus;
  assets: AssetInfo[];
}

export interface JoinContestResponse {
  participant_id: Uuid;
  virtual_capital: number;
}

export interface AllocationItem {
  asset_id: Uuid;
  pct: number;
}

export interface ContestStatusResponse {
  status: ContestStatus;
  current_rank: number | null;
  portfolio_value: number | null;
}

export interface ContestResults {
  rank: number;
  final_value: number;
  payout: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: string;
  value: number;
}

export interface MyContest {
  contest_id: Uuid;
  title: string;
  track: string;
  status: ContestStatus;
  start_time: string;
  end_time: string;
  locked_at: string | null;
  current_rank: number | null;
  portfolio_value: number | null;
}

export interface Asset {
  id: Uuid;
  symbol: string;
  name: string;
  type: string;
}

export interface PriceCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CreateReplayResponse {
  replay_id: Uuid;
  ws_url: string;
}

export interface DemoTradeResponse {
  success: boolean;
  price: number;
  side: "buy" | "sell";
  quantity: number;
}

export interface ReplayTickMsg {
  timestamp: string;
  price: number;
}

export type ContestWsMsg = LeaderboardEntry[];
