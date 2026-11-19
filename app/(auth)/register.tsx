import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../../src/auth/session-context";
import { AuthBrand, AuthButton, AuthError, AuthField, authStyles } from "../../src/components/auth-ui";
import { countries } from "../../src/data/locations";
import { phoneCountryDetails } from "../../src/data/phone-country";
import { colors } from "../../src/theme";
import cityLists from "../../assets/cities-by-country.json";

const serviceTypes = [
  { value: "AC_REPAIR", label: "AC repair", ios: "wind", android: "air" },
  { value: "ELECTRICAL", label: "Electrical", ios: "bolt", android: "bolt" },
  { value: "PLUMBING", label: "Plumbing", ios: "drop", android: "water_drop" },
  { value: "APPLIANCE_REPAIR", label: "Appliance repair", ios: "refrigerator", android: "kitchen" },
  { value: "SOLAR", label: "Solar care", ios: "sun.max", android: "solar_power" },
  { value: "GENERAL_MAINTENANCE", label: "Home maintenance", ios: "house", android: "home_repair_service" },
  { value: "OTHER", label: "Other services", ios: "wrench.and.screwdriver", android: "build" },
] as const;
type ServiceType = (typeof serviceTypes)[number];
const countryCities = cityLists as Record<string, string[]>;

function ServiceGlyph({ service, size = 17, tintColor = colors.green }: { service: ServiceType; size?: number; tintColor?: string }) {
  return <SymbolView name={{ ios: service.ios, android: service.android }} size={size} tintColor={tintColor} />;
}

