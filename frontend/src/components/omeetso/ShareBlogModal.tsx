import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface ShareBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt?: string;
  slug: string;
  coverImage?: string;
  category?: string;
}

export const ShareBlogModal: React.FC<ShareBlogModalProps> = ({
  isOpen,
  onClose,
  title,
  excerpt,
  slug,
  coverImage,
  category
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://omeetso.in";
  const shareUrl = `${origin}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`${title} — Omeetso Marketplace Guides`);
  const encodedSummary = encodeURIComponent(excerpt ? `${title}\n\n${excerpt}\n\nRead more:` : `${title}\n\nRead on Omeetso:`);

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url: shareUrl
        });
        onClose();
      } catch {
        // User cancelled
      }
    }
  };

  const shareChannels = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366] text-white",
      onClick: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodedSummary}%20${encodedUrl}`, "_blank");
      }
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: Send,
      color: "bg-[#229ED9] text-white",
      onClick: () => {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank");
      }
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-black text-white",
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank");
      }
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2] text-white",
      onClick: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank");
      }
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2] text-white",
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
      }
    },
    {
      id: "email",
      name: "Email",
      icon: Mail,
      color: "bg-slate-700 text-white",
      onClick: () => {
        window.open(`mailto:?subject=${encodedTitle}&body=${encodedSummary}%20${encodedUrl}`, "_blank");
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
      <div className="flex w-full max-w-md flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-secondary/30">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-brand/10 text-indigo-brand">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Share Article</h3>
              <p className="text-[11px] text-muted-foreground font-semibold">Spread useful marketplace knowledge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Article Preview Card */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-secondary/20">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Banner"
                className="h-14 w-14 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-indigo-brand/10 text-indigo-brand grid place-items-center shrink-0 font-black text-xs">
                GUIDE
              </div>
            )}
            <div className="min-w-0 flex-1">
              {category && (
                <span className="text-[10px] font-black uppercase text-indigo-brand">
                  {category}
                </span>
              )}
              <h4 className="text-xs font-black text-foreground line-clamp-2 leading-snug">
                {title}
              </h4>
            </div>
          </div>

          {/* Social Icons Grid */}
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2.5">
              Share via
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {shareChannels.map((channel) => {
                const IconComp = channel.icon;
                return (
                  <button
                    key={channel.id}
                    onClick={channel.onClick}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-border bg-card hover:bg-secondary transition-all hover:scale-102 active:scale-98 shadow-xs cursor-pointer group"
                  >
                    <div className={`grid h-10 w-10 place-items-center rounded-xl shadow-xs mb-1.5 transition-transform group-hover:scale-105 ${channel.color}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground">
                      {channel.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="pt-2">
            <span className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
              Or copy link
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/30 p-1.5">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent px-2.5 text-xs font-bold text-muted-foreground outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs shrink-0 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-brand text-white hover:bg-indigo-brand/90"
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Native Share button if available */}
          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary text-xs font-bold text-foreground flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>More sharing options on your device</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
