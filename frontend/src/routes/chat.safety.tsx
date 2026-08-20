import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/chat/safety")({
  head: () => ({ meta: [
    { title: "Chat safety — Omeetso" },
    { name: "description", content: "Safety guidance for buyers and sellers on Omeetso." },
  ]}),
  component: SafetyPage,
});

const TIPS: { title: string; body: string }[] = [
  { title: "Never share OTPs", body: "Omeetso and legitimate buyers or sellers will never ask you for a one-time password." },
  { title: "Never share UPI PINs", body: "Your PIN is only used to send money. Sellers do not need it to receive payment." },
  { title: "Avoid advance payments", body: "Do not pay before you inspect the product. Pay only when you are satisfied." },
  { title: "Meet in public locations", body: "Choose well-lit, busy places like metro stations, malls or public cafés." },
  { title: "Inspect products before payment", body: "Test the item, check accessories, and verify condition before you hand over money." },
  { title: "Verify store information", body: "Look for verification badges and check reviews before purchasing from stores." },
  { title: "Report suspicious links", body: "Never open payment links sent inside chat. Legitimate transactions do not need external links." },
  { title: "Stay on Omeetso", body: "Avoid moving conversations to unknown platforms too early. It's a common scam pattern." },
];

function SafetyPage() {
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Chat safety" />

        <div className="mx-3 mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-emerald-900">Stay safe on Omeetso</p>
              <p className="text-[11px] text-emerald-800">A few simple steps protect every transaction.</p>
            </div>
          </div>
        </div>

        <div className="mx-3 mt-3 space-y-2">
          {TIPS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-3">
              <p className="text-sm font-bold">{t.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>

        <div className="mx-3 mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <p className="text-sm font-bold text-amber-900">See something suspicious?</p>
          </div>
          <p className="mt-1 text-xs text-amber-800">Report the user or message from inside the conversation. Our safety team reviews every ticket.</p>
          <Link to="/chats" className="mt-3 inline-block rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white">
            Create safety report
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
