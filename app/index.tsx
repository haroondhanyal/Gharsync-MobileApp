import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "../src/auth/session-context";
import { colors } from "../src/theme";
export default function Index() { const { user, ready } = useSession(); const [splashElapsed, setSplashElapsed] = useState(false); useEffect(() => { const timer = setTimeout(() => setSplashElapsed(true), 1600); return () => clearTimeout(timer); }, []); if (ready && splashElapsed) return <Redirect href={!user ? "/(auth)/sign-in" : user.phoneVerificationRequired ? "/(auth)/verify-phone" : user.memberships?.length ? "/(tabs)" : "/workspace-setup"} />; return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 15, backgroundColor: colors.background }}><Image source={require("../assets/splash-lockup.png")} resizeMode="contain" accessibilityLabel="GharSync" style={{ width: 300, height: 100 }} /><ActivityIndicator color={colors.green} size="small" /><Text style={{ color: "#6E8175", fontSize: 11, letterSpacing: 1.8, marginTop: 4 }}>A BETTER WAY TO HOME</Text></View>; }
