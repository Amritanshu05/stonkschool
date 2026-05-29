const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3000";

export { API_URL, WS_URL };

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}/api/v1${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        if (parsed.message) {
          message = parsed.message;
        } else if (parsed.error) {
          message = parsed.error;
        }
      }
    } catch {
      // not JSON
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    googleUrl: `${API_URL}/auth/google`,
    logout: () => apiFetch<{ success: boolean }>("/auth/logout", { method: "POST" }),
  },

  // ─── Users ──────────────────────────────────────────────────────────────
  users: {
    me: () =>
      apiFetch<{
        id: string;
        email: string;
        display_name: string;
        wallet_balance: number;
        stats: { contests_played: number; contests_won: number };
      }>("/users/me"),
  },

  // ─── Wallet ─────────────────────────────────────────────────────────────
  wallet: {
    balance: () => apiFetch<{ balance: number; currency: string }>("/wallet"),
    transactions: () =>
      apiFetch<
        Array<{
          id: string;
          amount: number;
          type: string;
          created_at: string;
        }>
      >("/wallet/transactions"),
  },

  // ─── Assets ─────────────────────────────────────────────────────────────
  assets: {
    list: (type?: "crypto" | "etf" | "equity") =>
      apiFetch<Array<{ id: string; symbol: string; type: string }>>(
        `/assets${type ? `?type=${type}` : ""}`
      ),
    history: (assetId: string, from: string, to: string) =>
      apiFetch<
        Array<{
          timestamp: string;
          open: number;
          high: number;
          low: number;
          close: number;
        }>
      >(`/market-data/${assetId}?from=${from}&to=${to}`),
  },

  // ─── Replay ─────────────────────────────────────────────────────────────
  replay: {
    create: (body: { asset_id: string; from: string; to: string }) =>
      apiFetch<{ replay_id: string; ws_url: string }>("/replay", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    trade: (replayId: string, body: { side: "buy" | "sell"; quantity: number; price?: number }) =>
      apiFetch<{ success: boolean }>(`/replay/${replayId}/trade`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  // ─── Contests ───────────────────────────────────────────────────────────
  contests: {
    list: () =>
      apiFetch<
        Array<{
          id: string;
          title: string;
          track: string;
          entry_fee: number;
          start_time: string;
          status: "upcoming" | "live" | "ended";
        }>
      >("/contests"),
    get: (id: string) =>
      apiFetch<{
        id: string;
        title: string;
        track: string;
        entry_fee: number;
        start_time: string;
        status: string;
        assets: Array<{ id: string; symbol: string }>;
        rules: { max_assets: number; min_allocation_pct: number };
      }>(`/contests/${id}`),
    join: (id: string) =>
      apiFetch<{ participant_id: string; virtual_capital: number }>(
        `/contests/${id}/join`,
        { method: "POST" }
      ),
    allocate: (
      id: string,
      allocations: Array<{ asset_id: string; pct: number }>
    ) =>
      apiFetch<{ locked: boolean }>(`/contests/${id}/allocate`, {
        method: "POST",
        body: JSON.stringify({ allocations }),
      }),
    status: (id: string) =>
      apiFetch<{
        status: string;
        current_rank: number | null;
        portfolio_value: number | null;
        joined: boolean;
        locked: boolean;
      }>(`/contests/${id}/status`),
    results: (id: string) =>
      apiFetch<{ rank: number; final_value: number; payout: number }>(
        `/contests/${id}/results`
      ),
    leaderboard: (id: string) =>
      apiFetch<Array<{ rank: number; user: string; value: number }>>(
        `/contests/${id}/leaderboard`
      ),
  },
};

export { ApiError };
