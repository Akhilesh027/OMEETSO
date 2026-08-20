import React from "react";
import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { colors, radii, spacing, touchTarget } from "../constants/theme";

type Props = TextInputProps & { label?: string; error?: string; prefix?: string };

export function FormInput({ label, error, prefix, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 6 },
  field: {
    minHeight: touchTarget.min,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  fieldError: { borderColor: colors.error },
  prefix: { fontSize: 15, color: colors.textPrimary, marginRight: 6, fontWeight: "700" },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 10 },
  err: { color: colors.error, fontSize: 12, marginTop: 4 },
});
