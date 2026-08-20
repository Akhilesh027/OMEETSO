import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, ShieldCheck, Store as StoreIcon, Sparkles } from "lucide-react-native";
import { colors, radii, shadows, spacing } from "../../constants/theme";
import { LocationSelector } from "../../components/LocationSelector";
import { SearchBar } from "../../components/SearchBar";
import { CategoryCard } from "../../components/CategoryCard";
import { ProductCard } from "../../components/ProductCard";
import { AdvertisementBanner } from "../../components/AdvertisementBanner";
import { LoadingState } from "../../components/LoadingState";
import { categories } from "../../data/categories";
import { products } from "../../data/products";
import { stores } from "../../data/stores";
import { advertisements } from "../../data/advertisements";
import { getStoredValue, storageKeys } from "../../storage";
import type { UserLocation, Profile } from "../../types";

export default function Home() {
  const router = useRouter();
  const [loc, setLoc] = useState<UserLocation | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const l = await getStoredValue<UserLocation>(storageKeys.location);
    const p = await getStoredValue<Profile>(storageKeys.profile);
    setLoc(l);
    setProfile(p);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const nearby = products.filter((p) => !p.sponsored).slice(0, 4);
  const featured = products.slice(0, 6);
  const sponsored = products.filter((p) => p.sponsored);
  const recently = products.slice().reverse().slice(0, 4);

  if (loading) {
    return <SafeAreaView style={styles.safe}><LoadingState /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hi}>Hi {profile?.name?.split(" ")[0] ?? "there"} 👋</Text>
          <LocationSelector area={loc?.area} pincode={loc?.pincode} onPress={() => router.push("/(auth)/location")} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.bell} hitSlop={8}>
          <Bell color={colors.textPrimary} size={20} />
        </Pressable>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.royalIndigo} />}
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      >
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SearchBar onPress={() => router.push("/(tabs)/categories")} />
        </View>

        <View style={{ padding: spacing.lg }}>
          <AdvertisementBanner ad={advertisements[0]} onPress={() => {}} />
        </View>

        <Section title="Popular categories">
          <FlatList
            data={categories}
            keyExtractor={(c) => c.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 4 }}
            renderItem={({ item }) => <CategoryCard category={item} onPress={() => router.push("/(tabs)/categories")} />}
          />
        </Section>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <Pressable onPress={() => router.push("/(tabs)/sell")} accessibilityRole="button" style={styles.quickSell}>
            <View style={styles.quickSellIcon}><Sparkles color={colors.deepNavy} size={22} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickSellTitle}>Quick Sell in 60 seconds</Text>
              <Text style={styles.quickSellSub}>Post an ad with just a photo, title and price.</Text>
            </View>
          </Pressable>
        </View>

        <Section title="Nearby products">
          <FlatList
            data={nearby}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        </Section>

        <Section title="Featured listings">
          <View style={styles.grid}>
            {featured.map((p) => (
              <View key={p.id} style={{ width: "48%" }}>
                <ProductCard product={p} width={undefined as unknown as number} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Local stores">
          <FlatList
            data={stores}
            keyExtractor={(s) => s.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
            renderItem={({ item }) => (
              <View style={styles.storeCard}>
                <View style={styles.storeLogo}><StoreIcon color={colors.royalIndigo} size={20} /></View>
                <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.storeArea}>{item.area}</Text>
                {item.verified ? <Text style={styles.verified}>✓ Verified</Text> : null}
              </View>
            )}
          />
        </Section>

        {sponsored[0] ? (
          <Section title="Sponsored">
            <View style={{ paddingHorizontal: spacing.lg }}>
              <ProductCard product={sponsored[0]} width={undefined as unknown as number} />
            </View>
          </Section>
        ) : null}

        <Section title="Recently viewed">
          <FlatList
            data={recently}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        </Section>

        <View style={{ padding: spacing.lg }}>
          <View style={styles.safety}>
            <ShieldCheck color={colors.success} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyTitle}>Stay safe on Omeetso</Text>
              <Text style={styles.safetyBody}>Meet in public places. Never share OTPs or make payments before inspecting the item.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  hi: { fontSize: 12, color: colors.textSecondary, fontWeight: "700" },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondaryBackground, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: colors.textPrimary, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, paddingHorizontal: spacing.lg },
  quickSell: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.deepNavy, borderRadius: radii.lg, padding: spacing.lg, ...shadows.card, marginTop: spacing.sm },
  quickSellIcon: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.warmYellow, alignItems: "center", justifyContent: "center" },
  quickSellTitle: { fontSize: 14, fontWeight: "900", color: colors.white },
  quickSellSub: { fontSize: 11, color: colors.white, opacity: 0.8, marginTop: 2 },
  storeCard: { width: 140, backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.md, ...shadows.card },
  storeLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondaryBackground, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  storeName: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  storeArea: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  verified: { fontSize: 10, color: colors.success, fontWeight: "800", marginTop: 4 },
  safety: { flexDirection: "row", gap: spacing.md, backgroundColor: "#ECFDF5", borderColor: "#A7F3D0", borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg },
  safetyTitle: { fontSize: 13, fontWeight: "800", color: "#065F46" },
  safetyBody: { fontSize: 11, color: "#065F46", opacity: 0.9, marginTop: 2 },
});
