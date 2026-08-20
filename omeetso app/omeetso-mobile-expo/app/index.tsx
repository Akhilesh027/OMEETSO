import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/theme";
import { getStoredValue, storageKeys } from "../storage";
import type { Language, UserLocation, Profile } from "../types";

export default function Splash() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
    ]).start();

    const t = setTimeout(async () => {
      const language = await getStoredValue<Language>(storageKeys.language);
      const onboarded = await getStoredValue<boolean>(storageKeys.onboarding);
      const profile = await getStoredValue<Profile>(storageKeys.profile);
      const location = await getStoredValue<UserLocation>(storageKeys.location);

      if (!language) return router.replace("/(auth)/language");
      if (!onboarded) return router.replace("/(auth)/onboarding");
      if (!profile) return router.replace("/(auth)/welcome");
      if (!location) return router.replace("/(auth)/location");
      router.replace("/(tabs)/home");
    }, 1800);

    return () => clearTimeout(t);
  }, [router, opacity, scale]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.logo, { transform: [{ scale }], opacity }]}>
        <Text style={styles.mark}>O</Text>
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity }]}>Omeetso</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity }]}>Local marketplace, delivered nearby</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.deepNavy, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { width: 96, height: 96, borderRadius: 28, backgroundColor: colors.warmYellow, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  mark: { fontSize: 48, fontWeight: "900", color: colors.deepNavy },
  title: { fontSize: 28, fontWeight: "900", color: colors.white, letterSpacing: 0.5 },
  tagline: { marginTop: 6, fontSize: 13, color: colors.white, opacity: 0.75 },
});
