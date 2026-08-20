import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Zap, FileText, Store as StoreIcon, ArrowRight } from "lucide-react-native";
import { colors, radii, shadows, spacing } from "../../constants/theme";

const METHODS = [
  { id: "quick", title: "Quick Sell", body: "Post an ad in 60 seconds with photo, title and price.", Icon: Zap, color: colors.warmYellow },
  { id: "detailed", title: "Detailed Sell", body: "Complete listing with specs, condition and offers.", Icon: FileText, color: colors.royalIndigo },
  { id: "store", title: "Sell through Store", body: "Add products to your verified Omeetso store.", Icon: StoreIcon, color: colors.brightOrange },
];

export default function Sell() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Text style={styles.h1}>How do you want to sell?</Text>
        <Text style={styles.sub}>Choose a method to list your item on Omeetso.</Text>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {METHODS.map((m) => (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={m.title}
              style={styles.card}
              // TODO: wire to sell flows in the next batch
              onPress={() => { }}
            >
              <View style={[styles.iconWrap, { backgroundColor: m.color + "1A" }]}>
                <m.Icon color={m.color} size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{m.title}</Text>
                <Text style={styles.body}>{m.body}</Text>
              </View>
              <ArrowRight color={colors.textSecondary} size={18} />
            </Pressable>
          ))}
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipTitle}>Tip: better photos sell 3× faster</Text>
          <Text style={styles.tipBody}>Use bright light, plain background, and multiple angles.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  h1: { fontSize: 22, fontWeight: "900", color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, ...shadows.card },
  iconWrap: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  body: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  tip: { marginTop: spacing.xl, backgroundColor: "#FEF3C7", borderRadius: radii.lg, padding: spacing.lg },
  tipTitle: { fontSize: 13, fontWeight: "800", color: "#92400E" },
  tipBody: { fontSize: 12, color: "#92400E", opacity: 0.9, marginTop: 2 },
});
