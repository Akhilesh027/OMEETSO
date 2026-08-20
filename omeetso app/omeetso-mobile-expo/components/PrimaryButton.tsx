import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, View, type ViewStyle } from "react-native";
import { colors, radii, spacing, touchTarget } from "../constants/theme";

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "accent";
};

export function PrimaryButton({ title, onPress, loading, disabled, style, variant = "primary" }: Props) {
  const bg = variant === "accent" ? colors.warmYellow : colors.royalIndigo;
  const fg = variant === "accent" ? colors.deepNavy : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.txt, { color: fg }]}>{title}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: touchTarget.min,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  txt: { fontSize: 15, fontWeight: "800" },
});
