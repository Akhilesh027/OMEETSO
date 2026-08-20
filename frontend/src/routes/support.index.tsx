import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { EmptyBlock } from "@/components/omeetso/account";
import { listTickets, subscribeAccount, TICKET_STATUS_LABEL, type TicketStatus, timeAgo } from "@/lib/account";
import { LifeBuoy, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/support/")({
  head: () => ({ meta: [
    { title: "Support tickets — Omeetso" },
    { name: "description", content: "View and manage your Omeetso support requests." },
  ]}),
  component: SupportList,
});

const FILTERS: (TicketStatus | "all")[] = ["all", "open", "in_progress", "waiting_user", "resolved", "closed"];
const STATUS_COLOR: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-800",
  waiting_user: "bg-yellow-100 text-yellow-800",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-secondary text-muted-foreground",
};

function SupportList() {
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const tickets = listTickets().filter((t) => filter === "all" || t.status === filter);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12">
        <BackBar title="Support" right={<Link to="/support/new" className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="New ticket"><Plus className="h-4 w-4" /></Link>} />
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
              className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
              {f === "all" ? "All" : TICKET_STATUS_LABEL[f as TicketStatus]}
            </button>
          ))}
        </div>

        <div className="mt-2 space-y-2 px-4">
          {tickets.length === 0 ? (
            <EmptyBlock icon={LifeBuoy} title="No support requests yet"
              body="Create a ticket when you need help with your account, listings or payments."
              cta="Contact Support" to="/support/new" />
          ) : tickets.map((t) => (
            <Link key={t.id} to="/support/$id" params={{ id: t.id }}
              className="flex items-start gap-3 rounded-2xl bg-card p-3 card-elev">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-bold">{t.subject}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", STATUS_COLOR[t.status])}>
                    {TICKET_STATUS_LABEL[t.status]}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{t.number} · {t.category}</p>
                <p className="text-[11px] text-muted-foreground">Updated {timeAgo(t.updatedAt)}</p>
              </div>
              <ChevronRight className="mt-3 h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <p className="mx-4 mt-3 text-[10px] text-muted-foreground">Support response times shown in this preview are sample data.</p>
      </div>
    </MobileFrame>
  );
}
