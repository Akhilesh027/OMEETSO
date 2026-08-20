import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  children: ReactNode;
}
export function Button({ variant = "primary", className, children, ...rest }: Props) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60";
  const variants: Record<string, string> = {
    primary: "bg-admin-indigo text-white hover:bg-admin-navy-2",
    secondary: "border border-admin-border bg-white text-admin-text hover:bg-admin-bg",
    danger: "bg-admin-error text-white hover:brightness-95",
    ghost: "text-admin-text hover:bg-admin-bg",
  };
  return <button {...rest} className={cn(base, variants[variant], className)}>{children}</button>;
}
