import { BottomSheet } from "@/components/omeetso/BottomSheet";
import {
  Camera, Image as ImageIcon, MapPin, Mic, Package, FileText,
  Upload, FilePlus, ShieldCheck, CheckCircle2, UserCheck, Smartphone,
  ExternalLink, Navigation, Sparkles, X, Check
} from "lucide-react";
import { sendMessage, type DocumentAttachment, type ContactAttachment } from "@/lib/chat";
import { PRODUCTS } from "@/lib/mock";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_DOCS = [
  { name: "Omeetso_Purchase_Invoice.pdf", size: 450 * 1024, ext: "PDF", type: "Invoice / Bill" },
  { name: "Manufacturer_Warranty_Card.pdf", size: 1200 * 1024, ext: "PDF", type: "Warranty Proof" },
  { name: "Device_Condition_Inspection_Report.pdf", size: 850 * 1024, ext: "PDF", type: "Inspection Report" },
  { name: "Product_Technical_Specifications.pdf", size: 320 * 1024, ext: "PDF", type: "Product Specs" },
  { name: "Verified_ID_Proof_Redacted.pdf", size: 680 * 1024, ext: "PDF", type: "Identity Proof" },
];

const AREAS = [
  { name: "Madhapur Metro Station", area: "Madhapur, near ticket counter / Exit B" },
  { name: "Inorbit Mall Entrance", area: "Cyberabad, main gate public parking" },
  { name: "Ameerpet Metro Station", area: "Ameerpet, Concourse / Exit A" },
  { name: "Public Café near Kondapur", area: "Kondapur Main Road" },
  { name: "Forum Sujana Mall", area: "Kukatpally, Main Concourse" },
  { name: "Hitec City Cyber Towers", area: "Main Entrance Security Gate" },
];

const IMAGE_SAMPLES = PRODUCTS.slice(0, 8).map((p) => p.image);

export interface AttachmentSheetProps {
  open: boolean;
  onClose: () => void;
  threadId: string;
  sellerListings?: string[];
  onSendAttachment?: (payload: {
    type: "image" | "document" | "location" | "voice" | "contact";
    text?: string;
    imageUrl?: string;
    caption?: string;
    document?: DocumentAttachment;
    contact?: ContactAttachment;
    location?: { name: string; area: string };
    voice?: { durationSec: number };
  }) => void;
}

