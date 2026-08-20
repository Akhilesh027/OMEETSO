import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  Phone, MoreVertical, Send, Smile, HandCoins, Paperclip, ArrowLeft,
  BadgeCheck, Search, VolumeX, Bell, Archive as ArchiveIcon, Ban, Flag, ShieldCheck,
  UserCircle2, Package, X, Trash2, Eraser, Loader2, WifiOff, Star,
} from "lucide-react";
import { ReviewModal } from "@/components/omeetso/chat/ReviewModal";
import { PRODUCTS, formatINR } from "@/lib/mock";
import {
  isMuted, muteThread, unmuteThread,
  archiveThread, isArchived, blockUser, unblockUser, isBlocked,
  isSafetyDismissed, dismissSafety,
  type Thread, type Offer,
} from "@/lib/chat";
import { MessageBubble } from "@/components/omeetso/chat/MessageBubble";
import { ThreadListPane } from "@/components/omeetso/chat/ThreadListPane";
import { MakeOfferSheet } from "@/components/omeetso/chat/MakeOfferSheet";
import { AttachmentSheet } from "@/components/omeetso/chat/AttachmentSheet";
import { ReportUserSheet } from "@/components/omeetso/chat/ReportUserSheet";
import { CallSheet } from "@/components/omeetso/chat/CallSheet";
import { ChatSafetyNotice } from "@/components/omeetso/chat/ChatSafetyNotice";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { toast } from "sonner";
import { useChatContext } from "@/contexts/ChatProvider";
import { groupMessagesByDay } from "@/lib/chat-adapter";

export const Route = createFileRoute("/chat/$id")({
  loader: ({ params }) => {
    return { threadId: params.id };
  },
  head: () => ({ meta: [{ title: "Chat — Omeetso" }] }),
  component: Conversation,
  notFoundComponent: () => <MobileFrame>
    <div className="min-h-dvh p-8 text-center">
      <p className="text-sm font-bold">Conversation unavailable</p>
      <p className="mt-1 text-xs text-muted-foreground">This chat may have been deleted.</p>
      <Link to="/chats" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Back to chats</Link>
    </div>
  </MobileFrame>,
});

const BUYER_SUGGESTIONS = [
  "Is this still available?", "What is your final price?", "Can I inspect it today?", "Is delivery available?", "Where can we meet?",
];
const SELLER_SUGGESTIONS = [
  "Yes, it is available.", "The price is negotiable.", "You can inspect it today.", "Pickup is available.", "Please send your offer.",
];
const STORE_SUGGESTIONS = [
  "This product is in stock.", "Delivery is available.", "Our store is open until 9 PM.", "You can visit the store today.", "Please share your area.",
];

