import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { ConfirmModal } from "@/components/omeetso/account";
import { setAccountStatus, logout } from "@/lib/account";
import { deleteUserAccountApi } from "@/api/auth.api";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/delete")({
  head: () => ({ meta: [{ title: "Delete account — Omeetso" }] }),
  component: DeleteAccount,
});

export const DELETE_REASONS = [
  "I no longer need this platform.",
  "I am facing technical issues.",
  "I am not getting enough responses or customers.",
  "I am concerned about privacy or security.",
  "I am switching to another platform.",
  "I am facing difficulties using the platform.",
  "I created the account by mistake.",
  "Other"
];

function DeleteAccount() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [ack, setAck] = useState(false);
  const [typed, setTyped] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const finalReason = reason === "Other" ? `Other: ${otherText.trim()}` : reason;

    try {
      const res = await deleteUserAccountApi({
        reason: finalReason,
        customFeedback: otherText.trim()
      });

      if (!res.success) {
        toast.error(res.error || "Failed to delete account. Please try again.");
        setIsDeleting(false);
        setConfirm(false);
        return;
      }

      setAccountStatus("deleted" as any);
      toast.success("Your account has been deleted permanently.");
      await logout();
      nav({ to: "/login" });
    } catch {
      toast.error("An unexpected error occurred while deleting your account.");
      setIsDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24 font-sans">
        <BackBar title="Delete account" onBack={() => nav({ to: "/settings/account" })} />
        <div className="px-4 pt-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-rose-700">
            <AlertTriangle className="h-4 w-4" /> This action cannot be undone
          </div>

          {step === 1 && (
            <>
              <div className="mt-3 rounded-2xl bg-card p-4 card-elev border border-border">
                <p className="text-sm font-bold text-foreground">What happens when you delete</p>
                <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
                  <li>Profile permanently removed from Omeetso.</li>
                  <li>Listings removed and de-listed from marketplace search.</li>
                  <li>Stores deactivated and unpublished.</li>
                  <li>All active desktop and mobile sessions revoked immediately.</li>
                  <li>Reviews may remain anonymized.</li>
                  <li>Some records may be retained for safety and legal compliance.</li>
                </ul>
              </div>
              <button onClick={() => setStep(2)} className="mt-4 w-full rounded-full bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition active:scale-98 cursor-pointer">
                Continue
              </button>
              <button onClick={() => history.back()} className="mt-2 w-full rounded-full border border-border py-3 text-sm font-semibold hover:bg-secondary transition active:scale-98 cursor-pointer">
                Cancel
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="mt-3 text-xs font-bold text-foreground">Why are you leaving Omeetso permanently?</p>
              <div className="mt-2 space-y-1.5">
                {DELETE_REASONS.map((r) => {
                  const isSelected = reason === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border/80 bg-card hover:bg-secondary/40 text-foreground"
                      )}
                    >
                      <span>{r}</span>
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                          isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
                        )}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {reason === "Other" && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    Please specify your reason:
                  </label>
                  <textarea
                    rows={2}
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Tell us what we can improve..."
                    className="w-full rounded-xl border border-border bg-card p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition resize-none"
                  />
                </div>
              )}

              <label className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-card p-3 text-xs cursor-pointer select-none">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5" />
                <span className="text-[11px] text-muted-foreground leading-snug">
                  I understand this action is permanent and cannot be undone.
                </span>
              </label>

              <div className="mt-3 flex gap-2">
                <button onClick={() => setStep(1)} className="rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-secondary transition active:scale-98 cursor-pointer">
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!reason) { toast.error("Please choose a reason"); return; }
                    if (reason === "Other" && !otherText.trim()) { toast.error("Please specify your reason"); return; }
                    if (!ack) { toast.error("Please confirm acknowledgement"); return; }
                    setStep(3);
                  }}
                  className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition active:scale-98 cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="mt-3 text-sm text-foreground">To confirm deletion, type <b>DELETE</b> below.</p>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="DELETE"
                className="mt-2 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <div className="mt-3 flex gap-2">
                <button onClick={() => setStep(2)} className="rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-secondary transition active:scale-98 cursor-pointer">
                  Back
                </button>
                <button
                  onClick={() => {
                    if (typed.trim() !== "DELETE") {
                      toast.error("Please type DELETE exactly");
                      return;
                    }
                    setConfirm(true);
                  }}
                  className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition active:scale-98 cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>

        <ConfirmModal
          open={confirm}
          title="Delete account permanently?"
          body="This action cannot be undone. All your listings, profile data, and sessions will be permanently deactivated."
          confirmLabel={isDeleting ? "Deleting..." : "Yes, delete"}
          cancelLabel="Cancel"
          danger
          onCancel={() => { if (!isDeleting) setConfirm(false); }}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </MobileFrame>
  );
}
export default DeleteAccount;
