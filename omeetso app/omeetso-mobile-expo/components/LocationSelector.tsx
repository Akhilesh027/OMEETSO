import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MapPin, ChevronDown } from "lucide-react-native";
import { colors, spacing } from "../constants/theme";

type Props = { area?: string; pincode?: string; onPress?: () => void };

export function LocationSelector({ area, pincode, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Change location" style={styles.wrap}>
      <MapPin color={colors.royalIndigo} size={16} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Delivering in</Text>
        <Text style={styles.value} numberOfLines={1}>
          {area ? `${area}${pincode ? ` · ${pincode}` : ""}` : "Set your location"}
        </Text>
      </View>
      <ChevronDown color={colors.textSecondary} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  label: { fontSize: 10, color: colors.textSecondary, fontWeight: "700", textTransform: "uppercase" },
  value: { fontSize: 14, color: colors.textPrimary, fontWeight: "800" },
});
