import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { Phone, MessageCircle } from "lucide-react";
import { sendMessage } from "@/lib/chat";
import { toast } from "sonner";

export function CallSheet({
  open, onClose, threadId, peerName, peerType,
}: {
  open: boolean; onClose: () => void; threadId: string; peerName: string; peerType: "user" | "store";
}) {
  const callNow = () => {
    sendMessage(threadId, { type: "system", from: "system", systemKind: "call_attempt", text: `Call attempt to ${peerName}` });
    toast.success("Calling…", { description: "Using a masked demo number." });
    onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title={peerType === "store" ? `Call ${peerName}?` : "Call this seller?"}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onClose} className="h-11 rounded-2xl border border-border text-sm font-bold">Cancel</button>
          <button onClick={callNow} className="h-11 rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
            <Phone className="mr-1 inline h-4 w-4" /> Call
          </button>
        </div>
      }>
      <p className="text-xs text-muted-foreground">
        Mention that you found the listing on Omeetso. Never share OTPs or payment PINs.
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-secondary/60 p-3 text-xs">
        <Phone className="h-4 w-4 text-primary" /> +91 ••• ••• 4213 <span className="text-muted-foreground">(masked)</span>
      </div>
      {peerType === "store" && (
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-2 text-xs font-bold">
          <MessageCircle className="h-3.5 w-3.5" /> Continue on chat instead
        </button>
      )}
    </BottomSheet>
  );
}
