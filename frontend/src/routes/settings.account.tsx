import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { SectionTitle, MenuGroup, MenuRow, ConfirmModal } from "@/components/omeetso/account";
import { getProfile, logoutMock } from "@/lib/account";
import { LogOut, Trash2, PowerOff, KeyRound, Smartphone, Mail, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/account")({
  head: () => ({ meta: [{ title: "Account management — Omeetso" }] }),
  component: AccountManage,
});

function AccountManage() {
  const nav = useNavigate();
  const p = getProfile();
  const [confirm, setConfirm] = useState(false);
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Account management" />
        <div className="px-4 pt-2 space-y-3">
          <SectionTitle>Account details</SectionTitle>
          <div className="rounded-2xl bg-card p-3 card-elev text-sm space-y-1">
            <Row label="Type" value={p.accountType === "business" ? "Business" : "Individual"} />
            <Row label="Mobile" value={p.mobile} />
            <Row label="Email" value={p.email ?? "—"} />
            <Row label="Login methods" value="Mobile OTP" />
          </div>

          <SectionTitle>Active sessions (preview)</SectionTitle>
          <div className="rounded-2xl bg-card p-3 card-elev text-sm">
            <p className="font-bold">This device</p>
            <p className="text-[11px] text-muted-foreground">Preview session · signed in now</p>
            <button onClick={() => toast.info("Logout of all devices is a placeholder in this preview.")}
              className="mt-2 w-full rounded-full border border-border py-2 text-xs font-semibold">Log out all devices</button>
          </div>

          <SectionTitle>Change account type</SectionTitle>
          <MenuGroup>
            <MenuRow icon={User} label="Switch account type" to="/account/edit" />
          </MenuGroup>

          <SectionTitle>Danger zone</SectionTitle>
          <MenuGroup>
            <MenuRow icon={PowerOff} label="Deactivate account" to="/settings/deactivate" />
            <MenuRow icon={Trash2} label="Delete account" to="/settings/delete" />
          </MenuGroup>

          <button onClick={() => setConfirm(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-rose-700">
            <LogOut className="h-4 w-4" /> Log out
          </button>

          <ConfirmModal open={confirm} title="Log out of Omeetso?" body="You can sign in again anytime."
            confirmLabel="Log Out" cancelLabel="Stay Logged In" danger
            onCancel={() => setConfirm(false)}
            onConfirm={() => { logoutMock(); toast.success("Logged out"); nav({ to: "/login" }); }} />
        </div>
      </div>
    </MobileFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-border py-1 last:border-b-0"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xs font-bold">{value}</p></div>;
}
