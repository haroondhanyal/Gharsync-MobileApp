import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../../src/api/client";
import { useSession } from "../../src/auth/session-context";
import { AuthBrand, AuthButton, AuthError, AuthField, authStyles } from "../../src/components/auth-ui";

export default function VerifyPhone() {
  const { verifyPhone } = useSession();
  const [code, setCode] = useState(""); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function verify() {
    setError(""); setBusy(true);
    try { await verifyPhone(code); }
    catch (e) { setError(e instanceof Error ? e.message : "Code verification failed."); }
    finally { setBusy(false); }
  }
  async function resend() {
    setError("");
    try { await api("/auth/phone-otp/request", { method: "POST" }); setMessage("A new verification code was requested."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not resend code."); }
  }
  return <KeyboardAvoidingView style={authStyles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled"><View style={authStyles.page}>
      <AuthBrand /><View style={authStyles.content}>
        <Text style={authStyles.eyebrow}>SECURE YOUR ACCOUNT</Text>
        <Text accessibilityRole="header" style={authStyles.title}>Verify your{"\n"}phone.</Text>
        <Text style={authStyles.subtitle}>Enter the six-digit code sent to your registered mobile number.</Text>
        <View style={authStyles.form}>
          <AuthField label="Verification code" value={code} onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" maxLength={6} placeholder="000000" textContentType="oneTimeCode" />
          <AuthError>{error}</AuthError>{message ? <Text style={authStyles.subtitle}>{message}</Text> : null}
          <AuthButton title="Verify and continue" onPress={() => void verify()} loading={busy} disabled={code.length !== 6} />
          <Pressable onPress={() => void resend()}><Text style={[authStyles.forgot, { alignSelf: "center", marginTop: 6 }]}>Resend code</Text></Pressable>
        </View>
        <Text style={authStyles.secure}>✓  Your information stays private and secure</Text>
      </View>
      <Text style={{ color: "#96A098", fontSize: 9 }}>© 2026 GharSync</Text>
    </View></ScrollView>
  </KeyboardAvoidingView>;
}
