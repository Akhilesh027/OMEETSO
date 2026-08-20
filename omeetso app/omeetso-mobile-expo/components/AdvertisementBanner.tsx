import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, radii, spacing, shadows } from "../constants/theme";
import type { Advertisement } from "../types";

export function AdvertisementBanner({ ad, onPress }: { ad: Advertisement; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Sponsored: ${ad.title}`} style={styles.wrap}>
      <Image source={{ uri: ad.image }} style={styles.img} contentFit="cover" transition={200} />
      <View style={styles.overlay}>
        <View style={styles.tag}><Text style={styles.tagTxt}>Sponsored</Text></View>
        <Text style={styles.title} numberOfLines={2}>{ad.title}</Text>
        {ad.subtitle ? <Text style={styles.sub} numberOfLines={2}>{ad.subtitle}</Text> : null}
        <View style={styles.cta}><Text style={styles.ctaTxt}>{ad.cta}</Text></View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.xl, overflow: "hidden", ...shadows.card, backgroundColor: colors.deepNavy, height: 160 },
  img: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  overlay: { flex: 1, padding: spacing.lg, justifyContent: "flex-end" },
  tag: { alignSelf: "flex-start", backgroundColor: colors.warmYellow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill, marginBottom: 6 },
  tagTxt: { fontSize: 10, fontWeight: "800", color: colors.deepNavy },
  title: { fontSize: 18, fontWeight: "800", color: colors.white },
  sub: { fontSize: 12, color: colors.white, opacity: 0.9, marginTop: 2 },
  cta: { alignSelf: "flex-start", backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, marginTop: spacing.md },
  ctaTxt: { fontSize: 12, fontWeight: "800", color: colors.deepNavy },
});
