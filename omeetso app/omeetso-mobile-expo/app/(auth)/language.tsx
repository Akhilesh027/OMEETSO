import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { PrimaryButton } from "../../components/PrimaryButton";
import { setStoredValue, storageKeys } from "../../storage";
import type { Language } from "../../types";

const OPTIONS: { id: Language; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
  { id: "te", label: "Telugu", native: "తెలుగు" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [sel, setSel] = useState<Language>("en");

  const cont = async () => {
    await setStoredValue(storageKeys.language, sel);
    router.replace("/(auth)/onboarding");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.h1}>Choose your language</Text>
        <Text style={styles.sub}>You can change this later in Settings.</Text>
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {OPTIONS.map((o) => {
            const active = sel === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => setSel(o.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.row, active && styles.rowActive]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{o.native}</Text>
                  <Text style={styles.rowSub}>{o.label}</Text>
                </View>
                {active ? <Check color={colors.royalIndigo} size={18} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={cont} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.xl },
  h1: { fontSize: 24, fontWeight: "900", color: colors.textPrimary },
  sub: { marginTop: 6, fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: "row", alignItems: "center", padding: spacing.lg, backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
  rowActive: { borderColor: colors.royalIndigo, backgroundColor: "#EEF2FF" },
  rowTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  footer: { padding: spacing.xl, backgroundColor: colors.background },
});
