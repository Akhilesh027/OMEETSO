import { ShieldCheck, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ChatSafetyNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mx-3 mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-start gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-emerald-900">Stay safe when buying or selling</p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-emerald-800">
            <li>Meet in a public place.</li>
            <li>Inspect the product before paying.</li>
            <li>Never share OTPs or payment PINs.</li>
            <li>Avoid advance payments to unknown users.</li>
          </ul>
          <Link to="/chat/safety" className="mt-2 inline-block text-[11px] font-bold text-emerald-800 underline">
            View safety tips
          </Link>
        </div>
        <button aria-label="Dismiss" onClick={onDismiss} className="grid h-7 w-7 place-items-center rounded-full text-emerald-800 hover:bg-emerald-100">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
