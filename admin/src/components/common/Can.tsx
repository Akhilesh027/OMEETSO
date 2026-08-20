import type { ReactNode } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import type { Permission } from "@/permissions/permissions";

export function Can({ perm, fallback = null, children }: { perm: Permission | Permission[]; fallback?: ReactNode; children: ReactNode }) {
  const { canAny } = useAdminAuth();
  const list = Array.isArray(perm) ? perm : [perm];
  return canAny(list) ? <>{children}</> : <>{fallback}</>;
}
