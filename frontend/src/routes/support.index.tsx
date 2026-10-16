import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { EmptyBlock } from "@/components/omeetso/account";
import { listTickets, subscribeAccount, timeAgo } from "@/lib/account";
import { getMySupportTicketsApi, type SupportTicketItem } from "@/api/support.api";
import { LifeBuoy, Plus, ChevronRight, RefreshCw, MessageSquare, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/support/")({
  head: () => ({
    meta: [
      { title: "Support tickets — Omeetso" },
      { name: "description", content: "View and manage your Omeetso support requests." },
    ],
  }),
  component: SupportList,
});

type FilterType = "all" | "open" | "in_progress" | "waiting_user" | "resolved" | "closed";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All Tickets" },
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In Progress" },
  { id: "waiting_user", label: "Waiting on You" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  open: { label: "Open", badgeClass: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  OPEN: { label: "Open", badgeClass: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  assigned: { label: "Assigned", badgeClass: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20" },
  ASSIGNED: { label: "Assigned", badgeClass: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20" },
  in_progress: { label: "In Progress", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20" },
  IN_PROGRESS: { label: "In Progress", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20" },
  waiting_user: { label: "Waiting on You", badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20" },
  WAITING_USER: { label: "Waiting on You", badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20" },
  resolved: { label: "Resolved", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" },
  RESOLVED: { label: "Resolved", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" },
  closed: { label: "Closed", badgeClass: "bg-muted text-muted-foreground border border-border" },
  CLOSED: { label: "Closed", badgeClass: "bg-muted text-muted-foreground border border-border" },
  reopened: { label: "Reopened", badgeClass: "bg-rose-500/10 text-rose-600 border border-rose-500/20" },
  REOPENED: { label: "Reopened", badgeClass: "bg-rose-500/10 text-rose-600 border border-rose-500/20" },
};

function SupportList() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const serverRes = await getMySupportTicketsApi();
      const localTickets = listTickets();

      const mergedMap = new Map<string, SupportTicketItem>();

      // 1. Add server tickets
      if (serverRes.success && Array.isArray(serverRes.data)) {
        serverRes.data.forEach((st) => {
          mergedMap.set(st.id, st);
          if (st.ticketNumber) mergedMap.set(st.ticketNumber, st);
        });
      }

      // 2. Add local tickets if not in server
      localTickets.forEach((lt) => {
        if (!mergedMap.has(lt.id) && !mergedMap.has(lt.number)) {
          mergedMap.set(lt.id, {
            id: lt.id,
            ticketNumber: lt.number,
            subject: lt.subject,
            category: lt.category,
            subcategory: lt.subcategory,
            description: lt.description,
            priority: lt.priority ? String(lt.priority).toUpperCase() : "MEDIUM",
            status: lt.status.toUpperCase() as any,
            contactMethod: lt.contactMethod,
            relatedListing: lt.relatedListing,
            relatedStore: lt.relatedStore,
            relatedCampaign: lt.relatedCampaign,
            relatedPayment: lt.relatedPayment,
            createdAt: new Date(lt.createdAt).toISOString(),
            updatedAt: new Date(lt.updatedAt).toISOString(),
          });
        }
      });

      const uniqueTickets = Array.from(new Set(mergedMap.values()))
        .filter((t) => t.id !== "T1" && t.id !== "T2" && t.id !== "T3" && !t.ticketNumber?.startsWith("OMS-2407"))
        .sort(
          (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );

      setTickets(uniqueTickets);
    } catch {
      // Fallback to local
      const fallback = listTickets()
        .filter((t) => t.id !== "T1" && t.id !== "T2" && t.id !== "T3" && !t.number?.startsWith("OMS-2407"))
        .map((lt) => ({
          id: lt.id,
          ticketNumber: lt.number,
          subject: lt.subject,
          category: lt.category,
          subcategory: lt.subcategory,
          description: lt.description,
          priority: "MEDIUM",
          status: lt.status.toUpperCase() as any,
          createdAt: new Date(lt.createdAt).toISOString(),
          updatedAt: new Date(lt.updatedAt).toISOString(),
        }));
      setTickets(fallback);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const unsub = subscribeAccount(() => fetchTickets());
    return () => unsub();
  }, [fetchTickets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTickets();
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    const s = (t.status || "").toLowerCase();
    if (filter === "open") return s === "open" || s === "assigned" || s === "reopened";
    if (filter === "in_progress") return s === "in_progress";
    if (filter === "waiting_user") return s === "waiting_user";
    if (filter === "resolved") return s === "resolved";
    if (filter === "closed") return s === "closed";
    return true;
  });

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12 font-sans">
        <BackBar
          title="Support Desk"
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh tickets"
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
              </button>
              <Link
                id="create-new-ticket-btn"
                to="/support/new"
                className="flex items-center gap-1 h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition active:scale-95"
                aria-label="Create new ticket"
              >
                <Plus className="h-4 w-4" />
                <span>New Ticket</span>
              </Link>
            </div>
          }
        />

        {/* Filter Chips Bar */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none">
          {FILTERS.map((f) => {
            const isSelected = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={isSelected}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs font-black"
                    : "border-border/80 bg-card text-muted-foreground hover:bg-secondary/60"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Ticket List Area */}
        <div className="mt-2 space-y-2.5 px-4">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
              <p>Loading your support tickets from database...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <EmptyBlock
              icon={LifeBuoy}
              title={filter === "all" ? "No support requests yet" : `No ${filter.replace("_", " ")} tickets`}
              body="Need assistance with an order, payments, verification, or a suspicious user? Create a support ticket to connect directly with our resolution team."
              cta="Create New Ticket"
              to="/support/new"
            />
          ) : (
            filteredTickets.map((t) => {
              const statusCfg = STATUS_CONFIG[t.status] || {
                label: t.status,
                badgeClass: "bg-muted text-foreground border border-border",
              };
              return (
                <Link
                  key={t.id}
                  to="/support/$id"
                  params={{ id: t.id }}
                  className="group block rounded-3xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-primary">
                          {t.ticketNumber || `#${t.id.slice(-6).toUpperCase()}`}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-xs font-bold text-foreground">
                          {t.category}{t.subcategory ? ` · ${t.subcategory}` : ""}
                        </span>
                        {t.priority && (t.priority === "HIGH" || t.priority === "URGENT") && (
                          <span className="rounded-md bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 text-[9px] font-black text-rose-600 uppercase">
                            {t.priority}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {t.subject}
                      </h3>

                      {t.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                          {t.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-2 text-[11px] font-medium text-muted-foreground border-t border-border/40">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Updated {timeAgo(t.updatedAt || t.createdAt)}</span>
                        </span>
                        {t.contactMethod && (
                          <span className="capitalize text-[10px] bg-secondary/80 px-2 py-0.5 rounded-full font-semibold">
                            Channel: {t.contactMethod.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider", statusCfg.badgeClass)}>
                        {statusCfg.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all mt-auto" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Live Support Guarantee Banner */}
        <div className="mx-4 mt-5 rounded-2xl bg-secondary/40 border border-border/60 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-foreground text-[11px]">Direct Support Desk Active</p>
            <p className="text-[10px] leading-relaxed">
              All tickets submitted here are logged in the database and monitored by our customer operations officers. Standard review time is within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

export default SupportList;
