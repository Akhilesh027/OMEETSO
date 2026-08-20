import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii } from "../constants/theme";

type Kind = "success" | "warning" | "error" | "info" | "neutral";

const map: Record<Kind, { bg: string; fg: string }> = {
  success: { bg: "#DCFCE7", fg: "#065F46" },
  warning: { bg: "#FEF3C7", fg: "#92400E" },
  error: { bg: "#FEE2E2", fg: "#991B1B" },
  info: { bg: "#DBEAFE", fg: "#1E3A8A" },
  neutral: { bg: colors.secondaryBackground, fg: colors.textSecondary },
};

export function StatusBadge({ label, kind = "neutral" }: { label: string; kind?: Kind }) {
  const c = map[kind];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Text style={[styles.txt, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  txt: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
});
