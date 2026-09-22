import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  type NotificationItem
} from "@/api/notifications.api";
import { listNotifications, markRead, markAllRead } from "@/lib/account";
import {
  MessageSquare, HandCoins, Package, Store, Megaphone, CreditCard, ShieldCheck, Bell, Loader2, ArrowRight, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InfinityLoader } from "@/components/omeetso/InfinityLoader";

const CATS = [
  { id: "all", label: "All" },
  { id: "nearby_changes", label: "Nearby Changes" },
  { id: "listings", label: "Listings" },
  { id: "job_application", label: "Jobs" },
  { id: "chat_message", label: "Messages" },
  { id: "offer_received", label: "Offers" },
  { id: "offer_status", label: "Offer Status" },
  { id: "system", label: "System" },
];

const ICON: Record<string, any> = {
  nearby_changes: Radio,
  chat_message: MessageSquare,
  offer_received: HandCoins,
  offer_status: HandCoins,
  listing_moderation: Package,
  store_moderation: Store,
  job_application: Package,
  system: ShieldCheck,
  offers: HandCoins,
  listings: Package,
  stores: Store,
  promotions: Megaphone,
  payments: CreditCard,
};

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Omeetso" },
      { name: "description", content: "View messages, offers, listing updates, and system safety alerts." },
    ]
  }),
  component: NotifList,
});

