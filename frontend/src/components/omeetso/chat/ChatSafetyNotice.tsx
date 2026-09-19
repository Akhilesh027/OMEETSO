import { ShieldCheck, X, Briefcase, Wrench, Store, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ChatSafetyNotice({
  category = "product",
  onDismiss,
}: {
  category?: "job" | "service" | "store" | "product" | string;
  onDismiss: () => void;
}) {
  const norm = category.toLowerCase();

  if (norm === "job" || norm === "jobs") {
    return (
      <div className="mx-3 mt-3 rounded-2xl border border-blue-200 bg-blue-50/90 dark:bg-blue-950/40 dark:border-blue-800/60 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            <Briefcase className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-blue-950 dark:text-blue-100">Job & Career Safety Tips</p>
            <ul className="mt-1 space-y-1 text-[11px] text-blue-900/90 dark:text-blue-200/90 leading-tight">
              <li>• Never pay any registration fee or security deposit for interviews or job offers.</li>
              <li>• Verify company credentials before sharing identity or banking documents.</li>
              <li>• Conduct interviews in verified office locations or official video calls.</li>
              <li>• Beware of suspicious tasks requiring payment or downloading unknown apps.</li>
            </ul>
            <Link to="/chat/safety" className="mt-2 inline-block text-[11px] font-bold text-blue-800 dark:text-blue-300 underline">
              View job safety policy
            </Link>
          </div>
          <button aria-label="Dismiss" onClick={onDismiss} className="grid h-7 w-7 place-items-center rounded-full text-blue-800 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/50">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (norm === "service" || norm === "services") {
    return (
      <div className="mx-3 mt-3 rounded-2xl border border-indigo-200 bg-indigo-50/90 dark:bg-indigo-950/40 dark:border-indigo-800/60 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
            <Wrench className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-indigo-950 dark:text-indigo-100">Service Safety & Quality Tips</p>
            <ul className="mt-1 space-y-1 text-[11px] text-indigo-900/90 dark:text-indigo-200/90 leading-tight">
              <li>• Confirm scope of work, warranty, and estimated pricing before work begins.</li>
              <li>• Verify provider identity and rating reviews before scheduling home visits.</li>
              <li>• Pay after inspecting and approving the completed service.</li>
              <li>• Keep receipts and warranty commitments documented in chat.</li>
            </ul>
            <Link to="/chat/safety" className="mt-2 inline-block text-[11px] font-bold text-indigo-800 dark:text-indigo-300 underline">
              View service safety guidelines
            </Link>
          </div>
          <button aria-label="Dismiss" onClick={onDismiss} className="grid h-7 w-7 place-items-center rounded-full text-indigo-800 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/40 dark:border-emerald-800/60 p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">Stay safe when buying or selling</p>
          <ul className="mt-1 space-y-1 text-[11px] text-emerald-900/90 dark:text-emerald-200/90 leading-tight">
            <li>• Meet in a public place.</li>
            <li>• Inspect the product before paying.</li>
            <li>• Never share OTPs or payment PINs.</li>
            <li>• Avoid advance payments to unknown users.</li>
          </ul>
          <Link to="/chat/safety" className="mt-2 inline-block text-[11px] font-bold text-emerald-800 dark:text-emerald-300 underline">
            View safety tips
          </Link>
        </div>
        <button aria-label="Dismiss" onClick={onDismiss} className="grid h-7 w-7 place-items-center rounded-full text-emerald-800 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
