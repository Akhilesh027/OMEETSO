import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Permission } from "@/permissions/permissions";

import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface PermissionRouteProps {
  permissions: Permission | Permission[];
  children?: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({ children, permissions }) => {
  const { hasPermission } = useAdminAuth();
  if (!hasPermission(Array.isArray(permissions) ? permissions : [permissions])) return <Navigate to="/admin/access-denied" replace />;
  return children ? <>{children}</> : <Outlet />;
};
