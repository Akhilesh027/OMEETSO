import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "admin-bg": "#F6F7FB",
        "admin-panel": "#FFFFFF",
        "admin-navy": "#0B1436",
        "admin-navy-2": "#141E44",
        "admin-indigo": "#3547D4",
        "admin-blue": "#4D6BFF",
        "admin-yellow": "#FFB800",
        "admin-orange": "#FF7A00",
        "admin-border": "#E4E7EF",
        "admin-muted": "#64748B",
        "admin-text": "#0F172A",
        "admin-success": "#16A36A",
        "admin-warning": "#F59E0B",
        "admin-error": "#DC3545",
        "admin-info": "#0EA5E9",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
      },
    },
  },
  plugins: [],
} satisfies Config;
