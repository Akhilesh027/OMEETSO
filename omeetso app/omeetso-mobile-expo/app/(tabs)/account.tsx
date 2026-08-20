import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, ShieldCheck, Bell, Settings, HelpCircle, LogOut, Wallet, Star, Store as StoreIcon, ChevronRight } from "lucide-react-native";
import { colors, radii, shadows, spacing } from "../../constants/theme";
import { clearUserSession, getStoredValue, storageKeys } from "../../storage";
import type { Profile } from "../../types";
import { SecondaryButton } from "../../components/SecondaryButton";

const GROUPS: { title: string; items: { label: string; Icon: React.ComponentType<{ color: string; size: number }> }[] }[] = [
  { title: "Selling", items: [{ label: "My Listings", Icon: StoreIcon }, { label: "My Stores", Icon: StoreIcon }, { label: "Wallet", Icon: Wallet }] },
  { title: "Trust", items: [{ label: "Verification centre", Icon: ShieldCheck }, { label: "Reviews", Icon: Star }] },
  { title: "Preferences", items: [{ label: "Notifications", Icon: Bell }, { label: "Settings", Icon: Settings }] },
  { title: "Support", items: [{ label: "Help & FAQs", Icon: HelpCircle }] },
];

export default function Account() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => { (async () => setProfile(await getStoredValue<Profile>(storageKeys.profile)))(); }, []);

  const logout = async () => {
    await clearUserSession();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <View style={styles.hero}>
          <View style={styles.avatar}><User color={colors.royalIndigo} size={26} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.name ?? "Guest user"}</Text>
            <Text style={styles.meta}>{profile?.mobile ? `+91 ${profile.mobile}` : "Not signed in"}</Text>
            <Text style={styles.type}>{profile?.accountType === "business" ? "Business account" : "Individual account"}</Text>
          </View>
        </View>

        {GROUPS.map((g) => (
          <View key={g.title} style={{ marginTop: spacing.lg }}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            <View style={styles.group}>
              {g.items.map((it, idx) => (
                <Pressable key={it.label} accessibilityRole="button" style={[styles.row, idx > 0 && styles.rowBorder]}>
                  <View style={styles.iconWrap}><it.Icon color={colors.royalIndigo} size={18} /></View>
                  <Text style={styles.rowTxt}>{it.label}</Text>
                  <ChevronRight color={colors.textSecondary} size={16} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <SecondaryButton title="Log out" onPress={logout} style={{ marginTop: spacing.xl }} />
        <View style={{ alignItems: "center", marginTop: spacing.md, flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <LogOut color={colors.textSecondary} size={12} />
          <Text style={styles.legal}>Omeetso · v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, ...shadows.card },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.secondaryBackground, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "900", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  type: { fontSize: 11, color: colors.royalIndigo, marginTop: 2, fontWeight: "800" },
  groupTitle: { fontSize: 11, fontWeight: "800", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8, paddingHorizontal: 4 },
  group: { backgroundColor: colors.card, borderRadius: radii.lg, overflow: "hidden", ...shadows.card },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.secondaryBackground, alignItems: "center", justifyContent: "center" },
  rowTxt: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  legal: { fontSize: 11, color: colors.textSecondary },
});
