import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { ConfirmModal } from "@/components/omeetso/account";
import { setAccountStatus } from "@/lib/account";
import { deleteUserAccountApi } from "@/api/auth.api";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/delete")({
  head: () => ({ meta: [{ title: "Delete account — Omeetso" }] }),
  component: DeleteAccount,
});

const REASONS = [
  "Privacy concerns", "Not using Omeetso", "Received too many notifications",
  "Poor experience", "Duplicate account", "Other",
];

function DeleteAccount() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);
  const [typed, setTyped] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteUserAccountApi();
      if (!res.success) {
        toast.error(res.error || "Failed to delete account. Please try again.");
        setIsDeleting(false);
        setConfirm(false);
        return;
      }

      setAccountStatus("deleted" as any);
      toast.success("Your account has been deleted permanently.");
      nav({ to: "/logout" });
    } catch {
      toast.error("An unexpected error occurred while deleting your account.");
      setIsDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24">
        <BackBar title="Delete account" />
        <div className="px-4 pt-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-rose-700">
            <AlertTriangle className="h-4 w-4" /> This action cannot be undone
          </div>

          {step === 1 && (
            <>
              <div className="mt-3 rounded-2xl bg-card p-4 card-elev">
                <p className="text-sm font-bold">What happens when you delete</p>
                <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
                  <li>Profile removed from Omeetso</li>
                  <li>Listings removed and de-listed</li>
                  <li>Stores deactivated</li>
                  <li>All active desktop and mobile sessions revoked</li>
                  <li>Reviews may remain anonymised</li>
                  <li>Some records may be retained for safety and legal compliance</li>
                </ul>
              </div>
              <button onClick={() => setStep(2)} className="mt-4 w-full rounded-full bg-rose-600 py-3 text-sm font-bold text-white">Continue</button>
              <button onClick={() => history.back()} className="mt-2 w-full rounded-full border border-border py-3 text-sm font-semibold">Cancel</button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="mt-3 text-[11px] font-bold uppercase text-muted-foreground">Reason for leaving</p>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button key={r} onClick={() => setReason(r)}
                    className={cn("rounded-2xl border p-2 text-left text-xs font-semibold",
                      reason === r ? "border-primary bg-primary/5" : "border-border bg-card")}>{r}</button>
                ))}
              </div>
              <label className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-card p-3 text-xs">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                <span>I understand this action cannot be undone.</span>
              </label>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setStep(1)} className="rounded-full border border-border px-4 py-3 text-sm font-semibold">Back</button>
                <button onClick={() => { if (!reason) { toast.error("Please choose a reason"); return; } if (!ack) { toast.error("Please confirm acknowledgement"); return; } setStep(3); }}
                  className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-bold text-white">Continue</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="mt-3 text-sm">To confirm deletion, type <b>DELETE</b> below.</p>
              <input value={typed} onChange={(e) => setTyped(e.target.value)}
                placeholder="DELETE"
                className="mt-2 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <div className="mt-3 flex gap-2">
                <button onClick={() => setStep(2)} className="rounded-full border border-border px-4 py-3 text-sm font-semibold">Back</button>
                <button onClick={() => { if (typed !== "DELETE") { toast.error("Please type DELETE exactly"); return; } setConfirm(true); }}
                  className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-bold text-white">Delete Account</button>
              </div>
            </>
          )}
        </div>

        <ConfirmModal open={confirm} title="Delete account permanently?" body="This action cannot be undone. All your listings, profile data, and sessions will be permanently deactivated."
          confirmLabel={isDeleting ? "Deleting..." : "Yes, delete"} cancelLabel="Cancel" danger
          onCancel={() => { if (!isDeleting) setConfirm(false); }}
          onConfirm={handleDeleteConfirm} />
      </div>
    </MobileFrame>
  );
}