export function AttachmentSheet({
  open,
  onClose,
  threadId,
  sellerListings,
  onSendAttachment,
}: AttachmentSheetProps) {
  const [view, setView] = useState<"menu" | "document" | "gallery" | "location" | "voice" | "contact" | "product">("menu");
  
  // Document state
  const [selectedDoc, setSelectedDoc] = useState<DocumentAttachment | null>(null);
  const [docCaption, setDocCaption] = useState("");
  const docFileRef = useRef<HTMLInputElement>(null);

  // Image state
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const imgFileRef = useRef<HTMLInputElement>(null);

  // Contact state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Voice state
  const [recording, setRecording] = useState(false);
  const [dur, setDur] = useState(0);

  const close = () => {
    setView("menu");
    setSelectedDoc(null);
    setDocCaption("");
    setSelectedImg(null);
    setCaption("");
    setRecording(false);
    setDur(0);
    onClose();
  };

  const dispatchAttachment = (payload: {
    type: "image" | "document" | "location" | "voice" | "contact";
    text?: string;
    imageUrl?: string;
    caption?: string;
    document?: DocumentAttachment;
    contact?: ContactAttachment;
    location?: { name: string; area: string };
    voice?: { durationSec: number };
  }) => {
    if (onSendAttachment) {
      onSendAttachment(payload);
    } else {
      sendMessage(threadId, {
        ...payload,
        from: "me",
      });
    }
  };

  // ── Document Handler ──
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Document exceeds maximum size (25MB)");
      return;
    }

    const ext = file.name.split(".").pop()?.toUpperCase() || "DOC";
    const objectUrl = URL.createObjectURL(file);

    setSelectedDoc({
      name: file.name,
      size: file.size,
      ext,
      mimeType: file.type,
      url: objectUrl,
    });
  };

  const sendDocument = () => {
    if (!selectedDoc) {
      toast.error("Please select or upload a document");
      return;
    }

    dispatchAttachment({
      type: "document",
      document: selectedDoc,
      caption: docCaption.trim() || undefined,
    });

    toast.success("Document attached & shared");
    close();
  };

  // ── Image Handler ──
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImg(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const sendImage = () => {
    if (!selectedImg) return;
    dispatchAttachment({
      type: "image",
      imageUrl: selectedImg,
      caption: caption.trim() || undefined,
    });
    toast.success("Photo shared");
    close();
  };

  // ── Location Handler ──
  const shareLocation = (l: { name: string; area: string }) => {
    dispatchAttachment({
      type: "location",
      location: l,
    });
    toast.success("Meeting point shared");
    close();
  };

  const shareCurrentGps = () => {
    if ("geolocation" in navigator) {
      toast.info("Fetching your GPS coordinates...");
      navigator.geolocation.getCurrentPosition(
        () => {
          shareLocation({
            name: "Current GPS Location",
            area: "Hyderabad, Telangana • Within 100m accuracy",
          });
        },
        () => {
          shareLocation({
            name: "Live Coordinate Location",
            area: "Madhapur, Cyberabad • 500081",
          });
        }
      );
    } else {
      shareLocation({
        name: "Pinned Location",
        area: "Madhapur, Hyderabad",
      });
    }
  };

  // ── Contact Handler ──
  const sendContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Please enter a name and phone number");
      return;
    }

    dispatchAttachment({
      type: "contact",
      contact: {
        name: contactName.trim(),
        phone: contactPhone.trim(),
      },
    });

    toast.success("Contact details shared");
    close();
  };

  // ── Voice Handler ──
  const sendVoice = () => {
    if (dur < 1) {
      toast.error("Recording too short");
      return;
    }
    dispatchAttachment({
      type: "voice",
      voice: { durationSec: Math.round(dur) },
    });
    toast.success("Voice note sent");
    close();
  };

  // ── Product Listing Handler ──
  const shareProduct = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    dispatchAttachment({
      type: "image",
      imageUrl: p.image,
      caption: `${p.title} — ₹${p.price.toLocaleString("en-IN")}`,
    });
    toast.success("Listing shared");
    close();
  };

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={
        view === "menu" ? "Share & Attach" :
        view === "document" ? "Share Document" :
        view === "gallery" ? "Choose Photo" :
        view === "location" ? "Share Safe Meeting Point" :
        view === "contact" ? "Share Contact Card" :
        view === "voice" ? "Voice Note" : "Your Listings"
      }
    >
      {/* ── Main Attachment Menu ── */}
      {view === "menu" && (
        <div className="grid grid-cols-3 gap-3 pt-2 pb-4">
          <Opt
            icon={FileText}
            label="Document"
            sub="PDF, Invoice, Bill"
            color="text-red-500"
            bg="bg-red-50 dark:bg-red-950/40"
            onClick={() => setView("document")}
          />
          <Opt
            icon={Camera}
            label="Camera"
            sub="Take Photo"
            color="text-sky-500"
            bg="bg-sky-50 dark:bg-sky-950/40"
            onClick={() => {
              setView("gallery");
              setTimeout(() => imgFileRef.current?.click(), 100);
            }}
          />
          <Opt
            icon={ImageIcon}
            label="Gallery"
            sub="Upload Image"
            color="text-indigo-500"
            bg="bg-indigo-50 dark:bg-indigo-950/40"
            onClick={() => setView("gallery")}
          />
          <Opt
            icon={MapPin}
            label="Location"
            sub="Safe Meetup"
            color="text-emerald-500"
            bg="bg-emerald-50 dark:bg-emerald-950/40"
            onClick={() => setView("location")}
          />
          <Opt
            icon={Smartphone}
            label="Contact"
            sub="Phone & WhatsApp"
            color="text-amber-500"
            bg="bg-amber-50 dark:bg-amber-950/40"
            onClick={() => setView("contact")}
          />
          <Opt
            icon={Mic}
            label="Voice Note"
            sub="Record Audio"
            color="text-purple-500"
            bg="bg-purple-50 dark:bg-purple-950/40"
            onClick={() => setView("voice")}
          />
          {sellerListings && sellerListings.length > 0 && (
            <Opt
              icon={Package}
              label="My Listings"
              sub="Direct Catalog"
              color="text-blue-500"
              bg="bg-blue-50 dark:bg-blue-950/40"
              onClick={() => setView("product")}
            />
          )}
        </div>
      )}

      {/* ── Document View ── */}
      {view === "document" && (
        <div className="space-y-4 pb-4">
          <input
            type="file"
            ref={docFileRef}
            onChange={handleDocFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
            className="hidden"
          />

          {/* Upload Button */}
          <button
            onClick={() => docFileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 p-4 transition-all hover:bg-sky-50 dark:hover:bg-sky-900/30"
          >
            <Upload className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
              Upload PDF or File from Device (Max 25MB)
            </span>
          </button>

          {/* Preset Templates */}
          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quick Verified Templates
            </p>
            <div className="space-y-2">
              {SAMPLE_DOCS.map((d) => (
                <button
                  key={d.name}
                  onClick={() => setSelectedDoc({ name: d.name, size: d.size, ext: d.ext })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                    selectedDoc?.name === d.name
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-secondary/60"
                  )}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500 text-[10px] font-black text-white shadow-sm">
                    PDF
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {d.type} • {(d.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  {selectedDoc?.name === d.name && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Document Details & Send */}
          {selectedDoc && (
            <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-sky-900 dark:text-sky-100">
                <span className="truncate flex-1">{selectedDoc.name}</span>
                <span className="text-[10px] text-sky-700 dark:text-sky-300 ml-2">
                  {(selectedDoc.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <input
                value={docCaption}
                onChange={(e) => setDocCaption(e.target.value.slice(0, 200))}
                placeholder="Add a note or description (optional)"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={sendDocument}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-navy text-xs font-bold text-white shadow-md hover:bg-navy/90"
              >
                Send Document
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Gallery / Photos View ── */}
      {view === "gallery" && (
        <div className="space-y-3 pb-4">
          <input
            type="file"
            ref={imgFileRef}
            onChange={handleImageFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => imgFileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5"
          >
            <Camera className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Take Photo or Upload from Library
            </span>
          </button>

          <div className="grid grid-cols-4 gap-2">
            {IMAGE_SAMPLES.map((src) => (
              <button
                key={src}
                onClick={() => setSelectedImg(src)}
                className={cn(
                  "overflow-hidden rounded-xl border-2 aspect-square",
                  selectedImg === src ? "border-primary ring-2 ring-primary" : "border-transparent"
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {selectedImg && (
            <div className="space-y-2">
              <img src={selectedImg} alt="Preview" className="max-h-44 w-full rounded-2xl object-cover" />
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 200))}
                placeholder="Add a photo caption (optional)"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={sendImage}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-navy text-xs font-bold text-white shadow-md hover:bg-navy/90"
              >
                Send Photo
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Location View ── */}
      {view === "location" && (
        <div className="space-y-3 pb-4">
          <button
            onClick={shareCurrentGps}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
          >
            <Navigation className="h-4 w-4" /> Share My Current Location
          </button>

          <div className="space-y-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Verified Public Meeting Points
            </p>
            {AREAS.map((l) => (
              <button
                key={l.name}
                onClick={() => shareLocation(l)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left hover:bg-secondary/60 transition-all"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">{l.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{l.area}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Contact View ── */}
      {view === "contact" && (
        <div className="space-y-3 pb-4">
          <p className="text-xs text-muted-foreground">
            Share your mobile number / WhatsApp for direct coordination & meetup inspection.
          </p>
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Contact Name</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Mobile Phone / WhatsApp</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            onClick={sendContact}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-navy text-xs font-bold text-white shadow-md hover:bg-navy/90"
          >
            Share Contact Details
          </button>
        </div>
      )}

      {/* ── Voice Note View ── */}
      {view === "voice" && (
        <VoiceRecorder
          recording={recording}
          dur={dur}
          onStart={() => {
            setRecording(true);
            const start = Date.now();
            const iv = window.setInterval(() => {
              const t = (Date.now() - start) / 1000;
              if (t >= 120) {
                setRecording(false);
                clearInterval(iv);
                setDur(120);
              } else setDur(t);
            }, 100);
            (window as unknown as { __omeetsoRecIv?: number }).__omeetsoRecIv = iv;
          }}
          onStop={() => {
            setRecording(false);
            const iv = (window as unknown as { __omeetsoRecIv?: number }).__omeetsoRecIv;
            if (iv) clearInterval(iv);
          }}
          onCancel={() => {
            setRecording(false);
            setDur(0);
            const iv = (window as unknown as { __omeetsoRecIv?: number }).__omeetsoRecIv;
            if (iv) clearInterval(iv);
          }}
          onSend={sendVoice}
        />
      )}

      {/* ── Products View ── */}
      {view === "product" && sellerListings && (
        <div className="space-y-2 pb-4">
          {sellerListings.map((id) => {
            const p = PRODUCTS.find((x) => x.id === id);
            if (!p) return null;
            return (
              <button
                key={id}
                onClick={() => shareProduct(id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-2 text-left hover:bg-secondary/60 transition-all"
              >
                <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">{p.title}</span>
                  <span className="block text-[11px] text-muted-foreground font-semibold">
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
}

function Opt({
  icon: Icon,
  label,
  sub,
  color,
  bg,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  color: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/50 p-3 text-center transition-all"
    >
      <span className={cn("grid h-12 w-12 place-items-center rounded-2xl shadow-sm", bg)}>
        <Icon className={cn("h-6 w-6", color)} />
      </span>
      <div>
        <p className="text-xs font-bold text-foreground leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </button>
  );
}

function VoiceRecorder({
  recording,
  dur,
  onStart,
  onStop,
  onCancel,
  onSend,
}: {
  recording: boolean;
  dur: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onSend: () => void;
}) {
  const mm = Math.floor(dur / 60);
  const ss = Math.floor(dur % 60).toString().padStart(2, "0");
  return (
    <div className="pt-2 pb-4 text-center">
      <div
        className={cn(
          "mx-auto grid h-24 w-24 place-items-center rounded-full transition-all",
          recording ? "bg-red-100 dark:bg-red-950/40" : "bg-secondary"
        )}
      >
        <Mic className={cn("h-10 w-10", recording ? "text-red-600 animate-pulse" : "text-muted-foreground")} />
      </div>
      <p className="mt-3 text-2xl font-extrabold tabular-nums">{mm}:{ss}</p>
      <p className="text-[11px] text-muted-foreground">Maximum 2 minutes audio note</p>
      {!recording && dur === 0 && (
        <button
          onClick={onStart}
          className="mt-4 h-11 w-full rounded-2xl bg-navy text-xs font-bold text-white shadow-md hover:bg-navy/90"
        >
          Start Recording
        </button>
      )}
      {recording && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="h-11 rounded-2xl border border-border text-xs font-bold">
            Cancel
          </button>
          <button onClick={onStop} className="h-11 rounded-2xl bg-red-600 text-xs font-bold text-white shadow-md">
            Stop
          </button>
        </div>
      )}
      {!recording && dur > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="h-11 rounded-2xl border border-border text-xs font-bold">
            Discard
          </button>
          <button onClick={onSend} className="h-11 rounded-2xl bg-navy text-xs font-bold text-white shadow-md">
            Send Voice Note
          </button>
        </div>
      )}
    </div>
  );
}

export default AttachmentSheet;
