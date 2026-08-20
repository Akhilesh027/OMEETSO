import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { MapPin } from "lucide-react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";
import type { Product } from "../types";

type Props = { product: Product; onPress?: () => void; width?: number };

export function ProductCard({ product, onPress, width = 168 }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={product.title} style={[styles.wrap, { width }]}>
      <Image source={{ uri: product.image }} style={styles.img} contentFit="cover" transition={200} />
      {product.sponsored ? (
        <View style={styles.sponsor}><Text style={styles.sponsorTxt}>Sponsored</Text></View>
      ) : null}
      <View style={styles.body}>
        <Text style={styles.price}>₹{product.price.toLocaleString("en-IN")}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <View style={styles.row}>
          <MapPin size={11} color={colors.textSecondary} />
          <Text style={styles.area} numberOfLines={1}>{product.area}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderRadius: radii.lg, overflow: "hidden", ...shadows.card },
  img: { width: "100%", height: 120, backgroundColor: colors.secondaryBackground },
  sponsor: { position: "absolute", top: 8, left: 8, backgroundColor: colors.warmYellow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  sponsorTxt: { fontSize: 10, fontWeight: "800", color: colors.deepNavy },
  body: { padding: spacing.md },
  price: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  title: { fontSize: 12, color: colors.textPrimary, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  area: { fontSize: 11, color: colors.textSecondary },
});
