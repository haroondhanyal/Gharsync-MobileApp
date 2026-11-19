import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider } from "../src/auth/session-context";
import { AppearanceProvider } from "../src/appearance/appearance-context";
import { AiChatFab } from "../src/components/ai-chat-fab";
import { useAppearance } from "../src/appearance/appearance-context";
import { colors } from "../src/theme";
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } });
void SplashScreen.preventAutoHideAsync().catch(() => undefined);
function SplashController() { useEffect(() => { const frame = requestAnimationFrame(() => void SplashScreen.hideAsync()); return () => cancelAnimationFrame(frame); }, []); return null; }
function AppRoutes() { const { isDark } = useAppearance(); return <><SplashController /><StatusBar style={isDark ? "light" : "dark"} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? "#101A17" : colors.background } }}><Stack.Screen name="index" /><Stack.Screen name="(auth)" /><Stack.Screen name="(tabs)" /></Stack><AiChatFab /></>; }
export default function RootLayout() { return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><QueryClientProvider client={queryClient}><AppearanceProvider><SessionProvider><AppRoutes /></SessionProvider></AppearanceProvider></QueryClientProvider></SafeAreaProvider></GestureHandlerRootView>; }