export default function Register() {
  const { register } = useSession();
  const [v, setV] = useState({ fullName: "", email: "", phone: "", organizationName: "", city: "", password: "" });
  const [countryCode, setCountryCode] = useState("PK");
  const [businessType, setBusinessType] = useState<ServiceType["value"]>("AC_REPAIR");
  const [countryPicker, setCountryPicker] = useState(false);
  const [cityPicker, setCityPicker] = useState(false);
  const [servicePicker, setServicePicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const update = (key: keyof typeof v, value: string) => setV((old) => ({ ...old, [key]: value }));
  const selectedCountry = countries.find((country) => country.code === countryCode) ?? countries[0]!;
  const phoneDetails = useMemo(() => phoneCountryDetails(countryCode), [countryCode]);
  const callingCode = phoneDetails.callingCode;
  const maxPhoneDigits = phoneDetails.allowedLengths.length ? Math.max(...phoneDetails.allowedLengths) : 15;
  const digits = v.phone.replace(/\D/g, "");
  const phoneIsValid = callingCode
    ? phoneDetails.allowedLengths.length ? phoneDetails.allowedLengths.includes(digits.length) : digits.length >= 7 && digits.length <= 15
    : /^\+[1-9]\d{7,14}$/.test(v.phone.trim());
  const phoneE164 = callingCode ? `${callingCode}${digits}` : v.phone.replace(/[^\d+]/g, "");
  const cities = countryCities[countryCode] ?? [];
  const selectedService = serviceTypes.find((service) => service.value === businessType) ?? serviceTypes[0]!;
  const filteredCountries = useMemo(() => {
    const term = countrySearch.trim().toLocaleLowerCase();
    return countries.filter((country) => !term || country.name.toLocaleLowerCase().includes(term) || country.code.toLowerCase().includes(term));
  }, [countrySearch]);
  const filteredCities = useMemo(() => {
    const term = citySearch.trim().toLocaleLowerCase();
    return cities.filter((city) => !term || city.toLocaleLowerCase().includes(term));
  }, [cities, citySearch]);

  useEffect(() => () => { if (successTimer.current) clearTimeout(successTimer.current); }, []);

  async function submit() {
    setError(""); setBusy(true);
    try {
      await register({ ...v, phone: phoneE164, businessType, accountType: "business", countryCode });
      setSuccess(true);
      successTimer.current = setTimeout(() => router.replace("/(auth)/verify-phone"), 2000);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create account."); }
    finally { setBusy(false); }
  }

  if (success) return <SafeAreaView edges={["top", "left", "right"]} style={[authStyles.screen, { paddingHorizontal: 25, paddingTop: 26, paddingBottom: 20, alignItems: "stretch" }]}>
    <AuthBrand />
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 35 }}>
      <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: "#E5EFE3", alignItems: "center", justifyContent: "center", marginBottom: 22 }}><SymbolView name={{ ios: "checkmark", android: "check" }} size={30} tintColor={colors.green} /></View>
      <Text style={authStyles.eyebrow}>ACCOUNT CREATED</Text>
      <Text accessibilityRole="header" style={[authStyles.title, { textAlign: "center" }]}>You’re all set.</Text>
      <Text style={[authStyles.subtitle, { textAlign: "center", marginBottom: 16 }]}>Next, verify your mobile number to secure your GharSync account.</Text>
      <ActivityIndicator color={colors.green} />
    </View>
    <Text style={{ color: "#96A098", fontSize: 9 }}>© 2026 GharSync · Made for home</Text>
  </SafeAreaView>;

  return <KeyboardAvoidingView style={authStyles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled"><SafeAreaView edges={["top", "left", "right"]} style={authStyles.page}>
      <AuthBrand /><View style={{ paddingTop: 43, paddingBottom: 28 }}>
        <View style={styles.kicker}><View style={styles.kickerDot} /><Text style={[authStyles.eyebrow, { marginBottom: 0 }]}>A BETTER WAY TO HOME</Text></View>
        <Text accessibilityRole="header" style={authStyles.title}>Make home feel{"\n"}<Text style={authStyles.serifAccent}>more in sync.</Text></Text>
        <Text style={authStyles.subtitle}>One simple account for the people, services and little details that keep life running.</Text>
        <View style={{ flexDirection: "row", backgroundColor: "#F7F8F3", borderColor: colors.line, borderWidth: 1, borderRadius: 7, padding: 10, marginBottom: 15 }}>
          <Text style={{ flex: 1, color: colors.forest, fontSize: 11, fontWeight: "700" }}>Service business</Text>
          <Text style={{ flex: 1, color: colors.muted, fontSize: 10 }}>Team members join with an invitation</Text>
        </View>
        <View style={styles.formCard}><View style={authStyles.form}>
          <AuthField label="Full name" value={v.fullName} onChangeText={(x) => update("fullName", x)} autoCapitalize="words" textContentType="name" placeholder="e.g. Ayesha Khan" maxLength={160} />

          <View style={{ gap: 7 }}>
            <Text style={{ color: "#41544A", fontSize: 10, fontWeight: "700" }}>Country</Text>
            <Pressable accessibilityRole="button" onPress={() => { setCountrySearch(""); setCountryPicker(true); }} style={styles.selectField}>
              <Text style={{ fontSize: 17 }}>{selectedCountry.flag}</Text><Text numberOfLines={1} style={styles.selectText}>{selectedCountry.name}</Text><Text style={styles.selectChevron}>⌄</Text>
            </Pressable>
          </View>

          <View style={{ gap: 7 }}>
            <Text style={{ color: "#41544A", fontSize: 10, fontWeight: "700" }}>Mobile number</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {callingCode ? <View style={styles.prefix}><Text style={styles.prefixText}>{callingCode}</Text></View> : null}
              <View style={{ flex: 1 }}><AuthField accessibilityLabel="Mobile number" value={v.phone} onChangeText={(x) => update("phone", callingCode ? x.replace(/\D/g, "").slice(0, maxPhoneDigits) : x.replace(/[^\d+]/g, "").slice(0, 16))} keyboardType="phone-pad" maxLength={callingCode ? maxPhoneDigits : 16} textContentType="telephoneNumber" placeholder={callingCode ? `${phoneDetails.allowedLengths.length ? phoneDetails.allowedLengths.join(" or ") : "7–15"} digits` : "+ country code and number"} style={{ minHeight: 44, borderRadius: 6, borderWidth: 1, borderColor: "#E4E7E0", backgroundColor: "#FFFFFF", paddingHorizontal: 13, color: colors.ink, fontSize: 12 }} /></View>
            </View>
            <Text style={{ color: "#89948E", fontSize: 9 }}>{callingCode ? `${selectedCountry.name} · enter ${phoneDetails.allowedLengths.join(" or ") || "7 to 15"} digits after ${callingCode}.` : "Include the full international calling code, for example +67212345678."}</Text>
          </View>

          <AuthField label="Business name" value={v.organizationName} onChangeText={(x) => update("organizationName", x)} autoCapitalize="words" placeholder="e.g. Lahore Home Care" maxLength={180} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, gap: 7 }}>
              <Text style={{ color: "#41544A", fontSize: 10, fontWeight: "700" }}>Service type</Text>
              <Pressable accessibilityRole="button" onPress={() => setServicePicker(true)} style={styles.selectField}>
                <View style={styles.serviceMark}><ServiceGlyph service={selectedService} size={16} /></View><Text numberOfLines={1} style={styles.selectText}>{selectedService.label}</Text><Text style={styles.selectChevron}>⌄</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1, gap: 7 }}>
              <Text style={{ color: "#41544A", fontSize: 10, fontWeight: "700" }}>City or town</Text>
              <Pressable accessibilityRole="button" onPress={() => { setCitySearch(""); setCityPicker(true); }} style={styles.selectField}>
                <SymbolView name={{ ios: "mappin.and.ellipse", android: "location_on" }} size={15} tintColor="#668371" /><Text numberOfLines={1} style={[styles.selectText, !v.city && { color: "#ADB6B0" }]}>{v.city || "Search city"}</Text><Text style={styles.selectChevron}>⌄</Text>
              </Pressable>
              <Text style={{ color: "#89948E", fontSize: 8 }}>{cities.length.toLocaleString()} cities in {selectedCountry.name}</Text>
            </View>
          </View>

          <AuthField label="Email address" value={v.email} onChangeText={(x) => update("email", x)} keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" maxLength={320} />
          <AuthField label="Password" value={v.password} onChangeText={(x) => update("password", x)} secureTextEntry={!passwordVisible} textContentType="newPassword" placeholder="At least 12 characters" maxLength={128} trailing={<Pressable accessibilityRole="button" accessibilityLabel={passwordVisible ? "Hide password" : "Show password"} hitSlop={10} onPress={() => setPasswordVisible((visible) => !visible)}><SymbolView name={passwordVisible ? { ios: "eye.slash", android: "visibility_off" } : { ios: "eye", android: "visibility" }} size={17} tintColor="#86938B" /></Pressable>} />
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed((x) => !x)} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 1 }}>
            <View style={{ width: 14, height: 14, borderWidth: 1, borderColor: agreed ? colors.green : "#929B95", borderRadius: 3, backgroundColor: agreed ? colors.green : "transparent", alignItems: "center", justifyContent: "center" }}>{agreed ? <Text style={{ color: "white", fontSize: 10 }}>✓</Text> : null}</View>
            <Text style={{ flex: 1, color: "#7C8981", fontSize: 9, lineHeight: 14 }}>I agree to GharSync’s Terms of Service and Privacy Policy.</Text>
          </Pressable>
          <AuthError>{error}</AuthError>
          <AuthButton title="Create your account" onPress={() => void submit()} loading={busy} disabled={!agreed || !phoneIsValid || v.password.length < 12 || !v.fullName.trim() || !v.email.trim() || !v.organizationName.trim() || !v.city.trim()} />
          <Text style={{ color: "#89948E", fontSize: 9, lineHeight: 14 }}>Phone verification uses an SMS provider configured by your platform administrator.</Text>
        </View></View>
        <Text style={authStyles.switch}>Already have an account? <Link href="/(auth)/sign-in" style={authStyles.switchLink}>Log in →</Link></Text>
        <Text style={authStyles.secure}>✓  Your information stays private and secure</Text>
      </View>
      <Text style={{ color: "#96A098", fontSize: 9 }}>© 2026 GharSync · Made for home</Text>
    </SafeAreaView></ScrollView>

    <Modal visible={countryPicker} transparent animationType="slide" onRequestClose={() => setCountryPicker(false)}>
      <View style={styles.modalScrim}><SafeAreaView style={styles.modalPanel}>
        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Choose a country</Text><Pressable onPress={() => setCountryPicker(false)}><Text style={styles.modalClose}>Close</Text></Pressable></View>
        <TextInput value={countrySearch} onChangeText={setCountrySearch} autoFocus placeholder="Search country" placeholderTextColor="#98A49C" style={styles.searchInput} />
        <FlatList data={filteredCountries} keyboardShouldPersistTaps="handled" keyExtractor={(item) => item.code} renderItem={({ item }) => {
          const details = phoneCountryDetails(item.code);
          return <Pressable onPress={() => { setCountryCode(item.code); setV((old) => ({ ...old, phone: "", city: "" })); setCitySearch(""); setCountryPicker(false); }} style={styles.optionRow}>
            <Text style={styles.flag}>{item.flag}</Text><Text style={styles.optionName}>{item.name}</Text><Text style={styles.callingCode}>{details.callingCode ?? ""}</Text>
          </Pressable>;
        }} ListEmptyComponent={<Text style={styles.emptyText}>No countries found.</Text>} />
      </SafeAreaView></View>
    </Modal>

    <Modal visible={cityPicker} transparent animationType="slide" onRequestClose={() => setCityPicker(false)}>
      <View style={styles.modalScrim}><SafeAreaView style={styles.modalPanel}>
        <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Choose a city</Text><Text style={styles.modalSubtitle}>{selectedCountry.flag}  {selectedCountry.name}</Text></View><Pressable onPress={() => setCityPicker(false)}><Text style={styles.modalClose}>Close</Text></Pressable></View>
        <TextInput value={citySearch} onChangeText={setCitySearch} autoFocus placeholder={`Search ${cities.length.toLocaleString()} cities`} placeholderTextColor="#98A49C" style={styles.searchInput} />
        <FlatList data={filteredCities} keyboardShouldPersistTaps="handled" keyExtractor={(item, index) => `${item}-${index}`} ListHeaderComponent={citySearch.trim() && !cities.some((city) => city.toLocaleLowerCase() === citySearch.trim().toLocaleLowerCase()) ? <Pressable onPress={() => { update("city", citySearch.trim()); setCityPicker(false); }} style={styles.optionRow}><SymbolView name={{ ios: "plus", android: "add" }} size={16} tintColor={colors.green} /><Text style={styles.optionName}>Use “{citySearch.trim()}”</Text></Pressable> : undefined} renderItem={({ item }) => <Pressable onPress={() => { update("city", item); setCityPicker(false); }} style={styles.optionRow}><Text style={styles.optionName}>{item}</Text></Pressable>} ListEmptyComponent={citySearch.trim() ? undefined : <Text style={styles.emptyText}>No saved cities for this country. Search above to add one.</Text>} />
      </SafeAreaView></View>
    </Modal>

    <Modal visible={servicePicker} transparent animationType="fade" onRequestClose={() => setServicePicker(false)}>
      <View style={[styles.modalScrim, { justifyContent: "center" }]}><View style={[styles.modalPanel, styles.servicePanel]}>
        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Choose a service type</Text><Pressable onPress={() => setServicePicker(false)}><Text style={styles.modalClose}>Close</Text></Pressable></View>
        {serviceTypes.map((service) => <Pressable key={service.value} onPress={() => { setBusinessType(service.value); setServicePicker(false); }} style={styles.serviceOption}>
          <View style={styles.serviceMark}><ServiceGlyph service={service} /></View><Text style={styles.optionName}>{service.label}</Text><View style={{ flex: 1 }} />{service.value === businessType ? <SymbolView name={{ ios: "checkmark", android: "check" }} size={17} tintColor={colors.green} /> : null}
        </Pressable>)}
      </View></View>
    </Modal>
  </KeyboardAvoidingView>;
}

