import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { EmptyState } from "@/components/omeetso/EmptyState";
import {
  Search, MessageCircle, ShieldCheck, BellOff, VolumeX, X, HandCoins,
  Archive as ArchiveIcon, BadgeCheck, Store as StoreIcon, MoreVertical, ArrowLeft,
  WifiOff, Loader2,
} from "lucide-react";
import { formatINR } from "@/lib/mock";
import { toast } from "sonner";
import { useChatContext, type ConnectionStatus } from "@/contexts/ChatProvider";
import { conversationToThread } from "@/lib/chat-adapter";
import { formatChatTime, isMuted, isBlocked, isArchived } from "@/lib/chat";
import type { ConversationItem } from "@/api/chat.api";

export const Route = createFileRoute("/chats")({
  head: () => ({
    meta: [
      { title: "Chats — Omeetso" },
      { name: "description", content: "Buying, selling and store conversations on Omeetso." },
    ],
  }),
  component: Chats,
});

type Tab = "Buying" | "Selling" | "Stores" | "Archived";
const TABS: Tab[] = ["Buying", "Selling", "Stores", "Archived"];

function Chats() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("Buying");
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    conversations,
    conversationsLoading,
    conversationsError,
    loadConversations,
    status: connectionStatus,
  } = useChatContext();

  // Load conversations from MongoDB on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Convert API conversations to Thread-compatible objects for the UI
  const threads = useMemo(
    () => conversations.map((c) => conversationToThread(c)),
    [conversations]
  );

  const filtered = useMemo(() => {
    let list = threads.slice();
    if (tab === "Archived") list = list.filter((t) => isArchived(t.id));
    else {
      list = list.filter((t) => !isArchived(t.id));
      if (tab === "Buying") list = list.filter((t) => t.role === "buying");
      if (tab === "Selling") list = list.filter((t) => t.role === "selling");
      if (tab === "Stores") list = list.filter((t) => t.role === "store");
    }
    if (unreadOnly) list = list.filter((t) => t.unread > 0);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((t) =>
        t.peerName.toLowerCase().includes(s) ||
        (t.lastMessagePreview ?? "").toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threads, tab, q, unreadOnly]);

  const counts = {
    Buying: threads.filter((t) => t.role === "buying" && !isArchived(t.id)).length,
    Selling: threads.filter((t) => t.role === "selling" && !isArchived(t.id)).length,
    Stores: threads.filter((t) => t.role === "store" && !isArchived(t.id)).length,
    Archived: threads.filter((t) => isArchived(t.id)).length,
  };

  // On desktop, auto-navigate to first conversation
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      const first = threads.filter((t) => !isArchived(t.id)).sort((a, b) => b.updatedAt - a.updatedAt)[0];
      if (first) nav({ to: "/chat/$id", params: { id: first.id }, replace: true });
    }
  }, [threads, nav]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        {/* Connection status banner */}
        {connectionStatus === "error" && (
          <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive">
            <WifiOff className="h-3.5 w-3.5" />
            Connection lost. Retrying…
          </div>
        )}

        {/* Header — mobile only */}
        {!searchOpen ? (
          <header className="gradient-brand px-4 pt-3 pb-4 text-white safe-t md:hidden">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold">Chats</h1>
                <p className="text-[11px] text-white/80">Connect with nearby buyers, sellers and stores.</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label={unreadOnly ? "Show all" : "Show unread only"}
                  onClick={() => setUnreadOnly((v) => !v)}
                  className={`grid h-9 w-9 place-items-center rounded-full ${unreadOnly ? "bg-yellow-brand text-navy" : "bg-white/15 text-white"}`}
                >
                  <BellOff className="h-4 w-4" />
                </button>
                <button aria-label="Search chats" onClick={() => setSearchOpen(true)} className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
                  <Search className="h-4 w-4" />
                </button>
                <button aria-label="More" onClick={() => nav({ to: "/offers" })} className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
                  <HandCoins className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>
        ) : (
          <header className="flex items-center gap-2 border-b border-border bg-card px-3 py-3 safe-t md:hidden">
            <button onClick={() => { setSearchOpen(false); setQ(""); }} aria-label="Close search" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-secondary px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by seller, store, product or message"
                aria-label="Search chats"
                className="flex-1 bg-transparent text-sm outline-none"
              />
              {q && (
                <button aria-label="Clear search" onClick={() => setQ("")} className="rounded-full p-1 text-muted-foreground hover:bg-card">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </header>
        )}

        {/* Desktop title + toolbar */}
        <div className="hidden md:block border-b border-border bg-card">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-6">
            <div className="min-w-0">
              <nav className="text-xs text-muted-foreground">
                <Link to="/home" className="hover:text-foreground">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">Chats</span>
              </nav>
              <h1 className="mt-1 text-3xl font-black tracking-tight">Chats</h1>
              <p className="mt-1 text-sm text-muted-foreground">Buying, selling and store conversations in one place.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 w-72">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search chats"
                  aria-label="Search chats"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                {q && (
                  <button aria-label="Clear search" onClick={() => setQ("")} className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setUnreadOnly((v) => !v)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold ${unreadOnly ? "border-navy bg-navy text-white" : "border-border bg-background text-foreground hover:bg-secondary"}`}
              >
                Unread only
              </button>
              <button
                onClick={() => nav({ to: "/offers" })}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-secondary"
              >
                <HandCoins className="h-4 w-4" /> Offers
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {!searchOpen && (
          <div className="sticky top-0 z-10 border-b border-border bg-card md:top-16">
            <div className="flex gap-1 overflow-x-auto px-2 md:mx-auto md:max-w-[1100px] md:px-6">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${tab === t ? "border-navy text-navy" : "border-transparent text-muted-foreground"}`}
                >
                  {t} {counts[t] > 0 && <span className={`ml-1 rounded-full px-1.5 text-[10px] ${tab === t ? "bg-navy text-white" : "bg-secondary text-foreground"}`}>{counts[t]}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="md:mx-auto md:max-w-[1100px] md:px-6 md:py-6">
        {/* Safety card (only outside search + on Buying) */}
        {!searchOpen && tab === "Buying" && filtered.length > 0 && (
          <Link to="/chat/safety" className="mx-3 mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 md:mx-0 md:mt-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><ShieldCheck className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-emerald-900">Meet in public places</p>
              <p className="text-[11px] text-emerald-800">Inspect items before paying. Never share OTPs.</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-800">View tips</span>
          </Link>
        )}

        {/* Loading state */}
        {conversationsLoading && threads.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading conversations...</span>
          </div>
        )}

        {/* Error state */}
        {conversationsError && threads.length === 0 && (
          <div className="p-6 text-center">
            <WifiOff className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold">Could not load chats</p>
            <p className="mt-1 text-xs text-muted-foreground">{conversationsError}</p>
            <button
              onClick={loadConversations}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Retry
            </button>
          </div>
        )}

        {/* List */}
        {!conversationsLoading && !conversationsError && filtered.length === 0 ? (
          <EmptyStateFor tab={tab} hasQuery={!!q} />
        ) : !conversationsLoading && (
          <div className="mt-2 divide-y divide-border md:mt-4 md:overflow-hidden md:rounded-2xl md:border md:border-border md:divide-y">
            {filtered.map((t) => {
              const conv = conversations.find((c) => c.id === t.id);
              return <ChatCard key={t.id} t={t} conv={conv} />;
            })}
          </div>
        )}
        </div>


        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function ChatCard({ t, conv }: { t: ReturnType<typeof conversationToThread>; conv?: ConversationItem }) {
  const muted = isMuted(t.id);
  const blocked = isBlocked(t.peerId);

  const statusChip = (() => {
    if (blocked) return { text: "Blocked", cls: "bg-red-100 text-red-800" };
    return null;
  })();

  return (
    <Link to="/chat/$id" params={{ id: t.id }} className="flex items-center gap-3 bg-card px-3 py-3 active:bg-muted">
      <div className="relative">
        {conv?.listingImage ? (
          <img src={conv.listingImage} alt="" className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary"><MessageCircle className="h-5 w-5" /></div>
        )}
        {t.peerType === "store" && (
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-navy text-white">
            <StoreIcon className="h-2.5 w-2.5" />
          </span>
        )}
        {t.online && !t.peerType.includes("store") && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate text-sm font-semibold">{t.peerName}</p>
            {t.peerVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Verified" />}
            {muted && <VolumeX className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Muted" />}
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">{formatChatTime(t.updatedAt)}</span>
        </div>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">
          {conv?.listingTitle ? `${conv.listingTitle} · ${formatINR(conv.listingPriceInPaise / 100)}` : ""}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="line-clamp-1 flex-1 text-xs text-foreground">{t.lastMessagePreview ?? "Start the conversation"}</p>
          {statusChip && (
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusChip.cls}`}>
              {statusChip.text}
            </span>
          )}
        </div>
      </div>
      {t.unread > 0 && !muted && (
        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-navy px-1.5 text-[10px] font-bold text-white">{t.unread}</span>
      )}
    </Link>
  );
}

function EmptyStateFor({ tab, hasQuery }: { tab: Tab; hasQuery: boolean }) {
  if (hasQuery) {
    return (
      <EmptyState
        icon={<Search className="h-6 w-6 text-primary" />}
        title="No conversations found"
        body="Try searching by seller, store or product name."
      />
    );
  }
  const config: Record<Tab, { title: string; body: string; cta?: { to: "/home" | "/listings"; label: string } }> = {
    Buying: { title: "No buying conversations yet", body: "Chat with sellers when you find something you like.", cta: { to: "/home", label: "Explore products" } },
    Selling: { title: "No selling conversations yet", body: "Buyers will appear here when they message about your listings.", cta: { to: "/listings", label: "View my listings" } },
    Stores: { title: "No store conversations yet", body: "Message a nearby store to ask about products, delivery or pickup.", cta: { to: "/home", label: "Browse stores" } },
    Archived: { title: "No archived chats", body: "Archived conversations will appear here." },
  };
  const c = config[tab];
  return (
    <div className="p-6">
      <EmptyState
        icon={tab === "Archived" ? <ArchiveIcon className="h-6 w-6 text-primary" /> : <MessageCircle className="h-6 w-6 text-primary" />}
        title={c.title}
        body={c.body}
      />
      {c.cta && (
        <div className="mt-4 flex justify-center">
          <Link to={c.cta.to} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
            {c.cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