function Conversation() {
  const nav = useNavigate();
  const { id } = Route.useParams();
  const [draft, setDraftState] = useState("");
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [suggestionsShown, setSuggestionsShown] = useState(true);
  const [offerOpen, setOfferOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMsgId, setReportMsgId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    status: connectionStatus,
    conversations,
    messages: messagesMap,
    messagesLoading,
    hasMore,
    typingUsers,
    loadConversations,
    loadMessages,
    loadMoreMessages,
    sendTextMessage,
    respondToOffer,
    markAsRead,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
  } = useChatContext();

  // Find current conversation
  const conversation = conversations.find((c) => c.id === id);
  const messages = messagesMap.get(id) || [];
  const isLoading = messagesLoading.get(id) ?? false;
  const canLoadMore = hasMore.get(id) ?? false;
  const isTyping = typingUsers.has(id);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load conversations if not loaded yet
  useEffect(() => {
    if (conversations.length === 0) {
      loadConversations();
    }
  }, [conversations.length, loadConversations]);

  // Join room + load messages on mount
  useEffect(() => {
    joinRoom(id);
    loadMessages(id);
    markAsRead(id);

    return () => {
      leaveRoom(id);
    };
  }, [id, joinRoom, leaveRoom, loadMessages, markAsRead]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // Build a pseudo-thread from conversation data for UI compatibility
  const thread: Thread | null = conversation
    ? {
        id: conversation.id,
        productId: conversation.contextId,
        role: conversation.contextType === "STORE" ? "store" as const : "buying" as const,
        peerType: conversation.contextType === "STORE" ? "store" as const : "user" as const,
        peerId: conversation.otherParty.id,
        peerName: conversation.otherParty.name,
        peerAvatar: conversation.otherParty.avatar,
        peerVerified: false,
        online: false,
        lastActive: undefined,
        createdAt: new Date(conversation.lastMessageAt).getTime(),
        updatedAt: new Date(conversation.lastMessageAt).getTime(),
        unread: conversation.unreadCount,
        lastMessagePreview: conversation.lastMessagePreview,
        status: "active" as const,
      }
    : null;

  const product = thread ? PRODUCTS.find((p) => p.id === thread.productId) : null;
  const iAmSeller = thread?.role === "selling";
  const blocked = thread ? isBlocked(thread.peerId) : false;
  const muted = thread ? isMuted(thread.id) : false;
  const archived = thread ? isArchived(thread.id) : false;
  const listingUnavailable = product?.sold || product?.unavailable;
  const showSafety = thread ? !isSafetyDismissed(thread.id) : false;

  const suggestions = thread?.role === "buying" ? BUYER_SUGGESTIONS : thread?.role === "store" ? STORE_SUGGESTIONS : SELLER_SUGGESTIONS;

  // ── Send message via API + Socket ──
  const send = useCallback(async (text?: string) => {
    const body = (text ?? draft).trim();
    if (!body) return;
    if (blocked) return toast.error("You blocked this user. Unblock to send messages.");
    if (body.length > 2000) return toast.error("Message too long (max 2000 characters).");

    await sendTextMessage(id, body);
    setDraftState("");
    setSuggestionsShown(false);
  }, [draft, blocked, id, sendTextMessage]);

  const onDraftChange = (v: string) => {
    setDraftState(v);
    // Emit typing indicator
    if (thread && v.trim()) {
      startTyping(id, thread.peerId);
    } else if (thread) {
      stopTyping(id, thread.peerId);
    }
  };

  // ── Local actions (still use localStorage for UI preferences) ──
  const doArchive = () => {
    if (!thread) return;
    archiveThread(thread.id, !archived);
    toast.success(archived ? "Conversation restored" : "Conversation archived");
    setMenuOpen(false);
    if (!archived) nav({ to: "/chats" });
  };
  const doMute = (hours: number | "always") => {
    if (!thread) return;
    muteThread(thread.id, hours);
    toast.success(hours === "always" ? "Notifications muted" : `Muted for ${hours}h`);
    setMenuOpen(false);
  };
  const doBlockToggle = () => {
    if (!thread) return;
    if (blocked) { unblockUser(thread.peerId); toast.success(`${thread.peerName} unblocked`); }
    else { blockUser(thread.peerId); toast.success(`${thread.peerName} blocked`); }
    setMenuOpen(false);
  };
  const doClear = () => {
    toast.success("Chat cleared from view");
    setConfirmClear(false);
  };
  const doDelete = () => {
    toast.success("Conversation deleted");
    nav({ to: "/chats" });
  };

  // ── Infinite scroll: load older messages ──
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || isLoading || !canLoadMore) return;
    if (el.scrollTop < 60) {
      loadMoreMessages(id);
    }
  }, [isLoading, canLoadMore, loadMoreMessages, id]);

  // Loading state
  if (!thread && conversations.length === 0) {
    return (
      <MobileFrame>
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading conversation...</span>
        </div>
      </MobileFrame>
    );
  }

  // Conversation not found after loading
  if (!thread) {
    return (
      <MobileFrame>
        <div className="min-h-dvh p-8 text-center">
          <p className="text-sm font-bold">Conversation unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">This chat may have been deleted or you don't have access.</p>
          <Link to="/chats" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Back to chats</Link>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="md:mx-auto md:flex md:min-h-[calc(100dvh-4rem)] md:max-w-[1280px] md:gap-0 md:px-6 md:py-6">
        <aside className="hidden md:block md:h-[calc(100dvh-6rem)] md:w-[320px] md:shrink-0 md:overflow-hidden md:rounded-l-2xl md:border md:border-r-0 md:border-border">
          <ThreadListPane activeId={id} />
        </aside>
        <div className="flex min-h-dvh flex-col bg-background md:min-h-0 md:flex-1 md:h-[calc(100dvh-6rem)] md:overflow-hidden md:rounded-r-2xl md:border md:border-border">

        {/* Connection status */}
        {connectionStatus === "error" && (
          <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
            <WifiOff className="h-3.5 w-3.5" />
            Connection lost. Messages may be delayed.
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card safe-t">
          <div className="flex items-center gap-2 px-2 py-2">
            <button aria-label="Back" onClick={() => nav({ to: "/chats" })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link
              to={thread.peerType === "store" ? "/store/$id" : "/seller/$id"}
              params={{ id: thread.peerId }}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              {thread.peerAvatar ? (
                <img src={thread.peerAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <UserCircle2 className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate text-sm font-bold">{thread.peerName}</p>
                  {thread.peerVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-label="Verified" />}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {blocked ? "Blocked" : isTyping ? "typing..." : connectionStatus === "connected" ? "Online" : "Offline"}
                </p>
              </div>
            </Link>
            <button
              aria-label="Rate and Review"
              onClick={() => setReviewOpen(true)}
              className="flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2.5 py-1 text-xs font-black hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xs"
              title="Rate and Review Seller/Store"
            >
              <Star className="h-3.5 w-3.5 fill-amber-400" /> Review
            </button>
            <button aria-label="Call" onClick={() => setCallOpen(true)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <Phone className="h-4 w-4" />
            </button>
            <button aria-label="More" onClick={() => setMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {product && (
            <div className="flex items-center gap-3 border-t border-border bg-card px-3 py-2">
              <img src={product.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <Link to="/product/$id" params={{ id: product.id }} className="truncate text-xs font-semibold">
                  {product.title}
                </Link>
                <p className="text-sm font-extrabold">
                  {formatINR(product.price)}
                  {product.negotiable && <span className="ml-1 text-[10px] font-medium text-muted-foreground">· Negotiable</span>}
                </p>
                <p className="text-[10px]">
                  {product.sold ? <span className="text-emerald-700 font-bold">Sold</span> :
                   product.unavailable ? <span className="text-muted-foreground">Listing unavailable</span> :
                   <span className="text-emerald-700">Available</span>}
                </p>
              </div>
              {!listingUnavailable && thread.role !== "selling" && (
                <button
                  onClick={() => setOfferOpen(true)}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold"
                >
                  <HandCoins className="h-3.5 w-3.5" /> Offer
                </button>
              )}
            </div>
          )}

          {/* Listing info when product not in mock data (MongoDB-only listing) */}
          {!product && conversation && (
            <div className="flex items-center gap-3 border-t border-border bg-card px-3 py-2">
              {conversation.listingImage ? (
                <img src={conversation.listingImage} alt="" className="h-11 w-11 rounded-xl object-cover" />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{conversation.listingTitle || "Listing"}</p>
                <p className="text-sm font-extrabold">
                  {conversation.listingPriceInPaise ? formatINR(conversation.listingPriceInPaise / 100) : ""}
                </p>
              </div>
            </div>
          )}
        </header>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 space-y-2"
        >
          {/* Load more indicator */}
          {canLoadMore && (
            <div className="flex justify-center py-2">
              <button
                onClick={() => loadMoreMessages(id)}
                className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-secondary/80"
              >
                Load older messages
              </button>
            </div>
          )}

          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-xs text-muted-foreground">Loading messages...</span>
            </div>
          )}

          {showSafety && (
            <ChatSafetyNotice onDismiss={() => { dismissSafety(thread.id); }} />
          )}

          {!isLoading && messages.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm font-bold">Say hello</p>
              <p className="mt-1 text-xs text-muted-foreground">Ask about condition, price or a meeting point.</p>
            </div>
          )}

          {groupMessagesByDay(messages).map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="mx-auto w-fit rounded-full bg-secondary px-3 py-1 text-[11px] text-muted-foreground">{group.label}</p>
              {group.items.map((m) => {
                if (m.type === "offer" && m.rawOffer) {
                  const isMine = m.from === "me";
                  const amount = m.rawOffer.amountInPaise / 100;
                  const status = m.rawOffer.status;
                  const offerId = m.rawOffer.id;

                  return (
                    <div key={m.id} className={`my-2 flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl border p-3 shadow-sm ${isMine ? "bg-navy/5 border-navy/30" : "bg-card border-border"}`}>
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-900">
                            <HandCoins className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                              {isMine ? "You sent an offer" : "Price Offer Received"}
                            </p>
                            <p className="truncate text-lg font-extrabold">{formatINR(amount)}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" :
                            status === "DECLINED" ? "bg-red-100 text-red-800" :
                            status === "CANCELLED" ? "bg-slate-100 text-slate-600" :
                            "bg-amber-100 text-amber-900"
                          }`}>
                            {status}
                          </span>
                        </div>

                        {m.text && <p className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs">"{m.text}"</p>}

                        {status === "PENDING" && !isMine && (
                          <div className="mt-3 flex gap-2 border-t border-border/60 pt-2">
                            <button
                              onClick={async () => {
                                try {
                                  await respondToOffer(offerId, "ACCEPT");
                                  toast.success("Offer accepted!");
                                  nav({ to: "/transaction/$offerId", params: { offerId } });
                                } catch { toast.error("Could not accept offer"); }
                              }}
                              className="flex-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              Accept Offer
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await respondToOffer(offerId, "DECLINE");
                                  toast("Offer declined");
                                  loadMessages(id);
                                } catch { toast.error("Could not decline offer"); }
                              }}
                              className="flex-1 rounded-xl border border-border py-1.5 text-xs font-bold hover:bg-secondary"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {status === "PENDING" && isMine && (
                          <div className="mt-3 border-t border-border/60 pt-2 flex justify-end">
                            <button
                              onClick={async () => {
                                try {
                                  await respondToOffer(offerId, "CANCEL");
                                  toast("Offer cancelled");
                                  loadMessages(id);
                                } catch { toast.error("Could not cancel offer"); }
                              }}
                              className="text-xs font-semibold text-destructive underline"
                            >
                              Cancel Offer
                            </button>
                          </div>
                        )}

                        {status === "ACCEPTED" && (
                          <div className="mt-2 border-t border-border/60 pt-2 flex justify-between items-center text-xs">
                            <span className="font-semibold text-emerald-700">✓ Offer Accepted</span>
                            <Link to="/transaction/$offerId" params={{ offerId }} className="font-bold text-navy underline">
                              View Settlement →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <MessageBubble
                    key={m.id} m={m}
                    onReport={(mid) => { setReportMsgId(mid); }}
                  />
                );
              })}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-card border border-border px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        {suggestionsShown && !blocked && !listingUnavailable && messages.filter((m) => m.from === "me").length < 2 && (
          <div className="flex gap-2 overflow-x-auto border-t border-border bg-card px-3 py-2 no-scrollbar">
            {suggestions.map((q) => (
              <button
                key={q} onClick={() => send(q)}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >{q}</button>
            ))}
          </div>
        )}

        {/* Composer or blocked banner */}
        {blocked ? (
          <div className="border-t border-border bg-card p-4 text-center safe-b">
            <p className="text-xs font-semibold text-destructive">You blocked {thread.peerName}</p>
            <button onClick={doBlockToggle} className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Unblock</button>
          </div>
        ) : listingUnavailable ? (
          <div className="border-t border-border bg-card p-4 text-center safe-b">
            <p className="text-xs font-semibold text-muted-foreground">
              {product?.sold ? "This listing has been marked as sold." : "Listing unavailable"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">You can still send final coordination messages.</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setAttachOpen(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border py-2 text-xs font-bold"
              >
                <Paperclip className="h-3.5 w-3.5" /> Attach
              </button>
              <button
                onClick={() => send("Thanks!")}
                className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground"
              >
                <Send className="h-3.5 w-3.5" /> Say thanks
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2 border-t border-border bg-card p-2 safe-b">
            <button aria-label="Attach" onClick={() => setAttachOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-secondary">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex flex-1 items-center gap-1 rounded-3xl border border-border bg-background px-3 py-1">
              <textarea
                value={draft}
                onChange={(e) => onDraftChange(e.target.value.slice(0, 2000))}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a message..."
                aria-label="Message"
                rows={1}
                className="max-h-24 flex-1 resize-none bg-transparent py-2 text-sm outline-none"
              />
              {draft.length > 1600 && (
                <span className="text-[10px] text-muted-foreground">{draft.length}/2000</span>
              )}
              <button aria-label="Emoji" className="grid h-8 w-8 place-items-center text-muted-foreground">
                <Smile className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => send()}
              aria-label="Send"
              disabled={!draft.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-white disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}

        {product && <MakeOfferSheet open={offerOpen} onClose={() => setOfferOpen(false)} product={product} threadId={thread.id} />}
        <AttachmentSheet open={attachOpen} onClose={() => setAttachOpen(false)} threadId={thread.id} />
        <CallSheet open={callOpen} onClose={() => setCallOpen(false)} threadId={thread.id} peerName={thread.peerName} peerType={thread.peerType} />
        <ReportUserSheet
          open={reportOpen || !!reportMsgId}
          onClose={() => { setReportOpen(false); setReportMsgId(null); }}
          peerId={thread.peerId} peerName={thread.peerName} threadId={thread.id}
          kind={reportMsgId ? "message" : "user"} messageId={reportMsgId ?? undefined}
        />
        <MoreMenu
          open={menuOpen} onClose={() => setMenuOpen(false)}
          thread={thread} muted={muted} archived={archived} blocked={blocked}
          onMute={doMute} onUnmute={() => { unmuteThread(thread.id); toast.success("Notifications on"); setMenuOpen(false); }}
          onArchive={doArchive} onBlock={doBlockToggle} onReport={() => { setMenuOpen(false); setReportOpen(true); }}
          onClear={() => { setMenuOpen(false); setConfirmClear(true); }}
          onDelete={() => { setMenuOpen(false); setConfirmDelete(true); }}
        />
        <ConfirmSheet
          open={confirmClear} onClose={() => setConfirmClear(false)}
          title="Clear this conversation?"
          body="Messages will be removed from this device. This action will not remove messages for the other person."
          confirm="Clear Chat" onConfirm={doClear}
        />
        <ConfirmSheet
          open={confirmDelete} onClose={() => setConfirmDelete(false)}
          title="Delete this conversation?"
          body="The conversation will be removed from your chat list. A new conversation may be created if either person sends another message."
          confirm="Delete Conversation" destructive onConfirm={doDelete}
        />
        <ReviewModal
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          targetId={thread.peerId}
          targetType={thread.peerType === "store" ? "STORE" : "SELLER"}
          targetName={thread.peerName}
          listingId={thread.productId}
        />
        </div>
      </div>
    </MobileFrame>
  );
}

function MoreMenu({
  open, onClose, thread, muted, archived, blocked,
  onMute, onUnmute, onArchive, onBlock, onReport, onClear, onDelete,
}: {
  open: boolean; onClose: () => void;
  thread: Thread; muted: boolean; archived: boolean; blocked: boolean;
  onMute: (h: number | "always") => void; onUnmute: () => void;
  onArchive: () => void; onBlock: () => void; onReport: () => void;
  onClear: () => void; onDelete: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Chat options">
      <div className="grid grid-cols-1 gap-1">
        <Row icon={UserCircle2} label={thread.peerType === "store" ? "View store" : "View seller profile"}
          to={thread.peerType === "store" ? "/store/$id" : "/seller/$id"} params={{ id: thread.peerId }} onNav={onClose} />
        <Row icon={Package} label="View product" to="/product/$id" params={{ id: thread.productId }} onNav={onClose} />
        <Row icon={Search} label="Search in conversation" onClick={() => { toast("Message search coming soon"); onClose(); }} />
        {muted ? (
          <Row icon={Bell} label="Unmute notifications" onClick={onUnmute} />
        ) : (
          <div>
            <p className="mt-2 px-2 text-[11px] font-semibold text-muted-foreground">Mute notifications</p>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {[1, 8, 24].map((h) => (
                <button key={h} onClick={() => onMute(h)} className="rounded-xl border border-border py-2 text-[11px] font-bold">{h}h</button>
              ))}
              <button onClick={() => onMute(24 * 7)} className="rounded-xl border border-border py-2 text-[11px] font-bold">1w</button>
              <button onClick={() => onMute("always")} className="col-span-2 rounded-xl border border-border py-2 text-[11px] font-bold">Until turned back on</button>
            </div>
          </div>
        )}
        <Row icon={ArchiveIcon} label={archived ? "Restore conversation" : "Archive chat"} onClick={onArchive} />
        <Row icon={Eraser} label="Clear chat" onClick={onClear} />
        <Row icon={ShieldCheck} label="Safety tips" to="/chat/safety" onNav={onClose} />
        <Row icon={Flag} label="Report user" onClick={onReport} />
        <Row icon={Ban} label={blocked ? "Unblock user" : "Block user"} destructive onClick={onBlock} />
        <Row icon={Trash2} label="Delete conversation" destructive onClick={onDelete} />
      </div>
    </BottomSheet>
  );
}

function Row({
  icon: Icon, label, onClick, to, params, onNav, destructive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; onClick?: () => void;
  to?: "/seller/$id" | "/store/$id" | "/product/$id" | "/chat/safety";
  params?: Record<string, string>; onNav?: () => void; destructive?: boolean;
}) {
  const cls = `flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-sm font-semibold hover:bg-secondary ${destructive ? "text-destructive" : ""}`;
  const content = <><Icon className="h-4 w-4" /> <span>{label}</span></>;
  if (to) {
    return (
      <Link to={to} params={params as never} onClick={onNav} className={cls}>{content}</Link>
    );
  }
  return <button onClick={onClick} className={cls}>{content}</button>;
}

function ConfirmSheet({
  open, onClose, title, body, confirm, onConfirm, destructive,
}: {
  open: boolean; onClose: () => void; title: string; body: string;
  confirm: string; onConfirm: () => void; destructive?: boolean;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} footer={
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onClose} className="h-11 rounded-2xl border border-border text-sm font-bold">Cancel</button>
        <button onClick={onConfirm} className={`h-11 rounded-2xl text-sm font-bold text-white ${destructive ? "bg-destructive" : "bg-primary text-primary-foreground"}`}>{confirm}</button>
      </div>
    }>
      <p className="text-xs text-muted-foreground">{body}</p>
    </BottomSheet>
  );
}
