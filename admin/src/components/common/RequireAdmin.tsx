import React from "react";
import { Permission } from "@/permissions/permissions";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";
import { PermissionRoute } from "@/components/auth/PermissionRoute";

interface RequireAdminProps {
  perms?: Permission[];
  children?: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ perms, children }) => {
  if (perms && perms.length > 0) {
    return (
      <ProtectedAdminRoute>
        <PermissionRoute permissions={perms}>{children}</PermissionRoute>
      </ProtectedAdminRoute>
    );
  }

  return <ProtectedAdminRoute>{children}</ProtectedAdminRoute>;
};
