import { useState } from "react";
import { Star, X, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "SELLER" | "STORE";
  targetName: string;
  listingId?: string;
}

const DEFAULT_TAGS = [
  "Verified Buyer", "Item as Described", "Quick Communication",
  "Fair Price", "Friendly Seller", "Punctual Delivery", "Great Store"
];

export function ReviewModal({ isOpen, onClose, targetId, targetType, targetName, listingId }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Verified Buyer", "Item as Described"]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please add a short review comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("omeetso_user_token");
      const res = await fetch("https://api.omeetso.in/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          targetId,
          targetType,
          rating,
          comment: comment.trim(),
          tags: selectedTags,
          listingId
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Thank you! Review for ${targetName} submitted successfully.`);
        onClose();
        setComment("");
      } else {
        toast.error(json.error?.message || "Failed to submit review");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/80 shadow-2xl p-6 space-y-5 text-foreground">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/10 text-amber-500 font-bold">⭐</span>
            <div>
              <h2 className="text-base font-black tracking-tight">Rate & Review</h2>
              <p className="text-xs text-muted-foreground font-medium">Sharing feedback for <strong className="text-foreground">{targetName}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Star Selector */}
          <div className="text-center space-y-1.5 bg-surface-2 p-4 rounded-2xl border border-border/60">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How was your deal experience?</p>
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${star <= rating ? "fill-amber-400 text-amber-400 scale-105" : "text-slate-400/40"
                      } transition-all`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-black text-amber-500 uppercase tracking-wide">
              {rating === 5 ? "Excellent ⭐⭐⭐⭐⭐" : rating === 4 ? "Very Good ⭐⭐⭐⭐" : rating === 3 ? "Average ⭐⭐⭐" : "Needs Improvement ⭐"}
            </p>
          </div>

          {/* Review Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Select Highlight Tags:</label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-surface-2 text-muted-foreground border-border hover:border-primary/40"
                      }`}
                  >
                    {active && <Check className="h-3 w-3" />} {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment TextArea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Review Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Write your honest review about ${targetName}...`}
              rows={3}
              className="w-full rounded-2xl bg-surface-2 border border-border p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-sans"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:bg-electric transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Submitting Review..." : "Submit Review →"}
          </button>
        </form>
      </div>
    </div>
  );
}
