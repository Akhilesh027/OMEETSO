import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { ConfirmModal, SectionTitle } from "@/components/omeetso/account";
import { setAccountStatus } from "@/lib/account";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PowerOff } from "lucide-react";

export const Route = createFileRoute("/settings/deactivate")({
  head: () => ({ meta: [{ title: "Deactivate account — Omeetso" }] }),
  component: Deactivate,
});

const REASONS = ["Taking a break", "Not selling currently", "Too many notifications", "Privacy concerns", "App issue", "Other"];

function Deactivate() {
  const nav = useNavigate();
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24">
        <BackBar title="Deactivate account" />
        <div className="px-4 pt-2">
          <div className="rounded-2xl bg-card p-4 card-elev">
            <div className="flex items-center gap-2">
              <PowerOff className="h-5 w-5 text-amber-700" />
              <p className="text-sm font-bold">Deactivate account</p>
            </div>
            <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
              <li>Your profile will be hidden.</li>
              <li>Active listings will be paused.</li>
              <li>Your store will be hidden.</li>
              <li>Chats remain stored on this device.</li>
              <li>You can reactivate anytime by signing back in.</li>
            </ul>
          </div>

          <SectionTitle>Reason (optional)</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <button key={r} onClick={() => setReason(r)}
                className={cn("rounded-2xl border p-2 text-left text-xs font-semibold",
                  reason === r ? "border-primary bg-primary/5" : "border-border bg-card")}>
                {r}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => nav({ to: "/settings/account" })} className="rounded-full border border-border py-3 text-sm font-semibold">Keep Account Active</button>
            <button onClick={() => setConfirm(true)} className="rounded-full bg-amber-600 py-3 text-sm font-bold text-white">Deactivate</button>
          </div>
        </div>

        <ConfirmModal open={confirm} title="Deactivate account?" body="You can reactivate by signing in again."
          confirmLabel="Deactivate" cancelLabel="Cancel" danger
          onCancel={() => setConfirm(false)}
          onConfirm={() => { setAccountStatus("deactivated"); toast.success("Account deactivated"); nav({ to: "/logout" }); }} />
      </div>
    </MobileFrame>
  );
}
