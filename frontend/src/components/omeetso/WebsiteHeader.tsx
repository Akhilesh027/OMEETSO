import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, Heart, MessageCircle, Bell, User, MapPin, Plus, ChevronDown, Zap, X, Clock, TrendingUp, Sparkles, ArrowRight, CheckCheck, MessageSquare, HandCoins, Package, Store, ShieldCheck } from "lucide-react";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { NOTIFICATIONS, CATEGORIES, PRODUCTS, formatINR } from "@/lib/mock";
import { getSaved, getRecentSearches, addRecentSearch, subscribe as subscribeSaved } from "@/lib/saved";
import { getThreads, subscribe as subscribeChat, seedIfEmpty } from "@/lib/chat";
import { listNotifications, markRead, markAllRead } from "@/lib/account";
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi, type NotificationItem } from "@/api/notifications.api";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/omeetso/Logo";
import { LocationModal } from "@/components/omeetso/LocationModal";

type SavedLocation = { area: string; pincode: string };

const secondaryNav = [
  { id: "cars", label: "Cars" },
  { id: "bikes", label: "Bikes" },
  { id: "mobiles", label: "Mobiles" },
  { id: "electronics", label: "Electronics" },
  { id: "furniture", label: "Furniture" },
  { id: "properties", label: "Properties" },
  { id: "fashion", label: "Fashion" },
  { id: "appliances", label: "Home Appliances" },
  { id: "jobs", label: "Jobs" },
  { id: "services", label: "Services" },
];

const TRENDING_KEYWORDS = ["iPhone 15", "Used Cars", "Bikes", "MacBook Pro", "Sofa Set", "RE Bullet 350", "Gaming PC"];

const NOTIF_ICON_MAP: Record<string, any> = {
  chat_message: MessageSquare,
  offer_received: HandCoins,
  offer_status: HandCoins,
  listing_moderation: Package,
  store_moderation: Store,
  system: ShieldCheck,
  offers: HandCoins,
  listings: Package,
  stores: Store,
};

