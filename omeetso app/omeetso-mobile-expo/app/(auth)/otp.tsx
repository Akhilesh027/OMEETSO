import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radii, spacing } from "../../constants/theme";
import { PrimaryButton } from "../../components/PrimaryButton";
import { setStoredValue, storageKeys } from "../../storage";
import type { User } from "../../types";

export default function Otp() {
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile?: string }>();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [err, setErr] = useState<string | undefined>();
  const refs = useRef<Array<TextInput | null>>([]);
  const [secs, setSecs] = useState(28);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const setAt = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) refs.current[i + 1]?.focus();
  };

  const verify = async () => {
    const code = digits.join("");
    if (code !== "1234") {
      setErr("Incorrect OTP. Hint: 1234");
      return;
    }
    const user: User = { id: "me", mobile: mobile ?? "", loggedIn: true };
    await setStoredValue(storageKeys.session, user);
    router.replace("/(auth)/profile-setup");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, padding: spacing.xl }}>
        <Text style={styles.h1}>Enter OTP</Text>
        <Text style={styles.sub}>Sent to +91 {mobile ?? ""}. Use 1234 for this preview.</Text>
        <View style={styles.row}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => { refs.current[i] = r; }}
              value={d}
              onChangeText={(t) => setAt(i, t)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.cell, err && styles.cellErr]}
              accessibilityLabel={`OTP digit ${i + 1}`}
            />
          ))}
        </View>
        {err ? <Text style={styles.err}>{err}</Text> : null}

        <PrimaryButton title="Verify" onPress={verify} style={{ marginTop: spacing.xl }} />

        <Pressable disabled={secs > 0} onPress={() => setSecs(28)} style={{ marginTop: spacing.lg, alignSelf: "center" }}>
          <Text style={[styles.resend, secs > 0 && { color: colors.textSecondary }]}>
            {secs > 0 ? `Resend OTP in ${secs}s` : "Resend OTP"}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  h1: { fontSize: 24, fontWeight: "900", color: colors.textPrimary },
  sub: { marginTop: 6, fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: "row", gap: 12, marginTop: spacing.xl, justifyContent: "center" },
  cell: { width: 56, height: 64, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, textAlign: "center", fontSize: 22, fontWeight: "800", color: colors.textPrimary },
  cellErr: { borderColor: colors.error },
  err: { color: colors.error, textAlign: "center", marginTop: 8, fontSize: 12 },
  resend: { color: colors.royalIndigo, fontWeight: "800", fontSize: 13 },
});
