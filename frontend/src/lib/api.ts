/**
 * Tiny, typed fetch wrapper for the StonkSchool Rust backend.
 *
 * - Sends `credentials: "include"` so the `stonkschool_session` cookie flows.
 * - Throws `ApiError` with status + parsed body for predictable handling.
 * - All paths are relative to NEXT_PUBLIC_API_URL.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3000";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  cache?: RequestCache;
  signal?: AbortSignal;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    credentials: "include",
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache ?? "no-store",
    signal: opts.signal,
  });

  let parsed: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : null) ?? res.statusText;
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

/** SWR fetcher — same wrapper, same cookie flow. */
export const swrFetcher = <T,>(path: string) => api<T>(path);

/** Return `null` instead of throwing on 401 — useful for "is the user logged in?" checks. */
export async function apiOrNull<T>(
  path: string,
  opts?: ApiOptions,
): Promise<T | null> {
  try {
    return await api<T>(path, opts);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
