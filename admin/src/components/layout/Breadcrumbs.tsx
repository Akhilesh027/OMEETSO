import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  const formatBreadcrumbLabel = (str: string) => {
    return str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-xs text-[#64748B]">
      <Link
        to="/admin/dashboard"
        className="flex items-center text-[#64748B] hover:text-[#3547D4] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {pathnames.map((value, index) => {
        if (value === "admin" && index === 0) return null;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-[#111827] truncate max-w-[200px]">
                {formatBreadcrumbLabel(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-[#3547D4] transition-colors truncate max-w-[150px]"
              >
                {formatBreadcrumbLabel(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
