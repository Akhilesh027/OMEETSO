import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Text, Platform } from "react-native";
import { Home, Grid, Plus, MessageCircle, User } from "lucide-react-native";
import { colors, radii, shadows } from "../../constants/theme";

function SellTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.sellBtn, focused && { transform: [{ scale: 0.96 }] }]}>
      <Plus color={colors.deepNavy} size={26} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.royalIndigo,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="categories" options={{ title: "Categories", tabBarIcon: ({ color }) => <Grid color={color} size={22} /> }} />
      <Tabs.Screen
        name="sell"
        options={{
          title: "",
          tabBarLabel: () => <Text style={styles.sellLabel}>Sell</Text>,
          tabBarIcon: ({ focused }) => <SellTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen name="chats" options={{ title: "Chats", tabBarIcon: ({ color }) => <MessageCircle color={color} size={22} /> }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: ({ color }) => <User color={color} size={22} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sellBtn: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.warmYellow,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    ...shadows.raised,
  },
  sellLabel: { fontSize: 11, fontWeight: "800", color: colors.deepNavy, marginTop: -2 },
});
