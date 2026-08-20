import { ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SafetyCard() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <p className="text-sm font-bold text-emerald-800">Stay safe on Omeetso</p>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-emerald-900/80">
        <li>· Inspect the product before payment</li>
        <li>· Meet in a safe public place</li>
        <li>· Avoid advance payments</li>
        <li>· Report suspicious listings</li>
      </ul>
      <Link to="/account" className="mt-2 inline-block text-xs font-bold text-emerald-800 underline underline-offset-2">
        Safety Centre
      </Link>
    </div>
  );
}
