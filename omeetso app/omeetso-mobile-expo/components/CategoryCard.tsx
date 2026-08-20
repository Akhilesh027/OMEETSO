import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { colors, radii, spacing } from "../constants/theme";
import type { Category } from "../types";

export function CategoryCard({ category, onPress }: { category: Category; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={category.name} style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: category.color + "1A" }]}>
        <Text style={[styles.emoji, { color: category.color }]}>{category.name.charAt(0)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: 76, paddingVertical: spacing.sm },
  dot: { width: 52, height: 52, borderRadius: radii.lg, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 20, fontWeight: "800" },
  name: { marginTop: 6, fontSize: 11, fontWeight: "700", color: colors.textPrimary },
});
