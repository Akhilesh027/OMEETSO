import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { Camera, Image as ImageIcon, MapPin, Mic, Package } from "lucide-react";
import { sendMessage } from "@/lib/chat";
import { PRODUCTS } from "@/lib/mock";
import { useState } from "react";
import { toast } from "sonner";

const AREAS = [
  { name: "Madhapur Metro Station", area: "Madhapur, near ticket counter" },
  { name: "Inorbit Mall Entrance", area: "Cyberabad, main gate" },
  { name: "Ameerpet Metro Station", area: "Ameerpet, exit B" },
  { name: "Public café near Kondapur", area: "Kondapur, main road" },
  { name: "Forum Sujana Mall", area: "Kukatpally, food court" },
];

const IMAGE_SAMPLES = PRODUCTS.slice(0, 6).map((p) => p.image);

export function AttachmentSheet({
  open, onClose, threadId, sellerListings,
}: {
  open: boolean; onClose: () => void; threadId: string; sellerListings?: string[];
}) {
  const [view, setView] = useState<"menu" | "gallery" | "location" | "voice" | "product">("menu");
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [recording, setRecording] = useState(false);
  const [dur, setDur] = useState(0);

  const close = () => { setView("menu"); setSelectedImg(null); setCaption(""); setRecording(false); setDur(0); onClose(); };

  const sendImage = () => {
    if (!selectedImg) return;
    sendMessage(threadId, { type: "image", from: "me", imageUrl: selectedImg, caption: caption.trim() || undefined });
    toast.success("Photo shared");
    close();
  };

  const shareLocation = (l: { name: string; area: string }) => {
    sendMessage(threadId, { type: "location", from: "me", location: l });
    toast.success("Meeting point shared");
    close();
  };

  const sendVoice = () => {
    if (dur < 1) { toast.error("Recording too short"); return; }
    sendMessage(threadId, { type: "voice", from: "me", voice: { durationSec: dur } });
    toast.success("Voice note sent");
    close();
  };

  const shareProduct = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    sendMessage(threadId, { type: "image", from: "me", imageUrl: p.image, caption: `${p.title} — ₹${p.price.toLocaleString("en-IN")}` });
    toast.success("Listing shared");
    close();
  };

  return (
    <BottomSheet open={open} onClose={close} title={
      view === "menu" ? "Share" :
      view === "gallery" ? "Choose photo" :
      view === "location" ? "Share meeting point" :
      view === "voice" ? "Voice note" : "Your listings"
    }>
      {view === "menu" && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          <Opt icon={Camera} label="Camera" onClick={() => setView("gallery")} />
          <Opt icon={ImageIcon} label="Gallery" onClick={() => setView("gallery")} />
          <Opt icon={MapPin} label="Location" onClick={() => setView("location")} />
          <Opt icon={Mic} label="Voice Note" onClick={() => setView("voice")} />
          {sellerListings && sellerListings.length > 0 && (
            <Opt icon={Package} label="My Listing" onClick={() => setView("product")} />
          )}
        </div>
      )}

      {view === "gallery" && (
        <div>
          <div className="grid grid-cols-3 gap-2">
            {IMAGE_SAMPLES.map((src) => (
              <button
                key={src}
                onClick={() => setSelectedImg(src)}
                aria-label="Select photo"
                className={`overflow-hidden rounded-xl border-2 ${selectedImg === src ? "border-primary" : "border-transparent"}`}
              >
                <img src={src} alt="" className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
          {selectedImg && (
            <>
              <img src={selectedImg} alt="Preview" className="mt-3 max-h-48 w-full rounded-2xl object-cover" />
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 200))}
                placeholder="Add a caption (optional)"
                aria-label="Photo caption"
                className="mt-2 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <p className="mt-2 rounded-xl bg-amber-50 p-2 text-[11px] text-amber-900">
                Avoid sharing identity documents, payment details or private information.
              </p>
              <button onClick={sendImage} className="mt-3 flex h-11 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
                Send photo
              </button>
            </>
          )}
        </div>
      )}

      {view === "location" && (
        <div>
          <p className="text-[11px] text-muted-foreground">
            Share a public meeting point instead of your home address.
          </p>
          <div className="mt-3 space-y-2">
            {AREAS.map((l) => (
              <button
                key={l.name}
                onClick={() => shareLocation(l)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary"><MapPin className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{l.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{l.area}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "voice" && (
        <VoiceRecorder
          recording={recording} dur={dur}
          onStart={() => { setRecording(true); const start = Date.now();
            const iv = window.setInterval(() => {
              const t = (Date.now() - start) / 1000;
              if (t >= 120) { setRecording(false); clearInterval(iv); setDur(120); }
              else setDur(t);
            }, 100);
            (window as unknown as { __omeetsoRecIv?: number }).__omeetsoRecIv = iv;
          }}
          onStop={() => { setRecording(false); const iv = (window as unknown as { __omeetsoRecIv?: number }).__omeetsoRecIv; if (iv) clearInterval(iv); }}
          onCancel={() => { setRecording(false); setDur(0); const iv = (window as unknown as { __omeetsoRecIv?: number }).__omeetsoRecIv; if (iv) clearInterval(iv); }}
          onSend={sendVoice}
        />
      )}

      {view === "product" && sellerListings && (
        <div className="space-y-2">
          {sellerListings.map((id) => {
            const p = PRODUCTS.find((x) => x.id === id);
            if (!p) return null;
            return (
              <button
                key={id}
                onClick={() => shareProduct(id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-2 text-left"
              >
                <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.title}</span>
                  <span className="block text-[11px] text-muted-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
}

function Opt({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/60 p-3 text-xs font-semibold">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-sm"><Icon className="h-5 w-5 text-primary" /></span>
      {label}
    </button>
  );
}

function VoiceRecorder({
  recording, dur, onStart, onStop, onCancel, onSend,
}: {
  recording: boolean; dur: number;
  onStart: () => void; onStop: () => void; onCancel: () => void; onSend: () => void;
}) {
  const mm = Math.floor(dur / 60);
  const ss = Math.floor(dur % 60).toString().padStart(2, "0");
  return (
    <div className="pt-2 text-center">
      <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full ${recording ? "bg-red-100" : "bg-secondary"}`}>
        <Mic className={`h-10 w-10 ${recording ? "text-red-600 animate-pulse" : "text-muted-foreground"}`} />
      </div>
      <p className="mt-3 text-2xl font-extrabold tabular-nums">{mm}:{ss}</p>
      <p className="text-[11px] text-muted-foreground">Maximum 2 minutes · Frontend simulation only</p>
      {!recording && dur === 0 && (
        <button onClick={onStart} className="mt-4 h-11 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
          Start recording
        </button>
      )}
      {recording && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="h-11 rounded-2xl border border-border text-sm font-bold">Cancel</button>
          <button onClick={onStop} className="h-11 rounded-2xl bg-navy text-sm font-bold text-white">Stop</button>
        </div>
      )}
      {!recording && dur > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="h-11 rounded-2xl border border-border text-sm font-bold">Discard</button>
          <button onClick={onSend} className="h-11 rounded-2xl bg-primary text-sm font-bold text-primary-foreground">Send</button>
        </div>
      )}
    </div>
  );
}
