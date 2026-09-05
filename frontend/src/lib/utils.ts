import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Restricts keyboard input to numbers only.
 * Prevents alphabetical characters and non-numeric symbols from being typed.
 */
export function preventNonNumericKeyDown(
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  allowDecimal = false
) {
  // Allow navigation and editing control keys
  if (
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "Escape" ||
    e.key === "Enter" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "Home" ||
    e.key === "End"
  ) {
    return;
  }

  // Allow Ctrl/Command shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
  if (e.ctrlKey || e.metaKey) {
    return;
  }

  // Allow single decimal point if enabled
  if (allowDecimal && e.key === ".") {
    const val = (e.currentTarget as HTMLInputElement).value || "";
    if (!val.includes(".")) {
      return;
    }
  }

  // Allow digits 0-9
  if (/^[0-9]$/.test(e.key)) {
    return;
  }

  // Prevent alphabetical and other disallowed characters
  e.preventDefault();
}

/**
 * Strips any non-numeric characters from a string (useful for paste and onChange sanitization).
 */
export function sanitizeNumericInput(val: string | number | undefined | null, allowDecimal = false): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (allowDecimal) {
    let cleaned = str.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  }
  return str.replace(/\D/g, "");
}
