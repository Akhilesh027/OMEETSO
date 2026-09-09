import React from "react";
import { Outlet } from "react-router-dom";
import { Permission } from "@/permissions/permissions";

interface PermissionRouteProps {
  permissions: Permission | Permission[];
  children?: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({ children }) => {
  return children ? <>{children}</> : <Outlet />;
};