export function WebsiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const [loc, setLoc] = useState<SavedLocation | null>(null);
  const [q, setQ] = useState("");
  const [showLocModal, setShowLocModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<NotificationItem[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Load Header Notifications
  const loadHeaderNotifs = useCallback(async () => {
    const res = await getNotificationsApi(1, 10);
    if (res.success && res.data && res.data.length > 0) {
      setNotifList(res.data);
    } else {
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
      setNotifList(mapped);
    }
  }, []);

  useEffect(() => {
    loadHeaderNotifs();
  }, [loadHeaderNotifs]);

  const unreadNotifCount = useMemo(() => {
    return notifList.filter((n) => !n.isRead).length;
  }, [notifList]);

  // Click outside to close notification modal popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const handleHeaderNotifClick = async (n: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifOpen(false);

    // Update model state
    setNotifList((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
    );
    markNotificationReadApi(n.id);
    markRead(n.id, true);

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

  const handleHeaderMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllRead();
    await markAllNotificationsReadApi();
    setNotifList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Exact unread chats count from local storage
  useEffect(() => {
    seedIfEmpty();
    const updateChatCount = () => {
      const threads = getThreads();
      const totalUnread = threads.reduce((acc, t) => acc + (t.unread || 0), 0);
      setUnreadChats(totalUnread);
    };
    updateChatCount();
    const unsubChat = subscribeChat(updateChatCount);
    return unsubChat;
  }, []);

  // Scroll listener for header transformation with hysteresis
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 60) {
        setScrolled(true);
      } else if (currentY < 15) {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic saved items subscription
  useEffect(() => {
    setSavedCount(getSaved().length);
    const unsubscribeSaved = subscribeSaved(() => {
      setSavedCount(getSaved().length);
    });
    return unsubscribeSaved;
  }, []);

  // Load saved location
  useEffect(() => {
    try {
      const raw = localStorage.getItem("omeetso_selected_location") || localStorage.getItem("omeetso_location");
      if (raw) {
        const p = JSON.parse(raw) as Partial<SavedLocation>;
        if (p.area && p.pincode) setLoc({ area: p.area, pincode: p.pincode });
      }
    } catch { /* noop */ }
  }, [path, showLocModal]);

  // Click outside to close search overlay
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Matching live product previews
  const searchMatches = useMemo(() => {
    if (!q.trim()) return [];
    const queryLower = q.toLowerCase();
    return PRODUCTS.filter(
      (p) => p.title.toLowerCase().includes(queryLower) || p.category.toLowerCase().includes(queryLower)
    ).slice(0, 3);
  }, [q]);

  const recentSearches = getRecentSearches();

  // Hide on auth/onboarding routes
  const hideOn = ["/", "/language", "/onboarding", "/welcome", "/login", "/otp", "/profile-setup", "/location", "/register"];
  if (hideOn.includes(path)) return null;

  const handleSearchSubmit = (searchTerm?: string) => {
    const targetQ = searchTerm !== undefined ? searchTerm : q;
    if (targetQ.trim()) {
      addRecentSearch(targetQ.trim());
      setSearchFocused(false);
      nav({ to: "/results", search: { q: targetQ.trim() } as never });
    }
  };

  return (
    <header
      className={cn(
        "hidden md:block sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-transparent px-4 sm:px-6 pt-3 pb-1.5"
          : "bg-card/95 border-b border-border/80 backdrop-blur-md px-0 py-0"
      )}
    >
      {/* Dynamic Navbar Card (Full Width at Top -> Spacious Floating Bar when Scrolled) */}
      <div
        className={cn(
          "mx-auto transition-all duration-300",
          scrolled
            ? "max-w-[1280px] rounded-3xl border border-border/80 bg-card/95 dark:bg-card/95 backdrop-blur-xl shadow-lg shadow-navy/5 py-3 px-5 sm:px-6"
            : "max-w-[1440px] rounded-none border-none bg-transparent shadow-none px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-3.5"
        )}
      >
        <div className="flex items-center gap-3.5 lg:gap-5">
          
          {/* Logo - Prominent & clear */}
          <Link to="/home" className="flex items-center shrink-0 pr-1">
            <Logo size="md" />
          </Link>

          {/* GPS & Location Button */}
          <button
            type="button"
            onClick={() => setShowLocModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface-2/80 hover:bg-surface-2 px-3.5 py-2 text-xs lg:text-sm font-medium text-foreground shrink-0 max-w-[170px] lg:max-w-[230px] transition-all shadow-2xs"
          >
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate font-semibold">{loc ? `${loc.area}, ${loc.pincode}` : "Set location"}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground ml-auto" />
          </button>

          <LocationModal
            open={showLocModal}
            onClose={() => setShowLocModal(false)}
            onSelect={(selected) => setLoc(selected)}
          />

          {/* Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[200px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className={cn(
                "flex items-center gap-2 rounded-2xl border border-border/80 bg-surface/80 px-4 py-2 text-xs lg:text-sm transition-all shadow-2xs",
                searchFocused ? "border-electric ring-2 ring-electric/20 bg-card" : "hover:border-border"
              )}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search cars, mobiles…"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                aria-label="Search Omeetso"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="submit"
                className="rounded-xl gradient-brand px-3 py-1 text-xs font-bold text-white shadow-xs hover:brightness-110 transition shrink-0"
              >
                Search
              </button>
            </form>

            {/* Instant Search Dropdown Box */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border bg-card/98 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                {q.trim() ? (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Matching Products & Categories
                    </p>
                    {searchMatches.length > 0 ? (
                      <div className="space-y-2">
                        {searchMatches.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSearchFocused(false);
                              nav({ to: "/product/$id", params: { id: item.id } as never });
                            }}
                            className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/80 cursor-pointer transition"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate text-foreground">{item.title}</p>
                              <p className="text-[11px] text-muted-foreground">{item.area} • {item.category}</p>
                            </div>
                            <span className="text-xs font-extrabold text-navy shrink-0">{formatINR(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">No direct product matches. Press Enter to search everywhere.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-navy mb-2">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                        <span>Trending Searches Nearby</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_KEYWORDS.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => {
                              setQ(kw);
                              handleSearchSubmit(kw);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500" /> {kw}
                          </button>
                        ))}
                      </div>
                    </div>

                    {recentSearches.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Recent Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.slice(0, 5).map((kw) => (
                            <button
                              key={kw}
                              type="button"
                              onClick={() => {
                                setQ(kw);
                                handleSearchSubmit(kw);
                              }}
                              className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition"
                            >
                              {kw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons & Real-time Badges */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <IconLink to="/saved" label="Saved" badge={savedCount}>
              <Heart className="h-4.5 w-4.5" />
            </IconLink>
            <IconLink to="/chats" label="Chats" badge={unreadChats}>
              <MessageCircle className="h-4.5 w-4.5" />
            </IconLink>
            {/* Notification Modal Popover Trigger */}
            <div ref={notifContainerRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifications"
                className="relative grid h-9.5 w-9.5 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadNotifCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                    <span className="absolute h-4 w-4 rounded-full bg-amber-400 opacity-75 animate-ping" />
                    <span className="relative grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950 shadow-xs border border-amber-300">
                      {unreadNotifCount}
                    </span>
                  </span>
                ) : null}
              </button>

              {/* Notification Popover Dropdown Modal */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2.5 z-50 w-80 sm:w-96 rounded-3xl border border-border bg-card/98 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-extrabold text-foreground">Notifications</h3>
                      {unreadNotifCount > 0 && (
                        <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black">
                          {unreadNotifCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={handleHeaderMarkAllRead}
                        className="text-[11px] font-extrabold text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Mark read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-border/60 no-scrollbar space-y-1">
                    {notifList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        <Bell className="mx-auto mb-2 h-7 w-7 text-muted-foreground/30" />
                        No notifications yet.
                      </div>
                    ) : (
                      notifList.slice(0, 5).map((n) => {
                        const Icon = NOTIF_ICON_MAP[n.type] || Bell;
                        return (
                          <div
                            key={n.id}
                            onClick={(e) => handleHeaderNotifClick(n, e)}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 p-2.5 rounded-2xl transition-all hover:bg-secondary/70 group",
                              !n.isRead && "bg-primary/5 border-l-2 border-l-primary"
                            )}
                          >
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className={cn("truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors", !n.isRead && "font-black")}>
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground leading-snug">{n.body}</p>
                              <div className="mt-1.5 flex items-center justify-between">
                                <span className="text-[9px] font-semibold text-muted-foreground">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-primary group-hover:translate-x-0.5 transition-transform">
                                  <span>View Details</span>
                                  <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer: View All Notifications */}
                  <div className="mt-3 pt-2.5 border-t border-border/70 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="inline-flex items-center justify-center gap-1.5 w-full rounded-2xl bg-secondary hover:bg-primary hover:text-white text-xs font-extrabold text-primary py-2 transition-all shadow-2xs"
                    >
                      <span>View All Notifications</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <IconLink to="/account" label="Account">
              <User className="h-4.5 w-4.5" />
            </IconLink>

            {/* Quick Deals & Sell Actions — Icons when scrolled, full buttons at top */}
            {scrolled ? (
              <div className="flex items-center gap-1.5 pl-1">
                <Link
                  to="/results"
                  search={{ quickSale: "1" } as any}
                  className="grid h-8.5 w-8.5 place-items-center rounded-full bg-amber-500 text-slate-950 shadow-xs hover:scale-110 active:scale-95 transition-transform"
                  title="Quick Deals"
                >
                  <Zap className="h-4 w-4 fill-slate-950" />
                </Link>
                <Link
                  to="/sell"
                  className="grid h-8.5 w-8.5 place-items-center rounded-full gradient-brand text-white shadow-md hover:scale-110 active:scale-95 transition-transform"
                  title="Sell Now"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-1">
                <Link
                  to="/results"
                  search={{ quickSale: "1" } as any}
                  className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-slate-950 px-3.5 py-1.5 text-xs font-extrabold shadow-sm hover:bg-amber-400 transition-all border border-amber-300"
                >
                  <Zap className="h-3.5 w-3.5 fill-slate-950" /> Quick Deals
                </Link>
                <Link
                  to="/sell"
                  className="inline-flex items-center gap-1.5 rounded-full gradient-brand px-4 py-2 text-xs lg:text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" /> Sell Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Secondary category strip — smoothly collapses on scroll without flickering */}
        <nav
          className={cn(
            "flex items-center gap-2 overflow-x-auto no-scrollbar transition-all duration-300 ease-in-out",
            scrolled
              ? "max-h-0 opacity-0 pointer-events-none mt-0 pt-0 border-t-0"
              : "max-h-16 opacity-100 mt-2.5 pt-2.5 pb-0.5 border-t border-border/40"
          )}
        >
          <Link
            to="/results"
            className="whitespace-nowrap rounded-full bg-indigo-brand text-white px-3.5 py-1 text-xs font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 shrink-0"
          >
            <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Quick Deals
          </Link>
          {secondaryNav.map((c) => {
            let to = "/categories";
            let params: any = undefined;

            if (c.id === "jobs") {
              to = "/jobs";
            } else if (c.id === "services") {
              to = "/services";
            } else if (CATEGORIES.some((x) => x.id === c.id)) {
              to = "/category/$id";
              params = { id: c.id };
            }

            return (
              <Link
                key={c.id}
                to={to as any}
                params={params as never}
                className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {c.label}
              </Link>
            );
          })}
          <Link to="/categories" className="ml-auto whitespace-nowrap rounded-full bg-navy/90 hover:bg-navy px-3.5 py-1 text-xs font-bold text-white shrink-0 transition">
            All Categories
          </Link>
        </nav>
      </div>
    </header>
  );
}

function IconLink({ to, label, badge, children }: { to: string; label: string; badge?: number; children: React.ReactNode }) {
  return (
    <Link
      to={to as never}
      aria-label={label}
      className={cn("relative grid h-9.5 w-9.5 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95")}
    >
      {children}
      {badge && badge > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
          <span className="absolute h-4 w-4 rounded-full bg-amber-400 opacity-75 animate-ping" />
          <span className="relative grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950 shadow-xs border border-amber-300">
            {badge}
          </span>
        </span>
      ) : null}
    </Link>
  );
}

