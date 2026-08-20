import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getProfile, getVerifications } from "@/lib/account";
import { Star, ShieldCheck, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/account/public")({
  head: () => ({ meta: [{ title: "Public profile preview — Omeetso" }] }),
  component: PublicPreview,
});

function PublicPreview() {
  const p = getProfile();
  const v = getVerifications();
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Public profile preview" />
        <div className="mx-4 mt-2 rounded-2xl bg-yellow-brand/10 border border-yellow-brand/40 p-3 text-xs">
          This is how other buyers and sellers see your profile.
        </div>
        <div className="mx-4 mt-3 rounded-2xl bg-card p-4 card-elev text-center">
          <img src={p.avatar} alt={p.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
          <p className="mt-2 text-base font-extrabold">{p.name}</p>
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {v.mobile.status === "verified" && <Badge>Mobile verified</Badge>}
            {v.email.status === "verified" && <Badge>Email verified</Badge>}
            {v.identity.status === "verified" && <Badge icon>ID verified</Badge>}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>New Seller · No Reviews Yet</span>
          </div>
          <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {p.area}, {p.city}
          </p>
          <p className="text-[11px] text-muted-foreground">Member since {new Date(p.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <MessageCircle className="h-3 w-3" /> {p.responseTime}
          </p>
        </div>

        <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
          <Stat label="Active listings" value="4" />
          <Stat label="Sold listings" value="8" />
        </div>

        {p.bio && (
          <div className="mx-4 mt-3 rounded-2xl bg-card p-3 card-elev">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">About</p>
            <p className="mt-1 text-sm">{p.bio}</p>
          </div>
        )}

        <div className="mx-4 mt-3 rounded-2xl bg-secondary/50 p-3 text-[11px] text-muted-foreground">
          The following are never shown publicly: full mobile number, email, exact address, identity documents, wallet information and private settings.
        </div>
      </div>
    </MobileFrame>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
      {icon && <ShieldCheck className="h-3 w-3" />} {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center card-elev">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
