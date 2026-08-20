import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Permission } from "@/permissions/permissions";
import { usePermission } from "@/hooks/usePermission";

interface PermissionRouteProps {
  permissions: Permission | Permission[];
  children?: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({ permissions, children }) => {
  const allowed = usePermission(permissions);

  if (!allowed) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
