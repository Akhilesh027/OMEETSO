import { ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SafetyCard() {
  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-950/20 p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-blue-700 dark:text-blue-400" />
        <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Stay safe on Omeetso</p>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-blue-900/80 dark:text-blue-200/80">
        <li>· Inspect the product before payment</li>
        <li>· Meet in a safe public place</li>
        <li>· Avoid advance payments</li>
        <li>· Report suspicious listings</li>
      </ul>
      <Link to="/account" className="mt-2 inline-block text-xs font-bold text-blue-800 dark:text-blue-300 underline underline-offset-2 hover:text-blue-600">
        Safety Centre
      </Link>
    </div>
  );
}
