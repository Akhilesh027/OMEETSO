import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  PowerOff,
  Trash2,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  X
} from "lucide-react";
import { deactivateUserAccountApi, deleteUserAccountApi } from "@/api/auth.api";
import { setAccountStatus, logout } from "@/lib/account";
import { toast } from "sonner";

export const PERMANENT_LEAVE_REASONS = [
  "I no longer need this platform.",
  "I am facing technical issues.",
  "I am not getting enough responses or customers.",
  "I am concerned about privacy or security.",
  "I am switching to another platform.",
  "I am facing difficulties using the platform.",
  "I created the account by mistake.",
  "Other"
];

interface PermanentLogoutModalProps {
  open: boolean;
  onClose: () => void;
  defaultAction?: "DEACTIVATE" | "DELETE";
}

export function PermanentLogoutModal({ open, onClose, defaultAction = "DEACTIVATE" }: PermanentLogoutModalProps) {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [actionType, setActionType] = useState<"DEACTIVATE" | "DELETE">(defaultAction);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReasonText, setOtherReasonText] = useState<string>("");
  const [dataSafetyAck, setDataSafetyAck] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!open) return null;

  const handleNextToConfirmation = () => {
    if (!selectedReason) {
      toast.error("Please select a reason for leaving.");
      return;
    }
    if (selectedReason === "Other" && !otherReasonText.trim()) {
      toast.error("Please specify your reason in the text box.");
      return;
    }
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    if (!dataSafetyAck) {
      toast.error("Please acknowledge the data safety advisory.");
      return;
    }

    setIsSubmitting(true);
    const finalReason = selectedReason === "Other" ? `Other: ${otherReasonText.trim()}` : selectedReason;

    try {
      if (actionType === "DELETE") {
        const res = await deleteUserAccountApi({
          reason: finalReason,
          customFeedback: otherReasonText.trim()
        });

        if (!res.success) {
          toast.error(res.error || "Failed to delete account. Please try again.");
          setIsSubmitting(false);
          return;
        }

        setAccountStatus("deleted" as any);
        toast.success("Account permanently deactivated and closed.");
      } else {
        const res = await deactivateUserAccountApi({
          reason: finalReason,
          customFeedback: otherReasonText.trim()
        });

        if (!res.success) {
          toast.error(res.error || "Failed to deactivate account. Please try again.");
          setIsSubmitting(false);
          return;
        }

        setAccountStatus("deactivated");
        toast.success("Your account has been deactivated successfully.");
      }

      await logout();
      onClose();
      nav({ to: "/login" });
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close modal"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
            {actionType === "DELETE" ? <Trash2 className="h-4 w-4 text-rose-600" /> : <PowerOff className="h-4 w-4 text-amber-600" />}
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              {actionType === "DELETE" ? "Permanent Deletion" : "Account Deactivation"}
            </span>
            <span className="block text-xs font-bold text-foreground">
              Step {step} of 2 · {step === 1 ? "Reason Survey" : "Data Safety & Confirmation"}
            </span>
          </div>
        </div>

        {/* STEP 1: Reason Survey */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-foreground tracking-tight">
                Why are you leaving Omeetso permanently?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your feedback helps our team improve. Please tell us why you are choosing to leave or deactivate.
              </p>
            </div>

            {/* Action Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-secondary/50 border border-border">
              <button
                type="button"
                onClick={() => setActionType("DEACTIVATE")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  actionType === "DEACTIVATE"
                    ? "bg-card text-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Deactivate (Reactivable)
              </button>
              <button
                type="button"
                onClick={() => setActionType("DELETE")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  actionType === "DELETE"
                    ? "bg-rose-600 text-white shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-rose-600"
                }`}
              >
                Permanent Deletion
              </button>
            </div>

            {/* Reason Selection Radio List */}
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {PERMANENT_LEAVE_REASONS.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                        : "border-border/80 bg-background hover:bg-secondary/40 text-foreground"
                    }`}
                  >
                    <span>{r}</span>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Conditional Other Textarea */}
            {selectedReason === "Other" && (
              <div className="animate-in fade-in duration-150">
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Please specify your reason:
                </label>
                <textarea
                  rows={2}
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="Share any additional details or feedback..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition resize-none"
                />
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextToConfirmation}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-sm hover:bg-primary/90 transition active:scale-95 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Data Safety & Final Confirmation */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-foreground tracking-tight">
                {actionType === "DELETE" ? "Permanent Deletion Advisory" : "Account Deactivation Advisory"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Please review what happens to your data before finalizing your departure.
              </p>
            </div>

            {/* Data Safety Breakdown Card */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Data Safety & Account Protection</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-muted-foreground space-y-1 leading-snug">
                <li>
                  <strong className="text-foreground">Listings & Catalog:</strong> All your active marketplace listings and business items will be immediately paused and removed from search.
                </li>
                <li>
                  <strong className="text-foreground">Messages & Chats:</strong> Private conversation threads will no longer accept new incoming messages.
                </li>
                <li>
                  <strong className="text-foreground">Personal Details:</strong> Your mobile number and profile details will be shielded from public view.
                </li>
                <li>
                  <strong className="text-foreground">Session Termination:</strong> All current sessions across desktop and mobile devices will be immediately revoked.
                </li>
              </ul>
            </div>

            {/* Mandatory Acknowledgment Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-background cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dataSafetyAck}
                onChange={(e) => setDataSafetyAck(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-[11px] text-foreground leading-snug font-medium">
                I understand this will {actionType === "DELETE" ? "permanently close" : "deactivate"} my Omeetso account and remove my listings from public searches.
              </span>
            </label>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer"
                >
                  Stay on Omeetso
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                    actionType === "DELETE" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{actionType === "DELETE" ? "Permanently Delete Account" : "Deactivate My Account"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PermanentLogoutModal;
