import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle } from "lucide-react-native";
import { colors, radii, spacing, shadows } from "../../constants/theme";
import { chats } from "../../data/chats";
import { EmptyState } from "../../components/EmptyState";

function timeAgo(ts: number) {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

export default function Chats() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.h1}>Chats</Text>
        <Text style={styles.sub}>Your conversations with buyers and sellers</Text>
      </View>
      {chats.length === 0 ? (
        <EmptyState title="No messages yet" body="Chats with buyers and sellers will appear here." icon={<MessageCircle size={26} color={colors.textSecondary} />} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" style={styles.row}>
              <View style={styles.avatar}><Text style={styles.avatarTxt}>{item.peerName.charAt(0)}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.name} numberOfLines={1}>{item.peerName}</Text>
                  <Text style={styles.time}>{timeAgo(item.updatedAt)}</Text>
                </View>
                <Text style={styles.last} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              {item.unread > 0 ? <View style={styles.badge}><Text style={styles.badgeTxt}>{item.unread}</Text></View> : null}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  h1: { fontSize: 22, fontWeight: "900", color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.md, ...shadows.card },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondaryBackground, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 15, fontWeight: "900", color: colors.royalIndigo },
  name: { fontSize: 14, fontWeight: "800", color: colors.textPrimary, flex: 1 },
  time: { fontSize: 11, color: colors.textSecondary },
  last: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: colors.royalIndigo, alignItems: "center", justifyContent: "center" },
  badgeTxt: { color: colors.white, fontSize: 11, fontWeight: "800" },
});
