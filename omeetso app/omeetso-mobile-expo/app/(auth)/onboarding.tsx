import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, Tag, Store } from "lucide-react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { PrimaryButton } from "../../components/PrimaryButton";
import { setStoredValue, storageKeys } from "../../storage";

const { width } = Dimensions.get("window");

const SLIDES = [
  { key: "1", title: "Discover locally", body: "Find products from neighbours across Hyderabad — Madhapur to Uppal.", Icon: MapPin, color: colors.royalIndigo },
  { key: "2", title: "Sell in minutes", body: "Post a listing in under a minute. Reach buyers nearby, fast.", Icon: Tag, color: colors.brightOrange },
  { key: "3", title: "Trusted local stores", body: "Follow verified businesses and chat directly with sellers.", Icon: Store, color: colors.warmYellow },
];

export default function Onboarding() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const [i, setI] = useState(0);

  const next = async () => {
    if (i < SLIDES.length - 1) {
      const n = i + 1;
      setI(n);
      listRef.current?.scrollToIndex({ index: n, animated: true });
    } else {
      await setStoredValue(storageKeys.onboarding, true);
      router.replace("/(auth)/welcome");
    }
  };

  const skip = async () => {
    await setStoredValue(storageKeys.onboarding, true);
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={skip} accessibilityRole="button"><Text style={styles.skip}>Skip</Text></Pressable>
      </View>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: "center", justifyContent: "center", padding: spacing.xxl }}>
            <View style={[styles.icon, { backgroundColor: item.color + "1A" }]}>
              <item.Icon color={item.color} size={44} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SLIDES.map((_, idx) => (
          <View key={idx} style={[styles.dot, idx === i && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.footer}>
        <PrimaryButton title={i === SLIDES.length - 1 ? "Get started" : "Next"} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: "row", justifyContent: "flex-end", padding: spacing.lg },
  skip: { color: colors.textSecondary, fontWeight: "700", fontSize: 13 },
  icon: { width: 120, height: 120, borderRadius: radii.xl, alignItems: "center", justifyContent: "center", marginBottom: spacing.xl },
  title: { fontSize: 22, fontWeight: "900", color: colors.textPrimary, textAlign: "center" },
  body: { marginTop: 8, fontSize: 14, color: colors.textSecondary, textAlign: "center", maxWidth: 300 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.royalIndigo, width: 18 },
  footer: { padding: spacing.xl },
});
