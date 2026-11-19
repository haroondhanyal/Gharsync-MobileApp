import React from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from "react-native";
import { SymbolView } from "expo-symbols";
import { useAppearance } from "../appearance/appearance-context";
import { Button, Card, Heading, Page } from "./ui";
import { colors } from "../theme";

const themeChoices = [{ id: "system", title: "System", icon: "circle.lefthalf.filled" }, { id: "light", title: "Light", icon: "sun.max" }, { id: "dark", title: "Dark", icon: "moon" }] as const;

export function AppearanceScreen() {
  const { theme, setTheme, drawerSide, setDrawerSide, aiChatEnabled, setAiChatEnabled } = useAppearance();
  const systemTheme = useColorScheme();
  const dark = theme === "dark" || (theme === "system" && systemTheme === "dark");
  return <Page style={{ paddingHorizontal: 0, paddingTop: 0, backgroundColor: dark ? "#101A17" : colors.background }}><ScrollView contentContainerStyle={s.content}>
    <Heading eyebrow="PERSONALIZE YOUR WORKSPACE" title="Appearance" subtitle="Make GharSync feel right on your phone. These choices are saved on this device." />
    <Card style={dark ? s.cardDark : undefined}>
      <View style={s.sectionHead}><View style={s.icon}><SymbolView name={{ ios: "circle.lefthalf.filled", android: "contrast" }} size={17} tintColor={colors.green} /></View><View style={{ flex: 1 }}><Text style={[s.title, dark && s.textDark]}>Color theme</Text><Text style={[s.description, dark && s.mutedDark]}>Follow your device or choose a look.</Text></View></View>
      <View style={s.choices}>{themeChoices.map((choice) => <Pressable key={choice.id} accessibilityRole="radio" accessibilityState={{ checked: theme === choice.id }} onPress={() => setTheme(choice.id)} style={[s.choice, theme === choice.id && s.choiceActive, dark && s.choiceDark, theme === choice.id && dark && s.choiceActiveDark]}><SymbolView name={{ ios: choice.icon, android: choice.id === "system" ? "contrast" : choice.id === "light" ? "light_mode" : "dark_mode" }} size={16} tintColor={theme === choice.id ? colors.green : dark ? "#AAB7AF" : colors.muted} /><Text style={[s.choiceText, dark && s.mutedDark, theme === choice.id && s.activeText]}>{choice.title}</Text></Pressable>)}</View>
    </Card>
    <Card style={dark ? s.cardDark : undefined}>
      <View style={s.sectionHead}><View style={s.icon}><SymbolView name={{ ios: "sidebar.left", android: "view_sidebar" }} size={17} tintColor={colors.green} /></View><View style={{ flex: 1 }}><Text style={[s.title, dark && s.textDark]}>Navigation drawer</Text><Text style={[s.description, dark && s.mutedDark]}>Choose which side the workspace menu opens from.</Text></View></View>
      <View style={s.choices}>{(["left", "right"] as const).map((side) => <Pressable key={side} accessibilityRole="radio" accessibilityState={{ checked: drawerSide === side }} onPress={() => setDrawerSide(side)} style={[s.choice, s.sideChoice, drawerSide === side && s.choiceActive, dark && s.choiceDark, drawerSide === side && dark && s.choiceActiveDark]}><SymbolView name={{ ios: side === "left" ? "sidebar.left" : "sidebar.right", android: side === "left" ? "dock_to_left" : "dock_to_right" }} size={17} tintColor={drawerSide === side ? colors.green : dark ? "#AAB7AF" : colors.muted} /><Text style={[s.choiceText, dark && s.mutedDark, drawerSide === side && s.activeText]}>{side === "left" ? "Left side" : "Right side"}</Text></Pressable>)}</View>
    </Card>
    <Card style={dark ? s.cardDark : undefined}>
      <View style={s.sectionHead}><View style={s.icon}><SymbolView name={{ ios: "sparkles", android: "auto_awesome" }} size={17} tintColor={colors.green} /></View><View style={{ flex: 1 }}><Text style={[s.title, dark && s.textDark]}>AI chat bubble</Text><Text style={[s.description, dark && s.mutedDark]}>Open the assistant from anywhere in your workspace.</Text></View><Switch value={aiChatEnabled} onValueChange={setAiChatEnabled} trackColor={{ false: "#CDD5CE", true: "#93B7A0" }} thumbColor={aiChatEnabled ? colors.green : "#F7F8F6"} /></View>
      <Text style={[s.note, dark && s.mutedDark]}>The assistant uses GharSync’s configured AI service and organization access. Availability follows your plan and the service’s web configuration.</Text>
      <Button title={aiChatEnabled ? "Turn chat bubble off" : "Turn chat bubble on"} secondary onPress={() => setAiChatEnabled(!aiChatEnabled)} />
    </Card>
    <View style={[s.preview, dark && s.previewDark]}><SymbolView name={{ ios: "checkmark.circle.fill", android: "check_circle" }} size={16} tintColor="#56886A" /><Text style={[s.previewText, dark && s.mutedDark]}>Appearance preferences sync instantly and stay local to this device.</Text></View>
  </ScrollView></Page>;
}

const s = StyleSheet.create({ content: { padding: 19, gap: 12, paddingBottom: 34 }, cardDark: { backgroundColor: "#172A24", borderColor: "#30443A" }, sectionHead: { flexDirection: "row", alignItems: "center", gap: 10 }, icon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#E8F0E8", alignItems: "center", justifyContent: "center" }, title: { color: colors.ink, fontWeight: "800", fontSize: 13 }, description: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 }, choices: { flexDirection: "row", gap: 8, marginTop: 4 }, choice: { minHeight: 42, flex: 1, borderWidth: 1, borderColor: colors.line, backgroundColor: "#FBFCFA", borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, sideChoice: { minHeight: 48 }, choiceActive: { borderColor: "#88AB91", backgroundColor: "#EFF5EF" }, choiceDark: { backgroundColor: "#1C332C", borderColor: "#30443A" }, choiceActiveDark: { backgroundColor: "#233D32", borderColor: "#659476" }, choiceText: { color: colors.muted, fontSize: 10, fontWeight: "700" }, activeText: { color: colors.forest }, textDark: { color: "#F0F4EF" }, mutedDark: { color: "#AAB7AF" }, note: { color: colors.muted, fontSize: 10, lineHeight: 16 }, preview: { flexDirection: "row", gap: 8, alignItems: "center", paddingHorizontal: 4, paddingVertical: 4 }, previewDark: { opacity: 0.95 }, previewText: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 15 } });
