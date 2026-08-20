import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { EmptyBlock } from "@/components/omeetso/account";
import { addMeetPlace, deleteMeetPlace, listMeetPlaces } from "@/lib/account";
import { toast } from "sonner";
import { AlertTriangle, Info, ShieldAlert, MapPin, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/safety/$topic")({
  head: () => ({ meta: [{ title: "Safety topic — Omeetso" }] }),
  component: SafetyTopic,
});

const CONTENT: Record<string, { title: string; tips: string[]; extra?: { title: string; tips: string[] }[]; }> = {
  buying: {
    title: "Buying safely",
    tips: [
      "Inspect the product before paying",
      "Verify the seller’s profile and past reviews",
      "Avoid advance payments to unknown sellers",
      "Meet in a public place",
      "Test electronics before completing payment",
      "Verify ownership documents for high-value items",
      "Be cautious when prices seem unrealistically low",
      "Keep all communication inside Omeetso chat",
    ],
    extra: [
      { title: "For vehicles", tips: ["Verify registration", "Check insurance status", "Inspect service records", "Do not pay before verifying documents"] },
      { title: "For properties", tips: ["Verify ownership documents", "Visit the property in person", "Do not pay before an agreement review"] },
    ],
  },
  selling: {
    title: "Selling safely",
    tips: [
      "Meet buyers in public places",
      "Protect personal information (address, ID, banking)",
      "Never share OTPs",
      "Confirm payment in your own bank or payment app before handing over the product",
      "Beware of fake payment screenshots",
      "Use approximate location, not full address",
      "Report abusive or suspicious buyers",
      "Keep proof of conversation inside Omeetso",
    ],
  },
  store: {
    title: "Store safety",
    tips: [
      "Keep store contact information updated",
      "Avoid misleading claims in your listings",
      "Use genuine product images you own",
      "Respond to buyers only through your official store profile",
      "Protect employee account access",
      "Report impersonation of your store",
      "Verify large enquiries carefully",
    ],
  },
  payment: {
    title: "Payment safety",
    tips: [
      "Verify each payment in your own bank or payment app",
      "Do not trust payment screenshots as proof",
      "Never enter a UPI PIN to receive money — receiving money doesn’t require a PIN",
      "Avoid unknown payment links",
      "Never share card or banking credentials",
      "Report suspicious payment requests",
    ],
  },
  fraud: {
    title: "Fraud prevention",
    tips: [],
  },
  meeting: {
    title: "Safe meeting guidance",
    tips: [
      "Choose public locations",
      "Meet during daylight",
      "Bring another person if possible",
      "Do not share your home address unnecessarily",
      "Inform someone you trust about the meeting",
      "Inspect the product before handing over money",
      "Avoid carrying excessive cash",
    ],
  },
};

const FRAUD_CARDS = [
  { type: "Fake UPI payment screenshots", signs: "Buyer sends a screenshot instead of transferring money.", action: "Confirm the amount in your bank app before handover." },
  { type: "OTP scams", signs: "Someone asks for the OTP sent to your number.", action: "Never share OTPs. Omeetso never asks for OTPs." },
  { type: "Courier scams", signs: "Buyer insists on a special courier and asks for advance payment.", action: "Prefer in-person meetings for local sales." },
  { type: "Advance-payment scams", signs: "Seller asks for full advance to a personal account.", action: "Meet in person and pay only after inspection." },
  { type: "Fake customer-care numbers", signs: "Search results pointing to unofficial phone numbers.", action: "Only use in-app support to reach Omeetso." },
  { type: "Remote-access application scams", signs: "You’re asked to install a screen-sharing app.", action: "Never install remote-access apps at anyone’s request." },
  { type: "Suspicious links", signs: "Short links that request payment or logins.", action: "Do not open unknown links. Stay inside Omeetso." },
  { type: "Account takeover attempts", signs: "Suspicious login alerts or password reset requests.", action: "Change passwords, enable OTP and report to support." },
];

function SafetyTopic() {
  const { topic } = useParams({ from: "/safety/$topic" });
  const data = CONTENT[topic];
  if (!data) return (
    <MobileFrame><div className="p-6 pt-16 text-center"><p className="text-sm text-muted-foreground">Topic not found.</p><Link to="/safety" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link></div></MobileFrame>
  );

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title={data.title} />
        <div className="px-4 pt-2 space-y-3">
          {topic === "payment" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="flex items-center gap-1 font-bold"><Info className="h-3.5 w-3.5" /> Omeetso does not collect or hold product payments between buyers and sellers.</p>
            </div>
          )}
          {topic !== "fraud" && (
            <ol className="space-y-1 rounded-2xl bg-card p-3 card-elev">
              {data.tips.map((t) => (
                <li key={t} className="flex items-start gap-2 border-b border-border py-2 last:border-b-0">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <p className="text-sm">{t}</p>
                </li>
              ))}
            </ol>
          )}
          {topic === "buying" && data.extra?.map((e) => (
            <div key={e.title} className="rounded-2xl bg-card p-3 card-elev">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{e.title}</p>
              <ol className="mt-1 space-y-1">
                {e.tips.map((t) => <li key={t} className="flex items-start gap-2 py-1"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><p className="text-sm">{t}</p></li>)}
              </ol>
            </div>
          ))}

          {topic === "fraud" && (
            <div className="space-y-2">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <ShieldAlert className="mb-1 h-3.5 w-3.5" /> If something feels off, stop the transaction and report it.
              </div>
              {FRAUD_CARDS.map((c) => (
                <div key={c.type} className="rounded-2xl bg-card p-3 card-elev">
                  <p className="flex items-center gap-1 text-sm font-bold"><AlertTriangle className="h-4 w-4 text-amber-700" /> {c.type}</p>
                  <p className="mt-1 text-xs"><b>Warning signs:</b> {c.signs}</p>
                  <p className="mt-1 text-xs"><b>What to do:</b> {c.action}</p>
                  <Link to="/safety/report" className="mt-2 inline-block rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Report this</Link>
                </div>
              ))}
            </div>
          )}

          {topic === "meeting" && <MeetPlaces />}
        </div>
      </div>
    </MobileFrame>
  );
}

function MeetPlaces() {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");
  const list = listMeetPlaces();

  return (
    <div>
      <p className="mb-1.5 mt-2 text-[11px] font-bold uppercase text-muted-foreground">Saved public meeting places</p>
      {list.length === 0 ? (
        <EmptyBlock icon={MapPin} title="No saved places" body="Add a well-lit public location for meetings." />
      ) : (
        <div className="space-y-2">
          {list.map((m) => (
            <div key={m.id} className="flex items-start gap-3 rounded-2xl bg-card p-3 card-elev">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><MapPin className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{m.name}</p>
                <p className="text-[11px] text-muted-foreground">{m.area}</p>
                {m.note && <p className="text-[11px] text-muted-foreground">{m.note}</p>}
              </div>
              <button aria-label="Remove" onClick={() => { deleteMeetPlace(m.id); toast.success("Removed"); }}
                className="grid h-8 w-8 place-items-center rounded-full text-rose-700 hover:bg-rose-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 rounded-2xl bg-card p-3 card-elev space-y-2 text-sm">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Place name (e.g. GVK One Mall)" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
        <button onClick={() => { if (!name || !area) { toast.error("Add name and area"); return; } addMeetPlace({ name, area, note: note || undefined }); setName(""); setArea(""); setNote(""); toast.success("Saved"); }}
          className="w-full rounded-full bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="mr-1 inline h-4 w-4" /> Add place
        </button>
      </div>
    </div>
  );
}
