import React from "react";
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";
import { colors, radii, spacing, touchTarget } from "../constants/theme";

type Props = { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean };

export function SecondaryButton({ title, onPress, style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.btn, { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }, style]}
    >
      <Text style={styles.txt}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: touchTarget.min,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
});
