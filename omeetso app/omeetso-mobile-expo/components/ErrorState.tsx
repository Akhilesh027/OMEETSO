import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { colors, spacing } from "../constants/theme";
import { PrimaryButton } from "./PrimaryButton";

export function ErrorState({ title = "Something went wrong", body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}><AlertTriangle color={colors.error} size={28} /></View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {onRetry ? <PrimaryButton title="Retry" onPress={onRetry} style={{ marginTop: spacing.lg, minWidth: 160 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  icon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  title: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  body: { marginTop: 6, fontSize: 12, color: colors.textSecondary, textAlign: "center", maxWidth: 260 },
});
