import React from "react";
import { Outlet } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children?: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  return children ? <>{children}</> : <Outlet />;
};
