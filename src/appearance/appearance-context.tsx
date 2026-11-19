import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

export type AppAppearance = { theme: "system" | "light" | "dark"; drawerSide: "left" | "right"; aiChatEnabled: boolean };
type AppearanceContextValue = AppAppearance & { ready: boolean; isDark: boolean; setTheme(value: AppAppearance["theme"]): void; setDrawerSide(value: AppAppearance["drawerSide"]): void; setAiChatEnabled(value: boolean): void };
const DEFAULTS: AppAppearance = { theme: "system", drawerSide: "left", aiChatEnabled: true };
const KEY = "gharsync.appearance.v1";
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<AppAppearance>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const systemTheme = useColorScheme();
  useEffect(() => {
    void SecureStore.getItemAsync(KEY).then((stored) => {
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppAppearance>;
        setAppearance({
          theme: parsed.theme === "light" || parsed.theme === "dark" ? parsed.theme : "system",
          drawerSide: parsed.drawerSide === "right" ? "right" : "left",
          aiChatEnabled: typeof parsed.aiChatEnabled === "boolean" ? parsed.aiChatEnabled : DEFAULTS.aiChatEnabled,
        });
      }
    }).catch(() => undefined).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) void SecureStore.setItemAsync(KEY, JSON.stringify(appearance)).catch(() => undefined);
  }, [appearance, ready]);
  const update = useCallback((patch: Partial<AppAppearance>) => {
    setAppearance((current) => ({ ...current, ...patch }));
  }, []);
  const isDark = appearance.theme === "dark" || (appearance.theme === "system" && systemTheme === "dark");
  const value = useMemo(() => ({ ...appearance, ready, isDark, setTheme: (theme: AppAppearance["theme"]) => update({ theme }), setDrawerSide: (drawerSide: AppAppearance["drawerSide"]) => update({ drawerSide }), setAiChatEnabled: (aiChatEnabled: boolean) => update({ aiChatEnabled }) }), [appearance, ready, isDark, update]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error("useAppearance must be used inside AppearanceProvider");
  return value;
}