const styles = {
  kicker: { alignSelf: "flex-start" as const, flexDirection: "row" as const, alignItems: "center" as const, gap: 8, backgroundColor: "#F2F5EF", borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8, marginBottom: 17 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#C2A96B" },
  formCard: { borderWidth: 1, borderColor: "#EAECE5", backgroundColor: "#FFFFFF", borderRadius: 15, padding: 15, shadowColor: "#183C32", shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 1 },
  selectField: { minHeight: 44, borderRadius: 6, borderWidth: 1, borderColor: "#E4E7E0", backgroundColor: "#FFFFFF", paddingHorizontal: 10, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  selectText: { flex: 1, color: colors.ink, fontSize: 10 }, selectChevron: { color: colors.muted, fontSize: 14 },
  prefix: { minHeight: 44, justifyContent: "center" as const, borderColor: "#E4E7E0", borderWidth: 1, borderRadius: 6, backgroundColor: "#FFFFFF", paddingHorizontal: 11 }, prefixText: { color: colors.forest, fontSize: 11, fontWeight: "700" as const },
  serviceMark: { width: 28, height: 28, borderRadius: 7, backgroundColor: "#E6F0E8", alignItems: "center" as const, justifyContent: "center" as const },
  modalScrim: { flex: 1, backgroundColor: "#102F2880", justifyContent: "flex-end" as const }, modalPanel: { maxHeight: "88%" as const, backgroundColor: "#FFFEFA", borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12 }, servicePanel: { maxHeight: "80%" as const, borderRadius: 14, marginHorizontal: 20, paddingBottom: 16 },
  modalHeader: { minHeight: 38, flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, marginBottom: 9 }, modalTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" as const }, modalSubtitle: { color: colors.muted, fontSize: 10, marginTop: 3 }, modalClose: { color: colors.green, fontSize: 11, fontWeight: "700" as const },
  searchInput: { minHeight: 44, borderRadius: 7, borderWidth: 1, borderColor: colors.line, backgroundColor: "#FFFFFF", paddingHorizontal: 12, color: colors.ink, fontSize: 12, marginBottom: 8 }, optionRow: { minHeight: 45, flexDirection: "row" as const, alignItems: "center" as const, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line }, flag: { width: 28, fontSize: 18 }, optionName: { color: colors.ink, fontSize: 12 }, callingCode: { marginLeft: "auto" as const, color: colors.muted, fontSize: 11 }, emptyText: { textAlign: "center" as const, color: colors.muted, fontSize: 11, padding: 20 },
  serviceOption: { minHeight: 48, flexDirection: "row" as const, alignItems: "center" as const, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
};
