import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-admin-bg p-6">
      <div className="max-w-md rounded-2xl border border-admin-border bg-white p-8 text-center shadow-panel">
        <ShieldAlert className="mx-auto h-10 w-10 text-admin-warning" />
        <h1 className="mt-3 text-xl font-extrabold text-admin-navy">Access denied</h1>
        <p className="mt-1 text-sm text-admin-muted">Your role does not have permission to view this area.</p>
        <Link to="/admin/dashboard" className="mt-5 inline-flex rounded-lg bg-admin-indigo px-4 py-2 text-sm font-semibold text-white">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
