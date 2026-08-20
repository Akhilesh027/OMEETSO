import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title: string;
  targetSummary: string;
  consequenceWarning: string;
  confirmText?: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  requiredConfirmationPhrase?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  targetSummary,
  consequenceWarning,
  confirmText = "Confirm Action",
  isDestructive = true,
  requireReason = false,
  requiredConfirmationPhrase,
}) => {
  const [reason, setReason] = useState("");
  const [typedPhrase, setTypedPhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isPhraseValid = requiredConfirmationPhrase
    ? typedPhrase.trim() === requiredConfirmationPhrase.trim()
    : true;

  const isReasonValid = requireReason ? reason.trim().length >= 5 : true;

  const canSubmit = isPhraseValid && isReasonValid && !isLoading;

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(reason);
      setReason("");
      setTypedPhrase("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-2.5 text-[#111827]">
            <div
              className={`p-2 rounded-xl ${
                isDestructive ? "bg-red-50 text-[#DC3545]" : "bg-amber-50 text-[#F59E0B]"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="modal-title" className="text-base font-bold">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-[#64748B] hover:text-[#111827] rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-[#F5F7FC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <p className="font-semibold text-[#111827]">{targetSummary}</p>
            <p className="text-[#DC3545] mt-1 font-medium">{consequenceWarning}</p>
          </div>

          {requireReason && (
            <div>
              <label className="block font-semibold text-[#111827] mb-1">
                Reason for action <span className="text-[#DC3545]">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter mandatory reason for audit logging..."
                rows={3}
                required
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none"
              />
            </div>
          )}

          {requiredConfirmationPhrase && (
            <div>
              <label className="block font-semibold text-[#111827] mb-1">
                Type <span className="font-mono text-[#DC3545]">{requiredConfirmationPhrase}</span> to confirm:
              </label>
              <input
                type="text"
                value={typedPhrase}
                onChange={(e) => setTypedPhrase(e.target.value)}
                placeholder={requiredConfirmationPhrase}
                required
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none"
              />
            </div>
          )}

          {error && <p className="text-xs text-[#DC3545] font-medium">{error}</p>}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl font-semibold border border-[#E2E8F0] text-[#111827] hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold text-white transition-colors shadow-sm disabled:opacity-50 ${
                isDestructive ? "bg-[#DC3545] hover:bg-red-700" : "bg-[#3547D4] hover:bg-[#111E4D]"
              }`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoading ? "Processing..." : confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
