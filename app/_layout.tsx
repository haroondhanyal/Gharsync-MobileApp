import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider, useSession } from "../src/auth/session-context";
import { colors } from "../src/theme";
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } });
void SplashScreen.preventAutoHideAsync().catch(() => undefined);
function SplashController() { const { ready } = useSession(); useEffect(() => { if (ready) void SplashScreen.hideAsync(); }, [ready]); return null; }
export default function RootLayout() { const detailOptions = { headerShown: true, headerBackTitle: "Back", headerTintColor: colors.forest, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }; return <SafeAreaProvider><QueryClientProvider client={queryClient}><SessionProvider><SplashController /><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="index" /><Stack.Screen name="(auth)" /><Stack.Screen name="(tabs)" /><Stack.Screen name="feature/[slug]" options={{ ...detailOptions, title: "GharSync" }} /><Stack.Screen name="booking/[id]" options={{ ...detailOptions, title: "Booking details" }} /><Stack.Screen name="invoice/[id]" options={{ ...detailOptions, title: "Invoice details" }} /><Stack.Screen name="scan" options={{ ...detailOptions, title: "Scan asset QR" }} /></Stack></SessionProvider></QueryClientProvider></SafeAreaProvider>; }
