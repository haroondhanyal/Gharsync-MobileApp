import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { colors } from "../../src/theme";
import { api } from "../../src/api/client";
import { AuthBrand, AuthButton, AuthError, AuthField, authStyles } from "../../src/components/auth-ui";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit() {
    setError(""); setMessage(""); setBusy(true);
    try { await api("/auth/password-reset/request", { method: "POST", auth: false, body: { email: email.trim() } }); setMessage("If the address matches an account, recovery instructions will be sent."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not request recovery."); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={authStyles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled"><View style={authStyles.page}>
      <AuthBrand /><View style={authStyles.content}>
        <View style={styles.icon}><SymbolView name={{ ios: "lock.rotation", android: "lock_reset" }} size={23} tintColor={colors.green} /></View>
        <Text style={authStyles.eyebrow}>ACCOUNT RECOVERY</Text>
        <Text accessibilityRole="header" style={authStyles.title}>Reset your{"\n"}password.</Text>
        <Text style={authStyles.subtitle}>Enter your email and we’ll send secure recovery instructions.</Text>
        <View style={styles.card}><View style={authStyles.form}>
          <AuthField label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" />
          {message ? <Text accessibilityRole="alert" style={styles.success}>{message}</Text> : null}<AuthError>{error}</AuthError>
          <AuthButton title="Send instructions" onPress={() => void submit()} loading={busy} />
        </View></View>
        <Text style={authStyles.switch}><Link href="/(auth)/sign-in" style={authStyles.switchLink}>← Back to sign in</Link></Text>
      </View>
      <Text style={{ color: "#96A098", fontSize: 9 }}>© 2026 GharSync</Text>
    </View></ScrollView>
  </KeyboardAvoidingView>;
}

const styles = {
  icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#E8F0E8", alignItems: "center" as const, justifyContent: "center" as const, marginBottom: 20 },
  card: { borderWidth: 1, borderColor: "#EAECE5", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 17, shadowColor: "#183C32", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  success: { color: colors.green, backgroundColor: "#EDF5ED", borderRadius: 8, padding: 12, fontSize: 11, lineHeight: 17 },
};
