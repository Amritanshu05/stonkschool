"use client";

import useSWR from "swr";
import { swrFetcher } from "@/lib/api";
import type {
  ContestDetails,
  ContestListItem,
  ContestStatusResponse,
  LeaderboardEntry,
  MyContest,
  User,
  Wallet,
  WalletTxn,
  Asset,
} from "@/lib/types";

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<User>(
    "/api/v1/users/me",
    swrFetcher,
    { shouldRetryOnError: false, revalidateOnFocus: false },
  );
  // 401 → unauthenticated, surface as `null` user without an error state.
  const unauth =
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status: number }).status === 401;
  return {
    user: unauth ? null : data ?? null,
    isLoading: isLoading && !unauth,
    error: unauth ? null : error,
    mutate,
  };
}

export function useWallet() {
  return useSWR<Wallet>("/api/v1/wallet", swrFetcher, {
    revalidateOnFocus: false,
  });
}

export function useWalletTransactions() {
  return useSWR<WalletTxn[]>("/api/v1/wallet/transactions", swrFetcher);
}

export function useContests() {
  return useSWR<ContestListItem[]>("/api/v1/contests", swrFetcher, {
    refreshInterval: 30_000,
  });
}

export function useContestDetails(id: string | undefined) {
  return useSWR<ContestDetails>(
    id ? `/api/v1/contests/${id}` : null,
    swrFetcher,
  );
}

export function useContestStatus(id: string | undefined) {
  return useSWR<ContestStatusResponse>(
    id ? `/api/v1/contests/${id}/status` : null,
    swrFetcher,
    { refreshInterval: 5000 },
  );
}

export function useLeaderboard(id: string | undefined) {
  return useSWR<LeaderboardEntry[]>(
    id ? `/api/v1/contests/${id}/leaderboard` : null,
    swrFetcher,
    { refreshInterval: 8000 },
  );
}

export function useMyContests() {
  return useSWR<MyContest[]>("/api/v1/users/me/contests", swrFetcher);
}

export function useAssets(type?: string) {
  const key = type ? `/api/v1/assets?type=${type}` : "/api/v1/assets";
  return useSWR<Asset[]>(key, swrFetcher);
}