function NotifList() {
  const nav = useNavigate();
  const [tab, setTab] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    let serverItems: NotificationItem[] = [];
    try {
      const res = await getNotificationsApi(1, 50);
      if (res.success && Array.isArray(res.data)) {
        serverItems = res.data;
      }
    } catch { /* offline fallback */ }

    const local = listNotifications();
    const localMapped: NotificationItem[] = local.map((n) => ({
      id: n.id,
      type: n.category || "system",
      title: n.title,
      body: n.body,
      link: n.destination || `/notifications/${n.id}`,
      thumbnail: n.thumbnail,
      isRead: Boolean(n.read),
      createdAt: new Date(n.time).toISOString(),
    }));

    // Merge server & local, deduping by id and title+body fingerprint
    const map = new Map<string, NotificationItem>();
    const seenContent = new Set<string>();

    serverItems.forEach((n) => {
      const fp = `${(n.title || "").trim().toLowerCase()}__${(n.body || "").trim().toLowerCase()}`;
      if (!seenContent.has(fp)) {
        seenContent.add(fp);
        map.set(n.id, n);
      }
    });

    localMapped.forEach((n) => {
      const fp = `${(n.title || "").trim().toLowerCase()}__${(n.body || "").trim().toLowerCase()}`;
      if (!map.has(n.id) && !seenContent.has(fp)) {
        seenContent.add(fp);
        map.set(n.id, n);
      }
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setNotifications(merged);
    setUnreadCount(merged.filter((item) => !item.isRead).length);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleSync = () => {
      loadNotifications();
    };

    window.addEventListener("omeetso_notifications_changed", handleSync);
    window.addEventListener("omeetso_auth_changed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("omeetso_notifications_changed", handleSync);
      window.removeEventListener("omeetso_auth_changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    markAllRead();
    await markAllNotificationsReadApi();
    toast.success("All notifications marked as read");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotifClick = async (n: NotificationItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // 1. Immediately update notification model in component state
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // 2. Persist read state to API & Local Storage
    markNotificationReadApi(n.id);
    markRead(n.id, true);

    // 3. Navigate to destination route or notification detail
    let targetLink = n.link || `/notifications/${n.id}`;
    const isJob = n.type === "job_application" || n.type === "jobs" || n.title?.toLowerCase().includes("job") || n.body?.toLowerCase().includes("application");

    // Fix: Job application notifications must open the candidate applications view / job details, never the profile builder
    if (isJob && (
      targetLink.startsWith("/notifications/") ||
      targetLink.includes("/account/profile/jobs") ||
      targetLink.includes("/my/profile/jobs") ||
      targetLink === "/account" ||
      targetLink === "/profile" ||
      targetLink === "/account/jobs"
    )) {
      targetLink = "/my/jobs";
    }

    if (targetLink.startsWith("/chat/")) {
      const id = targetLink.replace("/chat/", "");
      nav({ to: "/chat/$id", params: { id } });
    } else if (targetLink.startsWith("/transaction/")) {
      const offerId = targetLink.replace("/transaction/", "");
      nav({ to: "/transaction/$offerId", params: { offerId } });
    } else if (targetLink.startsWith("/product/")) {
      const id = targetLink.replace("/product/", "");
      nav({ to: "/product/$id", params: { id } });
    } else if (targetLink.startsWith("/store/")) {
      const id = targetLink.replace("/store/", "");
      nav({ to: "/store/$id", params: { id } });
    } else if (targetLink.startsWith("/job/")) {
      const id = targetLink.replace("/job/", "").split("?")[0].split("#")[0];
      nav({ to: "/job/$id", params: { id } });
    } else if (targetLink.startsWith("/my/employer/jobs")) {
      nav({ to: "/my/employer/jobs" });
    } else if (targetLink.startsWith("/my/jobs")) {
      try {
        const urlObj = new URL(targetLink, "http://localhost");
        const searchId = urlObj.searchParams.get("id") || urlObj.searchParams.get("jobId") || undefined;
        const searchTab = (urlObj.searchParams.get("tab") as any) || undefined;
        nav({ to: "/my/jobs", search: { id: searchId, tab: searchTab } as any });
      } catch {
        nav({ to: "/my/jobs" as any });
      }
    } else if (targetLink.startsWith("/notifications/")) {
      const id = targetLink.replace("/notifications/", "");
      nav({ to: "/notifications/$id", params: { id } });
    } else if (targetLink.startsWith("/")) {
      nav({ to: targetLink as any });
    } else {
      window.location.href = targetLink;
    }
  };

  const filteredList = notifications.filter((n) => {
    if (tab !== "all") {
      if (tab === "listings" && (n.type === "listings" || n.type === "listing_moderation")) return true;
      if (tab === "nearby_changes" && (n.type === "nearby_changes" || n.title.toLowerCase().includes("nearby"))) return true;
      if (tab === "job_application" && (n.type === "job_application" || n.type === "jobs" || n.title.toLowerCase().includes("job"))) return true;
      if (n.type !== tab) return false;
    }
    if (unreadOnly && n.isRead) return false;
    return true;
  });

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 font-sans">
        <BackBar
          title="Notifications"
          right={
            <button className="text-xs font-semibold text-primary hover:underline" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          }
        />

        <div className="flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              aria-pressed={tab === c.id}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1 text-xs font-bold transition-all",
                tab === c.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between px-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            Show unread only ({unreadCount})
          </label>
        </div>

        <div className="mt-3 divide-y divide-border/80">
          {loading ? (
            <InfinityLoader
              size="md"
              text="Loading notifications..."
              variant="section"
            />
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              You're all caught up. No notifications found.
            </div>
          ) : (
            filteredList.map((n) => {
              const Icon = ICON[n.type] || Bell;
              const isNearby = n.type === "nearby_changes" || n.title.toLowerCase().includes("nearby");
              const isListing = n.type === "listings" || n.type === "listing_moderation" || n.link?.startsWith("/product/");
              const isJob = n.type === "job_application" || n.type === "jobs" || n.title.toLowerCase().includes("job");

              return (
                <div
                  key={n.id}
                  onClick={(e) => handleNotifClick(n, e)}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary/60 relative",
                    !n.isRead && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  {/* Thumbnail image or category icon */}
                  {n.thumbnail ? (
                    <div className="relative h-12 w-12 shrink-0 rounded-2xl overflow-hidden border border-border/80 bg-muted shadow-xs">
                      <img
                        src={n.thumbnail}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      {isNearby && (
                        <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[8px] font-black text-center py-0.5 uppercase tracking-tighter">
                          Nearby
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105",
                      isNearby ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" : "bg-primary/10 text-primary"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isNearby && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9.5px] font-black text-amber-700 shrink-0">
                            <Radio className="h-2.5 w-2.5 animate-pulse" /> Nearby Change
                          </span>
                        )}
                        <p className={cn("truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors", !n.isRead && "font-black")}>
                          {n.title}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                    
                    <div className="mt-2.5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => handleNotifClick(n, e)}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-primary group-hover:translate-x-1 transition-transform"
                      >
                        <span>{isNearby || isListing ? "View Listing" : isJob ? "View Job Application" : "View Details"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" title="Unread notification" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
