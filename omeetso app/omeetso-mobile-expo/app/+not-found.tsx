import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { colors, spacing } from "../constants/theme";

export default function NotFound() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Screen not found</Text>
      <Text style={styles.body}>The page you tried to open doesn’t exist in Omeetso.</Text>
      <Link href="/" style={styles.link}>Go to Splash</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: "800", color: colors.textPrimary },
  body: { marginTop: 8, fontSize: 13, color: colors.textSecondary, textAlign: "center" },
  link: { marginTop: spacing.xl, color: colors.royalIndigo, fontWeight: "800" },
});
