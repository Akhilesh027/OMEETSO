import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../constants/theme";
import { FormInput } from "../../components/FormInput";
import { PrimaryButton } from "../../components/PrimaryButton";

export default function Login() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!/^\d{10}$/.test(mobile)) {
      setErr("Enter a valid 10-digit mobile number");
      return;
    }
    setErr(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: "/(auth)/otp", params: { mobile } });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Sign in to Omeetso</Text>
          <Text style={styles.sub}>We’ll send you a one-time password on your mobile.</Text>

          <View style={{ marginTop: spacing.xl }}>
            <FormInput
              label="Mobile number"
              prefix="+91"
              value={mobile}
              onChangeText={(t) => setMobile(t.replace(/\D/g, "").slice(0, 10))}
              keyboardType="number-pad"
              placeholder="10-digit mobile"
              maxLength={10}
              error={err}
            />
          </View>

          <PrimaryButton title="Continue securely" onPress={submit} loading={loading} style={{ marginTop: spacing.md }} />
          <Text style={styles.legal}>By continuing you agree to Omeetso’s Terms and Privacy Policy.</Text>
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
  legal: { marginTop: spacing.lg, fontSize: 11, color: colors.textSecondary, textAlign: "center" },
});
