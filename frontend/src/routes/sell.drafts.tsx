import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { ConfirmModal } from "@/components/sell";
import { listDrafts, deleteDraft, computeCompletion, timeAgo, LS, seedIfEmpty, type ListingDraft } from "@/lib/listings";
import { CATEGORIES } from "@/lib/mock";
import { FilePlus2, ImageOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sell/drafts")({
  head: () => ({ meta: [{ title: "Draft listings — Omeetso" }] }),
  component: DraftsScreen,
});

function DraftsScreen() {
  const nav = useNavigate();
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const refresh = () => setDrafts(listDrafts());
  useEffect(() => { seedIfEmpty(); refresh(); }, []);

  function resume(d: ListingDraft) {
    const key = d.method === "detailed" ? LS.detailedDraft : LS.quickDraft;
    localStorage.setItem(key, JSON.stringify({ ...d, draftId: d.id }));
    nav({ to: d.method === "detailed" ? "/sell/detailed" : "/sell/quick" });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteDraft(pendingDelete);
    setPendingDelete(null);
    refresh();
    toast.success("Draft deleted");
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Drafts" />
        <div className="p-4">
          {drafts.length === 0 ? (
            <EmptyState
              icon={<FilePlus2 className="h-6 w-6 text-primary" />}
              title="No drafts yet"
              body="Start a listing and we'll save your progress automatically."
              ctaLabel="Start Selling"
              onCta={() => nav({ to: "/sell" })}
            />
          ) : (
            <div className="space-y-3">
              {drafts.map((d) => {
                const { pct, missing } = computeCompletion(d);
                const cover = d.images?.[d.cover ?? 0];
                return (
                  <div key={d.id} className="rounded-2xl border border-border bg-card p-3">
                    <div className="flex gap-3">
                      {cover ? (
                        <img src={cover} alt={d.title ?? "Draft"} className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-xl bg-secondary text-muted-foreground">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-bold">{d.title ?? "Untitled draft"}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {CATEGORIES.find((c) => c.id === d.category)?.name ?? "No category"} · {d.method === "detailed" ? "Detailed" : "Quick"} · edited {timeAgo(d.updatedAt)}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold">{pct}%</span>
                        </div>
                        {missing.length > 0 && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Missing: {missing.slice(0, 3).join(", ")}{missing.length > 3 ? "…" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => resume(d)}
                        className="flex-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                        Continue Editing
                      </button>
                      <button onClick={() => setPendingDelete(d.id)} aria-label="Delete draft"
                        className="grid h-9 w-9 place-items-center rounded-full border border-border text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <ConfirmModal
          open={!!pendingDelete}
          title="Delete this draft?"
          body="This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
        <BottomNav />
      </div>
    </MobileFrame>
  );
}
