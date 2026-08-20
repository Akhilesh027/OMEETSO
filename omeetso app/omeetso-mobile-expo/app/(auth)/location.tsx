import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { MapPin, Navigation } from "lucide-react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { PrimaryButton } from "../../components/PrimaryButton";
import { FormInput } from "../../components/FormInput";
import { setStoredValue, storageKeys } from "../../storage";
import { hyderabadAreas } from "../../data/locations";
import type { UserLocation } from "../../types";

export default function LocationScreen() {
  const router = useRouter();
  const [pincode, setPincode] = useState("");
  const [selected, setSelected] = useState<{ area: string; pincode: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  const detect = async () => {
    setErr(undefined);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErr("Permission denied. Enable location in device settings.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      // Mock: default to Madhapur for the preview
      setSelected({ area: "Madhapur", pincode: "500081" });
      void pos;
    } catch {
      setErr("Could not detect your location. Try a pincode or area below.");
    } finally {
      setLocating(false);
    }
  };

  const save = async () => {
    const target = selected ?? (pincode.length === 6 ? hyderabadAreas.find((a) => a.pincode === pincode) : null);
    if (!target) { setErr("Choose an area or enter a valid Hyderabad pincode"); return; }
    const loc: UserLocation = { area: target.area, pincode: target.pincode, city: "Hyderabad" };
    await setStoredValue(storageKeys.location, loc);
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Set your location</Text>
        <Text style={styles.sub}>Omeetso is hyperlocal — we’ll show items and stores near you.</Text>

        <Pressable onPress={detect} accessibilityRole="button" style={styles.detect}>
          <Navigation color={colors.royalIndigo} size={18} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detectTitle}>Use my current location</Text>
            <Text style={styles.detectSub}>We only use it to personalise search results.</Text>
          </View>
          {locating ? <ActivityIndicator color={colors.royalIndigo} /> : null}
        </Pressable>

        <FormInput label="Pincode" placeholder="6-digit pincode" keyboardType="number-pad" maxLength={6} value={pincode} onChangeText={(t) => setPincode(t.replace(/\D/g, "").slice(0, 6))} />

        <Text style={styles.lbl}>Popular areas</Text>
        <View style={styles.grid}>
          {hyderabadAreas.map((a) => {
            const active = selected?.area === a.area;
            return (
              <Pressable key={a.pincode} onPress={() => setSelected(a)} accessibilityRole="button" style={[styles.chip, active && styles.chipActive]}>
                <MapPin size={12} color={active ? colors.royalIndigo : colors.textSecondary} />
                <Text style={[styles.chipTxt, active && { color: colors.royalIndigo }]}>{a.area}</Text>
              </Pressable>
            );
          })}
        </View>

        {err ? <Text style={styles.err}>{err}</Text> : null}
      </ScrollView>
      <View style={styles.footer}><PrimaryButton title="Continue" onPress={save} /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.xl },
  h1: { fontSize: 24, fontWeight: "900", color: colors.textPrimary },
  sub: { marginTop: 6, fontSize: 13, color: colors.textSecondary },
  detect: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xl, marginBottom: spacing.md },
  detectTitle: { fontSize: 14, fontWeight: "800", color: colors.textPrimary },
  detectSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  lbl: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginTop: spacing.md, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.card, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.royalIndigo, backgroundColor: "#EEF2FF" },
  chipTxt: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  err: { color: colors.error, fontSize: 12, marginTop: spacing.md },
  footer: { padding: spacing.xl },
});
