import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { SectionTitle } from "@/components/omeetso/account";
import { setAccountStatus, logout } from "@/lib/account";
import { deactivateUserAccountApi } from "@/api/auth.api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PowerOff, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/settings/deactivate")({
  head: () => ({ meta: [{ title: "Deactivate account — Omeetso" }] }),
  component: Deactivate,
});

export const DEACTIVATE_REASONS = [
  "I no longer need this platform.",
  "I am facing technical issues.",
  "I am not getting enough responses or customers.",
  "I am concerned about privacy or security.",
  "I am switching to another platform.",
  "I am facing difficulties using the platform.",
  "I created the account by mistake.",
  "Other"
];

function Deactivate() {
  const nav = useNavigate();
  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [dataSafetyAck, setDataSafetyAck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeactivate = async () => {
    if (!reason) {
      toast.error("Please select a reason for leaving.");
      return;
    }
    if (reason === "Other" && !otherText.trim()) {
      toast.error("Please specify your reason in the text box.");
      return;
    }
    if (!dataSafetyAck) {
      toast.error("Please acknowledge the data safety advisory.");
      return;
    }

    setIsSubmitting(true);
    const finalReason = reason === "Other" ? `Other: ${otherText.trim()}` : reason;

    try {
      const res = await deactivateUserAccountApi({
        reason: finalReason,
        customFeedback: otherText.trim()
      });

      if (!res.success) {
        toast.error(res.error || "Failed to deactivate account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setAccountStatus("deactivated");
      toast.success("Account deactivated. You can sign in anytime to reactivate.");
      await logout();
      nav({ to: "/login" });
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24 font-sans">
        <BackBar title="Deactivate account" onBack={() => nav({ to: "/settings/account" })} />
        <div className="px-4 pt-2 space-y-4">
          {/* Header Card */}
          <div className="rounded-3xl bg-card p-4 card-elev border border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                <PowerOff className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-foreground">Temporary Account Deactivation</p>
                <p className="text-[11px] text-muted-foreground">Pause your activity and hide your public footprint</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-secondary/50 p-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                <span>What happens when you deactivate:</span>
              </p>
              <ul className="list-disc pl-4 text-[11px] space-y-1 leading-relaxed">
                <li>Your profile and contact details will be hidden from other users.</li>
                <li>All active listings will be safely paused and hidden from search.</li>
                <li>Your storefront will be temporarily unpublished.</li>
                <li>Existing chats remain archived and private.</li>
                <li>You can reactivate your account at any time by signing back in.</li>
              </ul>
            </div>
          </div>

          {/* Survey Question */}
          <div className="space-y-2">
            <SectionTitle>Why are you leaving Omeetso permanently?</SectionTitle>
            <div className="space-y-1.5">
              {DEACTIVATE_REASONS.map((r) => {
                const isSelected = reason === r;
                return (
                  <button
                    key={r}
                    type="button"
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
              <div className="pt-2 animate-in fade-in duration-150">
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
          </div>

          {/* Acknowledgment */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-border bg-card cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dataSafetyAck}
              onChange={(e) => setDataSafetyAck(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-[11px] text-muted-foreground leading-snug font-medium">
              I understand that deactivating will immediately pause my listings and log me out across all devices.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => nav({ to: "/settings/account" })}
              disabled={isSubmitting}
              className="rounded-2xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              Keep Account Active
            </button>
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-amber-600 hover:bg-amber-700 py-3 text-xs font-black text-white shadow-md transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <PowerOff className="h-3.5 w-3.5" />
                  <span>Confirm Deactivation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
export default Deactivate;
