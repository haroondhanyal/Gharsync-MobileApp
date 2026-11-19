import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Link, router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSession } from "../../src/auth/session-context";
import { AuthBrand, AuthButton, AuthError, AuthField, authStyles } from "../../src/components/auth-ui";

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(false);
  useEffect(() => {
    void (async () => {
      try {
        const [savedEmail, savedPassword] = await Promise.all([SecureStore.getItemAsync("gharsync.saved-email.v1"), SecureStore.getItemAsync("gharsync.saved-password.v1")]);
        if (savedEmail && savedPassword) { setEmail(savedEmail); setPassword(savedPassword); setRemember(true); }
      } catch { /* Secure storage may be unavailable on a simulator; sign in still works. */ }
    })();
  }, []);
  async function submit() {
    setError(""); setBusy(true);
    try {
      const signedIn = await signIn(email.trim(), password);
      try {
        if (remember) await Promise.all([SecureStore.setItemAsync("gharsync.saved-email.v1", email.trim()), SecureStore.setItemAsync("gharsync.saved-password.v1", password)]);
        else await Promise.all([SecureStore.deleteItemAsync("gharsync.saved-email.v1"), SecureStore.deleteItemAsync("gharsync.saved-password.v1")]);
      } catch { /* Authentication succeeded; remember-password is best-effort. */ }
      router.replace(signedIn.phoneVerificationRequired ? "/(auth)/verify-phone" : signedIn.memberships?.length ? "/(tabs)" : "/workspace-setup");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not sign in."); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={authStyles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled">
      <View style={authStyles.page}>
        <AuthBrand />
        <View style={authStyles.content}>
          <View style={styles.kicker}><View style={styles.liveDot} /><Text style={authStyles.eyebrow}>YOUR HOME, IN SYNC</Text></View>
          <Text accessibilityRole="header" style={authStyles.title}>Good to see{"\n"}you <Text style={authStyles.serifAccent}>again.</Text></Text>
          <Text style={authStyles.subtitle}>Your home and all its little to-dos are right where you left them.</Text>
          <View style={styles.formCard}>
          <View style={authStyles.form}>
            <AuthField label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" returnKeyType="next" />
            <AuthField label="Password" value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} textContentType="password" placeholder="Enter your password" onSubmitEditing={() => void submit()} trailing={<Pressable accessibilityRole="button" accessibilityLabel={passwordVisible ? "Hide password" : "Show password"} hitSlop={10} onPress={() => setPasswordVisible((visible) => !visible)}><SymbolView name={passwordVisible ? { ios: "eye.slash", android: "visibility_off" } : { ios: "eye", android: "visibility" }} size={17} tintColor="#86938B" /></Pressable>} />
            <View style={styles.optionsRow}>
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember((value) => !value)} style={styles.rememberRow}>
                <View style={[styles.checkBox, remember && styles.checked]}>{remember ? <Text style={styles.check}>✓</Text> : null}</View>
                <Text style={styles.rememberText}>Remember password</Text>
              </Pressable>
              <Link href="/(auth)/forgot-password" style={authStyles.forgot}>Forgot password?</Link>
            </View>
            <AuthError>{error}</AuthError>
            <AuthButton title="Log in to GharSync" onPress={() => void submit()} loading={busy} />
          </View>
          </View>
          <Text style={authStyles.switch}>New to GharSync? <Link href="/(auth)/register" style={authStyles.switchLink}>Create an account →</Link></Text>
          <Text style={authStyles.secure}>✓  Your information stays private and secure</Text>
        </View>
        <View style={authStyles.footer}><Text style={{ color: "#96A098", fontSize: 9 }}>© 2026 GharSync</Text><Text style={{ color: "#96A098", fontSize: 9 }}>Made for home</Text></View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = {
  kicker: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#C2A96B", marginTop: -16 },
  formCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAECE5", borderRadius: 16, padding: 17, shadowColor: "#183C32", shadowOpacity: 0.055, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  optionsRow: { marginTop: -3, marginBottom: 2, flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
  rememberRow: { minHeight: 30, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  checkBox: { width: 16, height: 16, borderWidth: 1, borderColor: "#BBC4BC", borderRadius: 4, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: "#FFFFFF" },
  checked: { backgroundColor: "#173F35", borderColor: "#173F35" },
  check: { color: "#FFFFFF", fontSize: 11, lineHeight: 14, fontWeight: "800" as const },
  rememberText: { color: "#647269", fontSize: 10, fontWeight: "600" as const },
};
