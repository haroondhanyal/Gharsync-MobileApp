import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DrawerContentScrollView, type DrawerContentComponentProps } from "expo-router/drawer";
import { SymbolView } from "expo-symbols";
import type { AndroidSymbol, SFSymbol } from "expo-symbols";
import { router, type Href, usePathname } from "expo-router";
import { useSession } from "../auth/session-context";
import { colors } from "../theme";

const groups: Array<{ title: string; items: Array<[string, string, string]> }> = [
  { title: "OVERVIEW", items: [["Overview", "grid", "/(tabs)"], ["Customers", "person.2", "/(tabs)/customers"], ["Bookings", "calendar", "/(tabs)/bookings"]] },
  { title: "SERVICE OPERATIONS", items: [["Services", "wrench.and.screwdriver", "services"], ["Homes & properties", "house", "properties"], ["Home assets", "shippingbox", "assets"], ["Documents & photos", "doc.text.image", "documents"], ["Invoices & payments", "doc.text", "invoices"], ["Scan asset QR", "qrcode.viewfinder", "/scan"]] },
  { title: "TEAM & INVENTORY", items: [["Team & access", "person.3", "team"], ["Workforce", "person.badge.clock", "workforce"], ["My availability", "clock", "timeoff"], ["Inventory", "shippingbox", "inventory"], ["Suppliers", "truck.box", "suppliers"], ["Stock movements", "arrow.left.arrow.right", "movements"], ["Warranty claims", "checkmark.seal", "warranty"]] },
  { title: "WORKSPACE", items: [["Notifications", "bell", "notifications"], ["Branches", "mappin.and.ellipse", "branches"], ["Plans & billing", "creditcard", "billing"], ["AI service assistant", "sparkles", "assistant"], ["AI usage", "chart.bar", "usage"], ["Help Desk", "bubble.left.and.bubble.right", "help-desk"], ["Security & sessions", "lock.shield", "security"], ["Platform console", "gearshape.2", "platform"], ["Workspace tools", "ellipsis.circle", "/(tabs)/more"], ["Appearance", "paintpalette", "appearance"]] },
];

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useSession();
  const pathname = usePathname();
  const navigate = (target: string) => {
    props.navigation.closeDrawer();
    if (target.startsWith("/")) router.push(target as Href);
    else router.push({ pathname: "/feature/[slug]", params: { slug: target } });
  };
  const isActive = (target: string) => target.startsWith("/") ? pathname === target || (target === "/(tabs)" && pathname === "/") : pathname.includes(`/feature/${target}`);
  return <DrawerContentScrollView {...props} contentContainerStyle={s.scroll}>
    <View style={s.brand}><Image source={require("../../assets/web-mark.png")} style={s.mark} /><View><Text style={s.brandName}>ghar<Text style={s.brandAccent}>sync</Text></Text><Text style={s.tagline}>HOME SERVICE WORKSPACE</Text></View></View>
    <View style={s.profile}><View style={s.avatar}><Text style={s.initial}>{user?.fullName?.slice(0, 1).toUpperCase() ?? "G"}</Text></View><View style={{ flex: 1 }}><Text numberOfLines={1} style={s.name}>{user?.fullName ?? "GharSync member"}</Text><Text numberOfLines={1} style={s.email}>{user?.email ?? ""}</Text></View><SymbolView name={{ ios: "chevron.down", android: "expand_more" }} size={13} tintColor={colors.muted} /></View>
    {groups.map((group) => <View key={group.title} style={s.group}><Text style={s.groupTitle}>{group.title}</Text>{group.items.map(([label, icon, target]) => <Pressable key={target} accessibilityRole="button" onPress={() => navigate(target)} style={[s.item, isActive(target) && s.itemActive]}><SymbolView name={{ ios: icon as SFSymbol, android: androidIcon(icon) as AndroidSymbol }} size={17} tintColor={isActive(target) ? colors.green : "#7B8981"} /><Text style={[s.itemLabel, isActive(target) && s.itemLabelActive]}>{label}</Text>{isActive(target) ? <View style={s.activeMark} /> : null}</Pressable>)}</View>)}
    <Pressable style={s.logout} onPress={() => void signOut()}><SymbolView name={{ ios: "rectangle.portrait.and.arrow.right", android: "logout" }} size={17} tintColor={colors.danger} /><Text style={s.logoutText}>Sign out</Text></Pressable>
    <Text style={s.footer}>GharSync · Made for home</Text>
  </DrawerContentScrollView>;
}

function androidIcon(ios: string) {
  const icons: Record<string, string> = { "wrench.and.screwdriver": "build", "person.2": "people", "person.3": "groups", "doc.text.image": "image", "doc.text": "receipt_long", "qrcode.viewfinder": "qr_code_scanner", "person.badge.clock": "badge", "shippingbox": "inventory_2", "truck.box": "local_shipping", "arrow.left.arrow.right": "sync_alt", "checkmark.seal": "verified", "mappin.and.ellipse": "location_on", "creditcard": "credit_card", "sparkles": "auto_awesome", "chart.bar": "bar_chart", "bubble.left.and.bubble.right": "support_agent", "lock.shield": "security", "gearshape.2": "settings", "ellipsis.circle": "more_horiz", "paintpalette": "palette", "calendar": "calendar_month", "house": "home", "grid": "grid_view", "person.2.fill": "people", "bell": "notifications", "clock": "schedule" };
  return icons[ios] ?? "circle";
}

const s = StyleSheet.create({ scroll: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 20 }, brand: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 6, paddingBottom: 19 }, mark: { width: 37, height: 37, borderRadius: 12 }, brandName: { color: colors.ink, fontSize: 20, fontWeight: "800", letterSpacing: -1 }, brandAccent: { color: colors.green, fontWeight: "500" }, tagline: { color: colors.muted, fontSize: 8, letterSpacing: 1.2, marginTop: 2 }, profile: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#F3F5F0", borderRadius: 12, padding: 10, marginBottom: 17 }, avatar: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#DFEAE0", alignItems: "center", justifyContent: "center" }, initial: { color: colors.forest, fontSize: 14, fontWeight: "800" }, name: { color: colors.ink, fontSize: 11, fontWeight: "700" }, email: { color: colors.muted, fontSize: 9, marginTop: 2 }, group: { gap: 3, marginBottom: 12 }, groupTitle: { color: "#9AA49D", fontSize: 8, fontWeight: "800", letterSpacing: 1.2, paddingHorizontal: 9, marginBottom: 4 }, item: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 39, borderRadius: 9, paddingHorizontal: 10 }, itemActive: { backgroundColor: "#EAF1E9" }, itemLabel: { color: "#56675D", fontSize: 11, fontWeight: "600", flex: 1 }, itemLabelActive: { color: colors.forest, fontWeight: "800" }, activeMark: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green }, logout: { borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 10, paddingTop: 14, marginTop: 4, flexDirection: "row", alignItems: "center", gap: 12 }, logoutText: { color: colors.danger, fontSize: 11, fontWeight: "700" }, footer: { color: "#A1AAA3", fontSize: 8, textAlign: "center", marginTop: 20 } });
