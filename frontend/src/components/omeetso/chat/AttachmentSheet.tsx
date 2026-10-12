import { BottomSheet } from "@/components/omeetso/BottomSheet";
import {
  Image as ImageIcon, Package, FileText,
  Upload, FilePlus, ShieldCheck, CheckCircle2, UserCheck, Smartphone,
  ExternalLink, Sparkles, X, Check
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

const IMAGE_SAMPLES = PRODUCTS.slice(0, 8).map((p) => p.image);

export interface AttachmentSheetProps {
  open: boolean;
  onClose: () => void;
  threadId: string;
  sellerListings?: string[];
  onSendAttachment?: (payload: {
    type: "image" | "document" | "contact";
    text?: string;
    imageUrl?: string;
    caption?: string;
    document?: DocumentAttachment;
    contact?: ContactAttachment;
  }) => void;
}

export function AttachmentSheet({
  open,
  onClose,
  threadId,
  sellerListings,
  onSendAttachment,
}: AttachmentSheetProps) {
  const [view, setView] = useState<"menu" | "document" | "gallery" | "contact" | "product">("menu");
  
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

  const close = () => {
    setView("menu");
    setSelectedDoc(null);
    setDocCaption("");
    setSelectedImg(null);
    setCaption("");
    onClose();
  };

  const dispatchAttachment = (payload: {
    type: "image" | "document" | "contact";
    text?: string;
    imageUrl?: string;
    caption?: string;
    document?: DocumentAttachment;
    contact?: ContactAttachment;
  }) => {
    if (onSendAttachment) {
      onSendAttachment(payload as any);
    } else {
      sendMessage(threadId, {
        from: "me",
        type: payload.type as any,
        text: payload.caption || payload.text,
        imageUrl: payload.imageUrl,
        document: payload.document,
        contact: payload.contact,
      });
    }
  };

  // ── Document Handlers ──
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Document exceeds maximum size (15 MB)");
      return;
    }

    const ext = file.name.split(".").pop()?.toUpperCase() || "DOC";
    const newDoc: DocumentAttachment = {
      name: file.name,
      size: file.size,
      ext,
      mimeType: file.type || "application/octet-stream",
    };

    setSelectedDoc(newDoc);
    toast.success(`Attached "${file.name}"`);
  };

  const selectSampleDoc = (sample: typeof SAMPLE_DOCS[0]) => {
    setSelectedDoc({
      name: sample.name,
      size: sample.size,
      ext: sample.ext,
      mimeType: "application/pdf",
    });
    toast.info(`Selected ${sample.type}`);
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
        view === "gallery" ? "Upload Photo" :
        view === "contact" ? "Share Contact Card" :
        "Your Listings"
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
            icon={ImageIcon}
            label="Gallery"
            sub="Upload Image"
            color="text-indigo-500"
            bg="bg-indigo-50 dark:bg-indigo-950/40"
            onClick={() => setView("gallery")}
          />
          <Opt
            icon={Smartphone}
            label="Contact"
            sub="Phone & WhatsApp"
            color="text-amber-500"
            bg="bg-amber-50 dark:bg-amber-950/40"
            onClick={() => setView("contact")}
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
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
          />

          <button
            onClick={() => docFileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 transition-all hover:bg-indigo-50"
          >
            <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Upload File from Device
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, DOC, Invoices, Receipts (up to 15MB)</p>
            </div>
          </button>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Verified Document Templates
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> Auto-Verified
              </span>
            </div>

            <div className="space-y-2">
              {SAMPLE_DOCS.map((doc) => {
                const isSelected = selectedDoc?.name === doc.name;
                return (
                  <button
                    key={doc.name}
                    onClick={() => selectSampleDoc(doc)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/70 hover:border-primary/50 bg-card"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center font-black text-[10px]">
                        {doc.ext}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{(doc.size / 1024).toFixed(0)} KB</span>
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-2" />
                    ) : (
                      <FilePlus className="h-4 w-4 text-muted-foreground/60 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDoc && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 p-2 bg-secondary/60 rounded-xl">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-bold text-foreground truncate flex-1">{selectedDoc.name}</span>
                <button onClick={() => setSelectedDoc(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <input
                value={docCaption}
                onChange={(e) => setDocCaption(e.target.value)}
                placeholder="Add optional note or description..."
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 hover:bg-indigo-50 transition-all"
          >
            <ImageIcon className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Upload from Photos / Gallery
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
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={sendImage}
                className="h-11 w-full rounded-2xl bg-navy text-xs font-bold text-white shadow-md hover:bg-navy/90"
              >
                Send Photo
              </button>
            </div>
          )}
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

export default AttachmentSheet;
