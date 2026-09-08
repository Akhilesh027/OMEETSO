import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { RouteLoader } from "@/components/common/RouteLoader";

interface ProtectedAdminRouteProps {
  children?: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { status, setIntendedRoute } = useAdminAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (
      status !== "authenticated" &&
      status !== "initializing" &&
      status !== "two_factor_required" &&
      status !== "session_expired" &&
      status !== "account_locked"
    ) {
      setIntendedRoute(location.pathname + location.search);
    }
  }, [status, location.pathname, location.search, setIntendedRoute]);

  if (status === "initializing") {
    return <RouteLoader message="Restoring admin session..." />;
  }

  if (status === "two_factor_required") {
    return <Navigate to="/admin/two-factor" replace />;
  }

  if (status === "session_expired") {
    return <Navigate to="/admin/session-expired" replace />;
  }

  if (status === "account_locked") {
    return <Navigate to="/admin/account-locked" replace />;
  }

  if (status !== "authenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
