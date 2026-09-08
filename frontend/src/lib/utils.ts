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
  // Allow mobile / IME virtual keyboards (Android / Gboard key codes)
  if (e.key === "Unidentified" || (e as any).keyCode === 229) {
    return;
  }

  // Allow navigation, editing control keys and spaces
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
    e.key === "End" ||
    e.key === " "
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

/**
 * Formats a 10-digit Indian phone number with clear 5+5 spacing (e.g., "98765 43210").
 */
export function formatPhoneDisplay(val: string | number | undefined | null): string {
  if (!val) return "";
  const clean = cleanPhoneInput(val);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)} ${clean.slice(5, 10)}`;
}

/**
 * Cleans phone input by stripping non-numeric characters and removing leading +91 / 91 / 0.
 * Always returns at most 10 digits.
 */
export function cleanPhoneInput(val: string | number | undefined | null): string {
  if (!val) return "";
  let d = String(val).replace(/\D/g, "");
  if (d.startsWith("91") && d.length > 10) {
    d = d.slice(2);
  } else if (d.startsWith("0") && d.length > 10) {
    d = d.slice(1);
  }
  return d.slice(0, 10);
}

