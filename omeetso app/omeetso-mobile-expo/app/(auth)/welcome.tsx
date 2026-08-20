import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radii, spacing } from "../../constants/theme";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";

export default function Welcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.logo}><Text style={styles.mark}>O</Text></View>
        <Text style={styles.title}>Welcome to Omeetso</Text>
        <Text style={styles.sub}>Buy, sell and connect with people nearby in Hyderabad.</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Continue with mobile" onPress={() => router.push("/(auth)/login")} />
        <SecondaryButton title="Browse as guest" style={{ marginTop: 12 }} onPress={() => router.replace("/(tabs)/home")} />
        <Text style={styles.legal}>By continuing, you agree to Omeetso’s Terms and Privacy Policy.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  logo: { width: 96, height: 96, borderRadius: 28, backgroundColor: colors.warmYellow, alignItems: "center", justifyContent: "center", marginBottom: spacing.xl },
  mark: { fontSize: 48, fontWeight: "900", color: colors.deepNavy },
  title: { fontSize: 26, fontWeight: "900", color: colors.textPrimary },
  sub: { marginTop: 8, fontSize: 14, color: colors.textSecondary, textAlign: "center", maxWidth: 300 },
  footer: { padding: spacing.xl },
  legal: { marginTop: spacing.md, fontSize: 11, color: colors.textSecondary, textAlign: "center" },
});
