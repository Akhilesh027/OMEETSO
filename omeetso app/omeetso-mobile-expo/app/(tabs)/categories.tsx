import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing, shadows } from "../../constants/theme";
import { categories } from "../../data/categories";
import { SearchBar } from "../../components/SearchBar";

export default function Categories() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.h1}>All categories</Text>
        <Text style={styles.sub}>Browse everything on Omeetso</Text>
      </View>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <SearchBar />
      </View>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        numColumns={2}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        columnWrapperStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={item.name} style={[styles.cat, { flex: 1 }]}>
            <View style={[styles.icon, { backgroundColor: item.color + "1A" }]}>
              <Text style={[styles.letter, { color: item.color }]}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  h1: { fontSize: 22, fontWeight: "900", color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cat: { backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, alignItems: "center", ...shadows.card },
  icon: { width: 56, height: 56, borderRadius: radii.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  letter: { fontSize: 22, fontWeight: "900" },
  name: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
});
