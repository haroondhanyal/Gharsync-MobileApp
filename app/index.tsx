import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "../src/auth/session-context";
import { colors } from "../src/theme";
export default function Index() { const { user, ready } = useSession(); if (ready) return <Redirect href={!user ? "/(auth)/sign-in" : user.phoneVerificationRequired ? "/(auth)/verify-phone" : user.memberships?.length ? "/(tabs)" : "/workspace-setup"} />; return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.green} size="large" /></View>; }
