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
  MessageSquare, HandCoins, Package, Store, Megaphone, CreditCard, ShieldCheck, Bell, Loader2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATS = [
  { id: "all", label: "All" },
  { id: "chat_message", label: "Messages" },
  { id: "offer_received", label: "Offers" },
  { id: "offer_status", label: "Offer Status" },
  { id: "system", label: "System" },
];

const ICON: Record<string, any> = {
  chat_message: MessageSquare,
  offer_received: HandCoins,
  offer_status: HandCoins,
  listing_moderation: Package,
  store_moderation: Store,
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
    const res = await getNotificationsApi(1, 50);
    setLoading(false);
    if (res.success && res.data && res.data.length > 0) {
      setNotifications(res.data);
      if (typeof res.unreadCount === "number") setUnreadCount(res.unreadCount);
    } else {
      // Local fallback notifications if API has no notifications
      const local = listNotifications();
      const mapped: NotificationItem[] = local.map((n) => ({
        id: n.id,
        type: n.category || "system",
        title: n.title,
        body: n.body,
        link: n.destination || `/notifications/${n.id}`,
        isRead: Boolean(n.read),
        createdAt: new Date(n.time).toISOString(),
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter((item) => !item.isRead).length);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
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
    const targetLink = n.link || `/notifications/${n.id}`;

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
    if (tab !== "all" && n.type !== tab) return false;
    if (unreadOnly && n.isRead) return false;
    return true;
  });

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
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
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-xs text-muted-foreground">Loading notifications...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              You're all caught up. No notifications found.
            </div>
          ) : (
            filteredList.map((n) => {
              const Icon = ICON[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  onClick={(e) => handleNotifClick(n, e)}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary/60 relative",
                    !n.isRead && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors", !n.isRead && "font-black")}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => handleNotifClick(n, e)}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-primary group-hover:translate-x-1 transition-transform"
                      >
                        <span>View Details</span>
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
