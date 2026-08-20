import type { ReactNode } from "react";
import { AdminAuthProvider } from "./AdminAuthContext";

export function AdminProviders({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
