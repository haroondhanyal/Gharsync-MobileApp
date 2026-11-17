import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { colors } from "../../src/theme";
export default function TabLayout() { return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 67, paddingTop: 7, paddingBottom: 9, borderTopColor: colors.line, backgroundColor: "white" }, tabBarLabelStyle: { fontWeight: "700", fontSize: 11 } }}><Tabs.Screen name="index" options={{ title: "Overview", tabBarIcon: () => <Glyph text="⌂" /> }} /><Tabs.Screen name="customers" options={{ title: "Customers", tabBarIcon: () => <Glyph text="◉" /> }} /><Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: () => <Glyph text="▤" /> }} /><Tabs.Screen name="more" options={{ title: "More", tabBarIcon: () => <Glyph text="•••" /> }} /></Tabs>; }
function Glyph({ text }: { text: string }) { return <Text style={{ fontSize: 20, fontWeight: "800", color: colors.forest }}>{text}</Text>; }
