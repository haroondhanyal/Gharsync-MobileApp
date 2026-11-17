import { clearTokens, readTokens, saveTokens, type TokenPair } from "../auth/session-store";
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "http://localhost:4000/api/v1").replace(/\/$/, "");
export class ApiError extends Error { constructor(readonly status: number, message: string) { super(message); this.name = "ApiError"; } }
type Options = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean };
let refreshing: Promise<TokenPair | null> | null = null; let expired: (() => void) | undefined;
export const setSessionExpiredHandler = (handler: () => void) => { expired = handler; };

async function refreshSession(): Promise<TokenPair | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const old = await readTokens(); if (!old) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/mobile/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: old.refreshToken }) });
      if (!response.ok) throw new Error("Session expired. Please sign in again.");
      const next = await response.json() as TokenPair; await saveTokens(next); return next;
    } catch { await clearTokens(); expired?.(); return null; }
    finally { refreshing = null; }
  })();
  return refreshing;
}

async function parse<T>(response: Response): Promise<T> {
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : await response.text().catch(() => "");
  if (!response.ok) { const message = typeof data === "object" && data && "message" in data ? String((data as { message: unknown }).message) : `Request failed (${response.status})`; throw new ApiError(response.status, message); }
  return data as T;
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { auth = true, body, headers: initialHeaders, ...rest } = options;
  const headers = new Headers(initialHeaders);
  if (body !== undefined && !(body instanceof FormData)) headers.set("Content-Type", "application/json");
  let tokens = auth ? await readTokens() : null;
  if (tokens) headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const requestBody = body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body);
  let response = await fetch(url, { ...rest, headers, body: requestBody });
  const publicAuth = ["/auth/mobile/sign-in", "/auth/mobile/register", "/auth/mobile/refresh", "/auth/mobile/sign-out"].includes(path);
  if (response.status === 401 && auth && !publicAuth) {
    tokens = await refreshSession();
    if (tokens) { headers.set("Authorization", `Bearer ${tokens.accessToken}`); response = await fetch(url, { ...rest, headers, body: requestBody }); }
  }
  return parse<T>(response);
}

export function rows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object");
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  for (const key of ["data", "items", "results"]) if (Array.isArray(record[key])) return rows(record[key]);
  return [record];
}
