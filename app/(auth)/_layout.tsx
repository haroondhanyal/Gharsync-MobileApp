import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useSession } from "../../src/auth/session-context";
export default function AuthLayout() { const { user, ready } = useSession(); const router = useRouter(); useEffect(() => { if (ready && user) router.replace(user.phoneVerificationRequired ? "/(auth)/verify-phone" : user.memberships?.length ? "/(tabs)" : "/workspace-setup"); }, [ready, user, router]); return <Stack screenOptions={{ headerShown: false }} />; }
