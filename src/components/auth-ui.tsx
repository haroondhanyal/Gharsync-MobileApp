import React, { type ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "../theme";

export function AuthBrand() {
  return <View style={styles.brand} accessibilityLabel="GharSync">
    <Image source={require("../../assets/web-mark.png")} style={styles.mark} />
    <Text style={styles.brandText}>ghar<Text style={styles.brandAccent}>sync</Text></Text>
  </View>;
}

export function AuthField({ label, trailing, style, ...props }: TextInputProps & { label?: string; trailing?: ReactNode }) {
  return <View style={[styles.field, !label && styles.noLabel]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <View style={styles.inputWrap}>
      <TextInput placeholderTextColor="#ADB6B0" style={[styles.input, trailing ? styles.inputWithTrailing : undefined, style]} autoCapitalize="none" {...props} />
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  </View>;
}

export function AuthButton({ title, onPress, disabled, loading }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, (disabled || loading) && styles.disabled]}>
    <Text style={styles.buttonText}>{loading ? "Please wait…" : title}</Text>
    {!loading && <Text style={styles.arrow}>→</Text>}
  </Pressable>;
}

export const authStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFEFA" },
  scroll: { flexGrow: 1 },
  page: { flex: 1, width: "100%", maxWidth: 520, alignSelf: "center", paddingHorizontal: 25, paddingTop: 26, paddingBottom: 20 },
  content: { flexGrow: 1, justifyContent: "center", paddingVertical: 42 },
  eyebrow: { color: colors.green, fontSize: 9, fontWeight: "800", letterSpacing: 1.7, marginBottom: 17 },
  title: { color: colors.ink, fontSize: 42, lineHeight: 45, fontWeight: "600", letterSpacing: -1.8 },
  serifAccent: { color: colors.green, fontFamily: "Georgia", fontStyle: "italic", fontWeight: "400" },
  subtitle: { color: "#7B8780", fontSize: 12, lineHeight: 20, marginTop: 14, marginBottom: 25, maxWidth: 360 },
  form: { gap: 15 },
  forgot: { color: colors.green, fontWeight: "700", fontSize: 10, alignSelf: "flex-end", marginTop: -7 },
  switch: { color: "#7C8981", fontSize: 10, textAlign: "center", marginTop: 22 },
  switchLink: { color: colors.green, fontWeight: "700" },
  secure: { color: "#6D997B", fontSize: 9, textAlign: "center", marginTop: 18 },
  footer: { color: "#96A098", fontSize: 9, flexDirection: "row", justifyContent: "space-between" },
});

export function AuthError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <Text accessibilityRole="alert" style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: { width: 31, height: 31, borderRadius: 10 },
  brandText: { color: colors.ink, fontSize: 20, fontWeight: "700", letterSpacing: -1 },
  brandAccent: { color: colors.green, fontWeight: "500" },
  field: { gap: 7 },
  noLabel: { gap: 0 },
  label: { color: "#41544A", fontSize: 10, fontWeight: "700" },
  input: { minHeight: 44, borderRadius: 6, borderWidth: 1, borderColor: "#E4E7E0", backgroundColor: "#FFFFFF", paddingHorizontal: 13, color: colors.ink, fontSize: 12 },
  inputWrap: { position: "relative", justifyContent: "center" },
  inputWithTrailing: { paddingRight: 44 },
  trailing: { position: "absolute", right: 5, height: 36, minWidth: 36, alignItems: "center", justifyContent: "center" },
  button: { minHeight: 46, marginTop: 4, paddingHorizontal: 17, borderRadius: 8, backgroundColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  buttonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  arrow: { color: "#FFFFFF", fontSize: 19 },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.58 },
  error: { color: colors.danger, backgroundColor: "#F4F3E8", borderRadius: 5, padding: 10, fontSize: 10, lineHeight: 15 },
});
