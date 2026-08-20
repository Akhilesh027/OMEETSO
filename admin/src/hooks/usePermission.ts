import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Permission } from "@/permissions/permissions";

export function usePermission(requiredPermissions: Permission | Permission[]): boolean {
  const { hasPermission, status } = useAdminAuth();

  if (status !== "authenticated") {
    return false;
  }

  const permissionsArray = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return hasPermission(permissionsArray);
}
