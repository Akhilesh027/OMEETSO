import React from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Search } from "lucide-react-native";
import { colors, radii, spacing, touchTarget } from "../constants/theme";

type Props = { value?: string; onChangeText?: (v: string) => void; onSubmit?: () => void; placeholder?: string; onPress?: () => void };

export function SearchBar({ value, onChangeText, onSubmit, placeholder = "Search products, stores, categories", onPress }: Props) {
  const inner = (
    <View style={styles.wrap}>
      <Search color={colors.textSecondary} size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        returnKeyType="search"
        editable={!onPress}
        pointerEvents={onPress ? "none" : "auto"}
      />
    </View>
  );
  if (onPress) return <Pressable onPress={onPress} accessibilityRole="search">{inner}</Pressable>;
  return inner;
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: touchTarget.min,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 10 },
});
