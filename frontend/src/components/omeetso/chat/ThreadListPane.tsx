import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, MessageCircle, VolumeX, BadgeCheck, Store as StoreIcon, X, Loader2, WifiOff } from "lucide-react";
import { isMuted, isBlocked, isArchived, formatChatTime } from "@/lib/chat";
import { formatINR } from "@/lib/mock";
import { useChatContext } from "@/contexts/ChatProvider";
import { conversationToThread } from "@/lib/chat-adapter";
import type { ConversationItem } from "@/api/chat.api";

type Tab = "Buying" | "Selling" | "Stores" | "Archived";
const TABS: Tab[] = ["Buying", "Selling", "Stores", "Archived"];

export function ThreadListPane({ activeId }: { activeId?: string }) {
  const [tab, setTab] = useState<Tab>("Buying");
  const [q, setQ] = useState("");

  const {
    conversations,
    conversationsLoading,
    conversationsError,
    loadConversations,
  } = useChatContext();

  useEffect(() => {
    if (conversations.length === 0) {
      loadConversations();
    }
  }, [conversations.length, loadConversations]);

  const threads = useMemo(
    () => conversations.map((c) => conversationToThread(c)),
    [conversations]
  );

  // Auto-switch tab to match active thread's role
  useEffect(() => {
    if (!activeId) return;
    const t = threads.find((x) => x.id === activeId);
    if (!t) return;
    if (isArchived(t.id)) setTab("Archived");
    else if (t.role === "buying") setTab("Buying");
    else if (t.role === "selling") setTab("Selling");
    else if (t.role === "store") setTab("Stores");
  }, [activeId, threads]);

  const filtered = useMemo(() => {
    let list = threads.slice();
    if (tab === "Archived") list = list.filter((t) => isArchived(t.id));
    else {
      list = list.filter((t) => !isArchived(t.id));
      if (tab === "Buying") list = list.filter((t) => t.role === "buying");
      if (tab === "Selling") list = list.filter((t) => t.role === "selling");
      if (tab === "Stores") list = list.filter((t) => t.role === "store");
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((t) =>
        t.peerName.toLowerCase().includes(s) ||
        (t.lastMessagePreview ?? "").toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threads, tab, q]);

  const counts = {
    Buying: threads.filter((t) => t.role === "buying" && !isArchived(t.id)).length,
    Selling: threads.filter((t) => t.role === "selling" && !isArchived(t.id)).length,
    Stores: threads.filter((t) => t.role === "store" && !isArchived(t.id)).length,
    Archived: threads.filter((t) => isArchived(t.id)).length,
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="border-b border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-black tracking-tight">Chats</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="flex-1 bg-transparent text-xs outline-none"
          />
          {q && (
            <button aria-label="Clear" onClick={() => setQ("")} className="rounded-full p-0.5 text-muted-foreground hover:bg-secondary">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-0.5 overflow-x-auto border-b border-border px-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-2.5 py-2.5 text-xs font-semibold ${tab === t ? "border-navy text-navy" : "border-transparent text-muted-foreground"}`}
          >
            {t}
            {counts[t] > 0 && (
              <span className={`ml-1 rounded-full px-1.5 text-[10px] ${tab === t ? "bg-navy text-white" : "bg-secondary text-foreground"}`}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversationsLoading && threads.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : conversationsError && threads.length === 0 ? (
          <div className="p-6 text-center">
            <WifiOff className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold">Could not load chats</p>
            <button onClick={loadConversations} className="mt-2 text-xs font-bold text-primary">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold">No conversations</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Chats will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => {
              const conv = conversations.find((c) => c.id === t.id);
              return (
                <li key={t.id}>
                  <ThreadRow t={t} conv={conv} active={t.id === activeId} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ThreadRow({ t, conv, active }: { t: ReturnType<typeof conversationToThread>; conv?: ConversationItem; active: boolean }) {
  const muted = isMuted(t.id);
  const blocked = isBlocked(t.peerId);

  const statusChip = (() => {
    if (blocked) return { text: "Blocked", cls: "bg-red-100 text-red-800" };
    return null;
  })();

  return (
    <Link
      to="/chat/$id"
      params={{ id: t.id }}
      className={`flex items-start gap-3 px-3 py-3 transition-colors ${active ? "bg-navy/[0.06]" : "hover:bg-secondary/60"}`}
    >
      <div className="relative shrink-0">
        {conv?.listingImage ? (
          <img src={conv.listingImage} alt="" className="h-10 w-10 rounded-xl object-cover" />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
            <MessageCircle className="h-4 w-4" />
          </div>
        )}
        {t.peerType === "store" && (
          <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border-2 border-card bg-navy text-white">
            <StoreIcon className="h-2 w-2" />
          </span>
        )}
        {t.online && !t.peerType.includes("store") && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <p className={`truncate text-[13px] ${active ? "font-bold text-navy" : "font-semibold"}`}>{t.peerName}</p>
            {t.peerVerified && <BadgeCheck className="h-3 w-3 shrink-0 text-primary" />}
            {muted && <VolumeX className="h-3 w-3 shrink-0 text-muted-foreground" />}
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">{formatChatTime(t.updatedAt)}</span>
        </div>
        {conv && <p className="line-clamp-1 text-[10px] text-muted-foreground">{conv.listingTitle} · {conv.listingPriceInPaise ? formatINR(conv.listingPriceInPaise / 100) : ""}</p>}
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="line-clamp-1 flex-1 text-[11px] text-foreground/80">{t.lastMessagePreview ?? "Start the conversation"}</p>
          {statusChip && (
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusChip.cls}`}>{statusChip.text}</span>
          )}
          {t.unread > 0 && !muted && (
            <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-navy px-1 text-[9px] font-bold text-white">{t.unread}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
