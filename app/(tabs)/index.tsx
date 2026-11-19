import React from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { AndroidSymbol, SFSymbol } from "expo-symbols";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { useSession } from "../../src/auth/session-context";
import { Notice } from "../../src/components/ui";
import { colors } from "../../src/theme";
import { useAppearance } from "../../src/appearance/appearance-context";

type Overview = {
  organization?: { id: string; name: string; currency: string; timezone: string };
  generatedAt?: string;
  metrics?: { totalCustomers?: number; newCustomersThisMonth?: number; repeatCustomers?: number; totalBookings?: number; activeRequests?: number; pendingBookings?: number; inProgressBookings?: number; completedBookings?: number; todaysBookings?: number; revenue?: number | null; outstandingBalance?: number | null };
  bookingStatusCounts?: Array<{ status: string; count: number }>;
  recentCustomers?: Array<{ id: string; fullName: string; phone: string; createdAt: string }>;
  recentBookings?: Array<{ id: string; status: string; createdAt: string; customer?: { fullName: string }; service?: { name: string } | null }>;
};

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" }).format(date);
}
function statusLabel(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export default function Dashboard() {
  const { user } = useSession();
  const { isDark } = useAppearance();
  const query = useQuery({ queryKey: ["overview"], queryFn: () => api<Overview>("/dashboard/overview") });
  const data = query.data;
  const metrics = data?.metrics;
  const currency = data?.organization?.currency ?? "PKR";
  const money = (value?: number | null) => new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(value ?? 0);
  const stats = [
    { label: "Total customers", value: metrics?.totalCustomers ?? 0, hint: `+${metrics?.newCustomersThisMonth ?? 0} this month`, icon: { ios: "person.2" as SFSymbol, android: "groups" as AndroidSymbol }, tone: "mint" },
    { label: "Active requests", value: metrics?.activeRequests ?? 0, hint: `${metrics?.pendingBookings ?? 0} waiting · ${metrics?.inProgressBookings ?? 0} in progress`, icon: { ios: "list.clipboard" as SFSymbol, android: "assignment" as AndroidSymbol }, tone: "blue" },
    { label: "Today’s bookings", value: metrics?.todaysBookings ?? 0, hint: "Scheduled for today", icon: { ios: "calendar" as SFSymbol, android: "calendar_month" as AndroidSymbol }, tone: "sand" },
    { label: "Repeat customers", value: metrics?.repeatCustomers ?? 0, hint: "More than one booking", icon: { ios: "arrow.clockwise" as SFSymbol, android: "autorenew" as AndroidSymbol }, tone: "lavender" },
  ];
  const statusRows = (data?.bookingStatusCounts ?? []).filter((row) => row.count > 0).slice(0, 4);
  const maxStatusCount = Math.max(1, ...statusRows.map((row) => row.count));

  return <View style={[s.screen, isDark && s.screenDark]}>
    <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.green} />}>
      <View style={s.heading}>
        <Text style={s.eyebrow}>YOUR BUSINESS AT A GLANCE</Text>
        <View style={s.greetingRow}><Text style={s.title}>Good day, {user?.fullName?.split(" ")[0] ?? "there"}.</Text><Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push("/feature/profile")} style={s.avatar}><Text style={s.avatarText}>{user?.fullName?.[0]?.toUpperCase() ?? "G"}</Text></Pressable></View>
        <Text style={[s.subtitle, isDark && s.darkMuted]}>Here’s what’s happening across {data?.organization?.name ?? "your workspace"}.</Text>
      </View>
      <View style={s.actions}>
        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/customers")} style={s.outlineButton}><SymbolView name={{ ios: "person.2", android: "groups" }} size={14} tintColor={colors.green} /><Text style={s.outlineButtonText}>View customers</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/(tabs)/customers", params: { add: "1" } })} style={s.primaryButton}><SymbolView name={{ ios: "plus", android: "add" }} size={17} tintColor="#FFFFFF" /><Text style={s.primaryButtonText}>Add customer</Text></Pressable>
      </View>

      {query.isPending ? <ActivityIndicator color={colors.green} style={{ marginVertical: 20 }} /> : query.isError ? <Notice>{query.error instanceof Error ? query.error.message : "Dashboard could not load."}</Notice> : <>
        <View style={s.stats}>{stats.map((stat) => <View key={stat.label} style={[s.statCard, isDark && s.darkCard]}>
          <View style={[s.statIcon, stat.tone === "blue" && s.iconBlue, stat.tone === "sand" && s.iconSand, stat.tone === "lavender" && s.iconLavender]}><SymbolView name={stat.icon} size={15} tintColor={colors.green} /></View>
          <Text style={[s.statLabel, isDark && s.darkMuted]}>{stat.label}</Text><Text style={[s.statValue, isDark && s.darkText]}>{Number(stat.value).toLocaleString()}</Text><Text style={[s.statHint, isDark && s.darkMuted]}>{stat.hint}</Text>
        </View>)}</View>

        <View style={[s.card, isDark && s.darkCard]}>
          <View style={s.cardHeading}><View><Text style={s.kicker}>SERVICE OPERATIONS</Text><Text style={[s.cardTitle, isDark && s.darkText]}>Booking activity</Text></View><Pressable onPress={() => router.push("/(tabs)/bookings")}><Text style={s.cardLink}>View bookings  →</Text></Pressable></View>
          <Text style={[s.cardDescription, isDark && s.darkMuted]}>Live booking counts for your selected organization and branch.</Text>
          {statusRows.length ? statusRows.map((row) => <View key={row.status} style={s.statusRow}><Text style={[s.statusName, isDark && s.darkMuted]}>{statusLabel(row.status)}</Text><View style={s.track}><View style={[s.bar, { width: `${Math.max(4, row.count / maxStatusCount * 100)}%` }]} /></View><Text style={[s.statusCount, isDark && s.darkText]}>{row.count}</Text></View>) : <Text style={[s.empty, isDark && s.darkMuted]}>Booking totals will appear here when your team starts receiving jobs.</Text>}
          <View style={[s.legend, isDark && { borderTopColor: "#30443A" }]}><Text style={[s.legendText, isDark && s.darkMuted]}>● Pending  {metrics?.pendingBookings ?? 0}</Text><Text style={[s.legendText, isDark && s.darkMuted]}>● In progress  {metrics?.inProgressBookings ?? 0}</Text><Text style={[s.legendText, isDark && s.darkMuted]}>● Completed  {metrics?.completedBookings ?? 0}</Text></View>
        </View>

        <View style={[s.card, isDark && s.darkCard]}>
          <View style={s.cardHeading}><View><Text style={s.kicker}>BUSINESS HEALTH</Text><Text style={[s.cardTitle, isDark && s.darkText]}>Revenue & payments</Text></View><Pressable onPress={() => router.push("/feature/invoices")}><Text style={s.cardLink}>Invoices  →</Text></Pressable></View>
          <View style={s.moneyRow}><View style={[s.moneyTile, isDark && s.moneyTileDark]}><Text style={[s.moneyLabel, isDark && s.darkMuted]}>Collected this month</Text><Text style={[s.moneyValue, isDark && s.darkText]}>{money(metrics?.revenue)}</Text></View><View style={[s.moneyTile, isDark && s.moneyTileDark]}><Text style={[s.moneyLabel, isDark && s.darkMuted]}>Outstanding balance</Text><Text style={[s.moneyValue, isDark && s.darkText]}>{money(metrics?.outstandingBalance)}</Text></View></View>
          <Text style={[s.cardDescription, isDark && s.darkMuted]}>Only verified payments count as collected · {currency}</Text>
        </View>

        <View style={[s.card, isDark && s.darkCard]}>
          <View style={s.cardHeading}><View><Text style={s.kicker}>CUSTOMER RELATIONSHIPS</Text><Text style={[s.cardTitle, isDark && s.darkText]}>Recently added</Text></View><Pressable onPress={() => router.push("/(tabs)/customers")}><Text style={s.cardLink}>See all  →</Text></Pressable></View>
          {(data?.recentCustomers ?? []).length ? data!.recentCustomers!.slice(0, 4).map((customer) => <Pressable key={customer.id} onPress={() => router.push("/(tabs)/customers")} style={[s.listRow, isDark && { borderTopColor: "#30443A" }]}><View style={s.customerAvatar}><Text style={s.customerInitial}>{customer.fullName.trim().slice(0, 1).toUpperCase()}</Text></View><View style={s.listCopy}><Text numberOfLines={1} style={[s.listTitle, isDark && s.darkText]}>{customer.fullName}</Text><Text style={[s.listSub, isDark && s.darkMuted]}>{customer.phone}</Text></View><Text style={[s.date, isDark && s.darkMuted]}>{dateLabel(customer.createdAt)}</Text></Pressable>) : <Text style={[s.empty, isDark && s.darkMuted]}>Your customer list will show here as your team grows.</Text>}
        </View>

        <View style={[s.card, isDark && s.darkCard]}>
          <View style={s.cardHeading}><View><Text style={s.kicker}>FIELD SERVICE</Text><Text style={[s.cardTitle, isDark && s.darkText]}>Recent bookings</Text></View><Text style={s.cardLink}>{metrics?.totalBookings ?? 0} total</Text></View>
          {(data?.recentBookings ?? []).length ? data!.recentBookings!.slice(0, 5).map((booking) => <Pressable key={booking.id} onPress={() => router.push({ pathname: "/booking/[id]", params: { id: booking.id } })} style={[s.listRow, isDark && { borderTopColor: "#30443A" }]}><View style={s.bookingDot} /><View style={s.listCopy}><Text numberOfLines={1} style={[s.listTitle, isDark && s.darkText]}>{booking.service?.name ?? "Service request"}</Text><Text numberOfLines={1} style={[s.listSub, isDark && s.darkMuted]}>{booking.customer?.fullName ?? "Customer"} · {statusLabel(booking.status)}</Text></View><Text style={[s.date, isDark && s.darkMuted]}>{dateLabel(booking.createdAt)}</Text></Pressable>) : <Text style={[s.empty, isDark && s.darkMuted]}>New requests and updates will appear here.</Text>}
        </View>
        <Text style={s.refreshNote}>↘  Numbers reflect live records{data?.generatedAt ? ` at ${new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit", timeZone: data.organization?.timezone }).format(new Date(data.generatedAt))}` : ""}.</Text>
      </>}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F6F1" }, screenDark: { backgroundColor: "#101A17" }, darkCard: { backgroundColor: "#172A24", borderColor: "#30443A" }, darkText: { color: "#F0F4EF" }, darkMuted: { color: "#AAB7AF" },
  content: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 28, gap: 10 },
  topbar: { height: 42, marginHorizontal: -12, marginTop: -8, paddingHorizontal: 12, backgroundColor: "#FFFEFA", borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 6 }, mark: { width: 25, height: 25, borderRadius: 8 }, brandText: { color: colors.ink, fontSize: 15, fontWeight: "700", letterSpacing: -0.7 }, workspace: { maxWidth: "57%", color: "#465D52", fontSize: 9, fontWeight: "700" },
  heading: { gap: 5, paddingTop: 11 }, eyebrow: { color: colors.green, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 }, greetingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { flex: 1, color: colors.ink, fontSize: 23, fontWeight: "600", letterSpacing: -0.8 }, subtitle: { color: colors.muted, fontSize: 11, lineHeight: 16 }, avatar: { width: 33, height: 33, borderRadius: 11, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" }, avatarText: { color: colors.forest, fontSize: 13, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 8, marginVertical: 2 }, outlineButton: { flex: 1, height: 40, borderRadius: 8, backgroundColor: "#FFFEFA", borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 }, primaryButton: { flex: 1, height: 40, borderRadius: 8, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 }, buttonIcon: { color: colors.green, fontSize: 13 }, buttonIconLight: { color: "white", fontSize: 17 }, outlineButtonText: { color: colors.forest, fontSize: 10, fontWeight: "700" }, primaryButtonText: { color: "white", fontSize: 10, fontWeight: "700" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, statCard: { width: "48%", flexGrow: 1, minHeight: 110, padding: 11, borderRadius: 9, borderWidth: 1, borderColor: colors.line, backgroundColor: "#FFFEFA", justifyContent: "space-between" }, statIcon: { position: "absolute", top: 10, right: 10, width: 27, height: 27, borderRadius: 8, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" }, statGlyph: { color: colors.green, fontSize: 14, fontWeight: "800" }, iconBlue: { backgroundColor: "#E8F0F3" }, iconSand: { backgroundColor: "#F2EEDC" }, iconLavender: { backgroundColor: "#EFECF6" }, statLabel: { color: colors.muted, fontSize: 9, paddingRight: 28 }, statValue: { color: colors.ink, fontSize: 22, fontWeight: "700", marginTop: 7 }, statHint: { color: "#87938C", fontSize: 8, marginTop: 4 },
  card: { padding: 13, borderRadius: 9, borderWidth: 1, borderColor: colors.line, backgroundColor: "#FFFEFA", gap: 9 }, cardHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, kicker: { color: "#829487", fontSize: 8, fontWeight: "800", letterSpacing: 1 }, cardTitle: { color: colors.ink, fontSize: 14, fontWeight: "700", marginTop: 3 }, cardLink: { color: colors.green, fontSize: 8, fontWeight: "700" }, cardDescription: { color: colors.muted, fontSize: 9, lineHeight: 14 }, statusRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 17 }, statusName: { width: 72, color: colors.muted, fontSize: 8 }, track: { flex: 1, height: 5, borderRadius: 4, backgroundColor: "#E7ECE6", overflow: "hidden" }, bar: { height: "100%", borderRadius: 4, backgroundColor: "#77A98B" }, statusCount: { width: 14, textAlign: "right", color: colors.ink, fontSize: 8, fontWeight: "700" }, legend: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", gap: 3 }, legendText: { color: colors.muted, fontSize: 7 }, empty: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  moneyRow: { flexDirection: "row", gap: 8 }, moneyTile: { flex: 1, minHeight: 56, backgroundColor: "#F5F6F1", padding: 9, borderRadius: 7, justifyContent: "space-between" }, moneyTileDark: { backgroundColor: "#20382F" }, moneyLabel: { color: colors.muted, fontSize: 8 }, moneyValue: { color: colors.forest, fontSize: 14, fontWeight: "700" },
  listRow: { minHeight: 45, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: "row", alignItems: "center", gap: 9 }, customerAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E4EEE2", alignItems: "center", justifyContent: "center" }, customerInitial: { color: colors.green, fontSize: 9, fontWeight: "800" }, bookingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D7B66C" }, listCopy: { flex: 1, gap: 3 }, listTitle: { color: "#355348", fontSize: 9, fontWeight: "700" }, listSub: { color: colors.muted, fontSize: 8 }, date: { color: "#89948E", fontSize: 7 }, refreshNote: { color: "#87968B", textAlign: "center", fontSize: 8, paddingVertical: 3 },
});
