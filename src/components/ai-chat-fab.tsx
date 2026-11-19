import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAppearance } from "../appearance/appearance-context";
import { useSession } from "../auth/session-context";
import { colors } from "../theme";

type Message = { id: string; role: "user" | "assistant"; text: string };
type AiStatus = { ollama?: { configured: boolean; model?: string }; ai?: { configured: boolean; provider?: string; model?: string } };
type ChatReply = { reply?: string; provider?: string; model?: string; notice?: string };

export function AiChatFab() {
  const { user } = useSession();
  const { aiChatEnabled, drawerSide, isDark: dark } = useAppearance();
  const status = useQuery({ queryKey: ["ai-chat-status"], queryFn: () => api<AiStatus>("/notifications/status"), enabled: !!user && aiChatEnabled, staleTime: 30_000 });
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", text: "Hi! I can help summarize service notes or shape a clear customer update. What are you working on?" }]);
  if (!user || !aiChatEnabled) return null;

  async function send() {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setInput("");
    setMessages((items) => [...items, { id: `${Date.now()}-user`, role: "user", text: prompt }]);
    setBusy(true);
    try {
      const history = messages.slice(-12).map(({ role, text }) => ({ role, content: text }));
      const result = await api<ChatReply>("/help-desk/chat", { method: "POST", body: { text: prompt, history: JSON.stringify(history) } });
      setMessages((items) => [...items, { id: `${Date.now()}-assistant`, role: "assistant", text: `${result.reply ?? "Ollama ne jawab nahi diya."}${result.notice ? `\n\n${result.notice}` : ""}` }]);
    } catch (error) {
      setMessages((items) => [...items, { id: `${Date.now()}-assistant`, role: "assistant", text: error instanceof Error ? error.message : "Could not reach GharSync AI. Try again shortly." }]);
    } finally { setBusy(false); }
  }

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Open GharSync AI chat" onPress={() => setOpen(true)} style={[s.fab, drawerSide === "left" ? { right: 18 } : { left: 18 }]}><SymbolView name={{ ios: "sparkles", android: "auto_awesome" }} size={23} tintColor="#FFFFFF" /><View style={s.liveDot} /></Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <KeyboardAvoidingView style={s.scrim} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[s.panel, dark && s.panelDark]}>
          <View style={s.header}><View style={s.headerMark}><SymbolView name={{ ios: "sparkles", android: "auto_awesome" }} size={18} tintColor="#FFFFFF" /></View><View style={{ flex: 1 }}><Text style={[s.title, dark && s.textDark]}>GharSync AI</Text><Text style={s.status}>{status.isPending ? "Checking Ollama…" : status.data?.ollama?.configured ? `Ollama · ${status.data.ollama.model ?? "ready"}` : status.isError ? "Could not check Ollama" : "Ollama model unavailable"}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close AI chat" onPress={() => setOpen(false)} style={s.close}><SymbolView name={{ ios: "xmark", android: "close" }} size={16} tintColor={dark ? "#E8EFE8" : colors.muted} /></Pressable></View>
          <ScrollView style={s.thread} contentContainerStyle={s.threadContent} keyboardShouldPersistTaps="handled">{messages.map((message) => <View key={message.id} style={[s.bubble, message.role === "user" ? s.userBubble : s.aiBubble, dark && message.role === "assistant" && s.aiBubbleDark]}><Text style={[s.message, message.role === "user" && s.userMessage, dark && message.role === "assistant" && s.textDark]}>{message.text}</Text></View>)}{busy ? <View style={[s.bubble, s.aiBubble, dark && s.aiBubbleDark]}><ActivityIndicator size="small" color={colors.green} /></View> : null}</ScrollView>
          <View style={[s.composer, dark && s.composerDark]}><TextInput accessibilityLabel="Message GharSync AI" value={input} onChangeText={setInput} onSubmitEditing={() => void send()} returnKeyType="send" placeholder="Ask about a service note…" placeholderTextColor="#98A49C" style={[s.input, dark && s.inputDark]} multiline maxLength={2000} /><Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!input.trim() || busy} onPress={() => void send()} style={[s.send, (!input.trim() || busy) && { opacity: 0.5 }]}><SymbolView name={{ ios: "arrow.up", android: "arrow_upward" }} size={17} tintColor="#FFFFFF" /></Pressable></View>
          <Text style={s.disclaimer}>AI drafts need review before sharing. Avoid adding sensitive personal information.</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </>;
}

const s = StyleSheet.create({ fab: { position: "absolute", bottom: 22, width: 56, height: 56, borderRadius: 20, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center", shadowColor: "#173F35", shadowOpacity: 0.26, shadowRadius: 13, shadowOffset: { width: 0, height: 6 }, elevation: 8 }, liveDot: { position: "absolute", right: 4, top: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: "#D9CF8E", borderWidth: 2, borderColor: colors.forest }, scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "#102F2866" }, panel: { height: "78%", backgroundColor: "#FFFEFA", borderTopLeftRadius: 23, borderTopRightRadius: 23, paddingHorizontal: 17, paddingTop: 14, paddingBottom: 10 }, panelDark: { backgroundColor: "#101A17" }, header: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 11 }, headerMark: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" }, title: { color: colors.ink, fontSize: 14, fontWeight: "800" }, textDark: { color: "#F0F4EF" }, status: { color: colors.green, fontSize: 9, marginTop: 2 }, close: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "#F1F3EE" }, thread: { flex: 1 }, threadContent: { gap: 10, paddingVertical: 15 }, bubble: { maxWidth: "88%", borderRadius: 15, paddingHorizontal: 12, paddingVertical: 10 }, aiBubble: { alignSelf: "flex-start", backgroundColor: "#EFF3ED", borderBottomLeftRadius: 5 }, aiBubbleDark: { backgroundColor: "#1C332C" }, userBubble: { alignSelf: "flex-end", backgroundColor: colors.forest, borderBottomRightRadius: 5 }, message: { color: colors.ink, fontSize: 11, lineHeight: 17 }, userMessage: { color: "#FFFFFF" }, composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 6 }, composerDark: { backgroundColor: "#172A24", borderColor: "#30443A" }, input: { flex: 1, maxHeight: 90, paddingHorizontal: 10, paddingVertical: 8, color: colors.ink, fontSize: 11, minHeight: 38 }, inputDark: { color: "#F0F4EF" }, send: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }, disclaimer: { color: "#89958D", fontSize: 8, textAlign: "center", paddingTop: 8 } });
