import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface ProtectedAdminRouteProps {
  children?: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { status } = useAdminAuth();
  const location = useLocation();
  if (status === "initializing") return <div role="status" className="p-6">Checking your session…</div>;
  if (status !== "authenticated") return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  return children ? <>{children}</> : <Outlet />;
};
