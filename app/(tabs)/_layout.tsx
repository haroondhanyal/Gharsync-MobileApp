import React from "react";
import { Image, Text, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useAppearance } from "../../src/appearance/appearance-context";
import { AppDrawerContent } from "../../src/components/app-drawer-content";
import { colors } from "../../src/theme";

function HeaderBrand() {
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 }}><Image source={require("../../assets/web-mark.png")} style={{ width: 27, height: 27, borderRadius: 9 }} /><Text style={{ color: colors.ink, fontSize: 17, fontWeight: "800", letterSpacing: -0.8 }}>ghar<Text style={{ color: colors.green, fontWeight: "500" }}>sync</Text></Text></View>;
}

export default function MainDrawer() {
  const { drawerSide, isDark: dark } = useAppearance();
  return <Drawer drawerContent={(props) => <AppDrawerContent {...props} />} screenOptions={{
    headerShown: true,
    drawerPosition: drawerSide,
    drawerType: "front",
    drawerStyle: { width: 300, backgroundColor: dark ? "#172A24" : "#FFFEFA" },
    headerTitle: () => <HeaderBrand />,
    headerTitleAlign: "left",
    headerStyle: { backgroundColor: dark ? "#172A24" : "#FFFEFA" },
    headerTintColor: dark ? "#F3F5F0" : colors.forest,
    headerShadowVisible: false,
    headerStatusBarHeight: 8,
    sceneStyle: { backgroundColor: dark ? "#101A17" : colors.background },
  }}>
    <Drawer.Screen name="index" options={{ title: "Overview" }} />
    <Drawer.Screen name="customers" options={{ title: "Customers" }} />
    <Drawer.Screen name="bookings" options={{ title: "Bookings" }} />
    <Drawer.Screen name="more" options={{ title: "Workspace tools" }} />
  </Drawer>;
}
