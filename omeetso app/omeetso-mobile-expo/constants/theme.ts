export const colors = {
  deepNavy: "#111E4D",
  royalIndigo: "#3547D4",
  electricBlue: "#4D6BFF",
  warmYellow: "#FFB800",
  brightOrange: "#FF7A00",
  background: "#F5F7FC",
  secondaryBackground: "#EEF2FA",
  card: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#16A36A",
  error: "#DC3545",
  warning: "#F59E0B",
  white: "#FFFFFF",
  black: "#000000",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: "800" as const, color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: "800" as const, color: colors.textPrimary },
  h3: { fontSize: 16, fontWeight: "700" as const, color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.textPrimary },
  small: { fontSize: 12, fontWeight: "400" as const, color: colors.textSecondary },
  label: { fontSize: 13, fontWeight: "600" as const, color: colors.textPrimary },
};

export const shadows = {
  card: {
    shadowColor: "#0B1B3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: "#0B1B3A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
};

export const iconSizes = { sm: 16, md: 20, lg: 24, xl: 28 };
export const touchTarget = { min: 44 };
