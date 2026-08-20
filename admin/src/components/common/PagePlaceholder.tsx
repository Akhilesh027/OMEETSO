import { Link, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function PagePlaceholder({ title, description, backTo = "/admin/dashboard" }: { title: string; description?: string; backTo?: string }) {
  const params = useParams();
  return (
    <div>
      <div className="rounded-xl border border-admin-border bg-white p-6 shadow-panel">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-admin-indigo">
          <Sparkles className="h-3.5 w-3.5" /> Scaffold
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-admin-navy">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-admin-muted">{description}</p>}
        {Object.keys(params).length > 0 && (
          <pre className="mt-4 rounded-lg bg-admin-bg p-3 text-xs text-admin-text">{JSON.stringify(params, null, 2)}</pre>
        )}
        <Link to={backTo} className="mt-6 inline-flex text-sm font-semibold text-admin-indigo hover:underline">← Back</Link>
      </div>
    </div>
  );
}
