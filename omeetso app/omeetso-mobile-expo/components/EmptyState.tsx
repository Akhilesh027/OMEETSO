import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Inbox } from "lucide-react-native";
import { colors, spacing } from "../constants/theme";

export function EmptyState({ title, body, icon }: { title: string; body?: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>{icon ?? <Inbox color={colors.textSecondary} size={28} />}</View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  icon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.secondaryBackground, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  title: { fontSize: 15, fontWeight: "800", color: colors.textPrimary, textAlign: "center" },
  body: { marginTop: 6, fontSize: 12, color: colors.textSecondary, textAlign: "center", maxWidth: 260 },
});
