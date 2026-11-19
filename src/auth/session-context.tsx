import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { api, setSessionExpiredHandler } from "../api/client";
import { clearTokens, readTokens, saveTokens, type TokenPair } from "./session-store";

export type AppUser = { id: string; fullName: string; email: string; phoneVerificationRequired?: boolean; phoneVerifiedAt?: string | null; memberships?: Array<{ organizationId?: string; role?: string; organization?: { id: string; name: string } }> };
type ContextValue = { user: AppUser | null; ready: boolean; signIn(email: string, password: string): Promise<AppUser>; register(data: Record<string, string>): Promise<void>; verifyPhone(code: string): Promise<void>; selectOrganization(id: string): Promise<void>; signOut(): Promise<void>; setUser(value: AppUser | null): void };
const Context = createContext<ContextValue | null>(null);
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => {
    setSessionExpiredHandler(() => { setUser(null); router.replace("/(auth)/sign-in"); });
    void (async () => { const stored = await readTokens(); if (stored) { try { const profile = await api<AppUser>("/mobile/me"); setUser({ ...profile, phoneVerificationRequired: !profile.phoneVerifiedAt }); } catch { await clearTokens(); } } setReady(true); })();
    return () => setSessionExpiredHandler(() => undefined);
  }, []);
  const signIn = useCallback(async (email: string, password: string) => { const result = await api<TokenPair & { user: AppUser }>("/mobile/sign-in", { method: "POST", auth: false, body: { email, password } }); await saveTokens(result); setUser(result.user); return result.user; }, []);
  const register = useCallback(async (data: Record<string, string>) => { const result = await api<TokenPair & { user: AppUser }>("/mobile/register", { method: "POST", auth: false, body: data }); await saveTokens(result); }, []);
  const verifyPhone = useCallback(async (code: string) => { await api("/auth/phone-otp/verify", { method: "POST", body: { code } }); const profile = await api<AppUser>("/mobile/me"); setUser({ ...profile, phoneVerificationRequired: false }); }, []);
  const selectOrganization = useCallback(async (id: string) => { const result = await api<{ accessToken: string }>(`/mobile/organizations/${id}/select`, { method: "POST" }); const current = await readTokens(); if (current) await saveTokens({ ...current, accessToken: result.accessToken }); const profile = await api<AppUser>("/mobile/me"); setUser({ ...profile, phoneVerificationRequired: !profile.phoneVerifiedAt }); }, []);
  const signOut = useCallback(async () => { const current = await readTokens(); try { await api("/mobile/sign-out", { method: "POST", auth: false, body: { refreshToken: current?.refreshToken } }); } catch { /* Clear the local session even when offline; the UI must not keep a dead session. */ } finally { await clearTokens(); setUser(null); router.replace("/(auth)/sign-in"); } }, []);
  const value = useMemo(() => ({ user, ready, signIn, register, verifyPhone, selectOrganization, signOut, setUser }), [user, ready, signIn, register, verifyPhone, selectOrganization, signOut]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() { const value = useContext(Context); if (!value) throw new Error("useSession must be inside SessionProvider"); return value; }
