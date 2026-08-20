import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { Search, ArrowRight, Trash2 } from "lucide-react";
import { addHelpRecent, clearHelpRecent, listHelpRecent } from "@/lib/account";
import { FAQ_CATEGORIES, ALL_FAQS } from "@/lib/faq";

export const Route = createFileRoute("/help/search")({
  head: () => ({ meta: [{ title: "Help search — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "", cat: (s.cat as string) ?? "" }),
  component: HelpSearch,
});

function HelpSearch() {
  const { q: q0, cat: cat0 } = useSearch({ from: "/help/search" });
  const [q, setQ] = useState(q0);
  const [cat, setCat] = useState(cat0);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => setRecent(listHelpRecent()), []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = ALL_FAQS;
    if (cat) list = list.filter((f) => f.category === cat);
    if (term) list = list.filter((f) =>
      f.title.toLowerCase().includes(term) ||
      f.summary.toLowerCase().includes(term) ||
      f.keywords.some((k) => k.includes(term))
    );
    return list;
  }, [q, cat]);

  const commit = () => { if (q.trim()) { addHelpRecent(q); setRecent(listHelpRecent()); } };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Search help" />
        <div className="px-4 pt-2 space-y-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder="Question, keyword, feature or error message"
              className="w-full bg-transparent text-sm outline-none" aria-label="Search help" />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCat("")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${cat === "" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>All</button>
            {FAQ_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${cat === c.id ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                {c.label}
              </button>
            ))}
          </div>

          {q === "" && recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Recent searches</p>
                <button onClick={() => { clearHelpRecent(); setRecent([]); }} className="text-[11px] font-bold text-rose-700 inline-flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button key={r} onClick={() => setQ(r)} className="rounded-full border border-border bg-card px-3 py-1 text-xs">{r}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
                No results. Try different keywords or <Link to="/support/new" className="font-bold text-primary">contact support</Link>.
              </div>
            ) : results.map((f) => (
              <Link key={f.id} to="/help/faq/$id" params={{ id: f.id }} onClick={commit}
                className="flex items-center justify-between rounded-2xl bg-card p-3 card-elev">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{f.summary}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
