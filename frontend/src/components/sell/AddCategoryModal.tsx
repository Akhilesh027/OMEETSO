import { useState } from "react";
import { X, Plus, Layers, Sparkles } from "lucide-react";
import { addNewCategory, type LiveCategory } from "@/lib/categories";
import { toast } from "sonner";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: LiveCategory) => void;
}

export function AddCategoryModal({ isOpen, onClose, onCategoryAdded }: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [subcategoriesText, setSubcategoriesText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const subs = subcategoriesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await addNewCategory({
        name: name.trim(),
        subcategories: subs.length > 0 ? subs : ["General", "Other"],
        iconName: "Layers"
      });

      toast.success(`Category "${created.name}" created and selected!`);
      onCategoryAdded(created);
      setName("");
      setSubcategoriesText("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-brand border border-indigo-500/25">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground">Add New Category</h3>
            <p className="text-xs text-muted-foreground">Make a new category immediately available for listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-foreground mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Musical Instruments, Solar Panels, Art & Crafts"
              className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-xs font-bold outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-foreground mb-1.5">
              Subcategories <span className="text-[11px] font-normal text-muted-foreground">(Comma-separated, optional)</span>
            </label>
            <input
              type="text"
              value={subcategoriesText}
              onChange={(e) => setSubcategoriesText(e.target.value)}
              placeholder="e.g. Guitars, Drums, Keyboards, Audio Gear"
              className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-xs font-bold outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Tip: Separate multiple subcategories with commas.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span>Adding…</span>
              ) : (
                <>
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
