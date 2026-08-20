import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radii, spacing } from "../../constants/theme";
import { FormInput } from "../../components/FormInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { getStoredValue, setStoredValue, storageKeys } from "../../storage";
import type { Profile, User } from "../../types";

export default function ProfileSetup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"individual" | "business">("individual");
  const [err, setErr] = useState<string | undefined>();

  const save = async () => {
    if (name.trim().length < 2) { setErr("Enter your full name"); return; }
    const user = (await getStoredValue<User>(storageKeys.session)) ?? { id: "me", mobile: "", loggedIn: true };
    const profile: Profile = {
      id: user.id,
      name: name.trim(),
      mobile: user.mobile,
      email: email.trim() || undefined,
      accountType: type,
      createdAt: Date.now(),
    };
    await setStoredValue(storageKeys.profile, profile);
    router.replace("/(auth)/location");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Set up your profile</Text>
          <Text style={styles.sub}>Tell us a bit about yourself. You can edit this anytime.</Text>

          <View style={{ marginTop: spacing.xl }}>
            <FormInput label="Full name" placeholder="e.g. Priya Sharma" value={name} onChangeText={(t) => { setName(t); setErr(undefined); }} error={err} />
            <FormInput label="Email (optional)" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.lbl}>Account type</Text>
            <View style={styles.segRow}>
              {(["individual", "business"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: type === t }}
                  style={[styles.seg, type === t && styles.segActive]}
                >
                  <Text style={[styles.segTxt, type === t && styles.segTxtActive]}>
                    {t === "individual" ? "Individual" : "Business"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <PrimaryButton title="Continue" onPress={save} style={{ marginTop: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.xl },
  h1: { fontSize: 24, fontWeight: "900", color: colors.textPrimary },
  sub: { marginTop: 6, fontSize: 13, color: colors.textSecondary },
  lbl: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 6, marginTop: 6 },
  segRow: { flexDirection: "row", gap: 8 },
  seg: { flex: 1, paddingVertical: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" },
  segActive: { borderColor: colors.royalIndigo, backgroundColor: "#EEF2FF" },
  segTxt: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  segTxtActive: { color: colors.royalIndigo },
});
