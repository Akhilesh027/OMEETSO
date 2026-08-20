import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Heart, MessageCircle, MapPin, ChevronDown, ArrowLeft, User } from "lucide-react";
import type { ReactNode } from "react";
import { NOTIFICATIONS } from "@/lib/mock";
import { getSaved, subscribe as subscribeSaved } from "@/lib/saved";
import { getThreads, subscribe as subscribeChat, seedIfEmpty } from "@/lib/chat";
import { LocationModal } from "@/components/omeetso/LocationModal";
import { Logo } from "@/components/omeetso/Logo";

export function LocationTopBar({
  area,
  pincode,
}: {
  area?: string;
  pincode?: string;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const hasLocation = Boolean(area);
  const unreadNotifications = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    setSavedCount(getSaved().length);
    const unsubSaved = subscribeSaved(() => setSavedCount(getSaved().length));
    return unsubSaved;
  }, []);

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

  return (
    <header className="gradient-brand text-white px-4 pt-3 pb-5 safe-t md:hidden shadow-md">
      {/* Top row: Logo on Left, Action icons on Right */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <Link to="/home" className="flex items-center shrink-0">
          <Logo size="sm" mono />
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/saved"
            aria-label="Saved"
            className="relative grid h-8.5 w-8.5 place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <Heart className="h-4 w-4 text-white" />
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-slate-950 shadow-2xs">
                {savedCount}
              </span>
            )}
          </Link>

          <Link
            to="/chats"
            aria-label="Chats"
            className="relative grid h-8.5 w-8.5 place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-white" />
            {unreadChats > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-slate-950 shadow-2xs">
                {unreadChats}
              </span>
            )}
          </Link>

          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative grid h-8.5 w-8.5 place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <Bell className="h-4 w-4 text-white" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-slate-950 shadow-2xs">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Link
            to="/account"
            aria-label="Account"
            className="grid h-8.5 w-8.5 place-items-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <User className="h-4 w-4 text-white" />
          </Link>
        </div>
      </div>

      {/* Location Picker Glass Button */}
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="w-full flex items-center justify-between gap-2 text-xs bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-2xl px-3.5 py-2 backdrop-blur-md border border-white/20 shadow-2xs transition-all"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate font-bold text-white text-xs sm:text-sm">
            {hasLocation ? `${area}${pincode ? `, ${pincode}` : ""}` : "Set your location"}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/80" />
      </button>

      <LocationModal open={openModal} onClose={() => setOpenModal(false)} />
    </header>
  );
}

export function BackBar({ title, right, fallback = "/" }: { title: string; right?: ReactNode; fallback?: string }) {
  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.assign(fallback);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-3 py-3 backdrop-blur safe-t">
      <button onClick={handleBack} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary cursor-pointer">
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-center text-sm sm:text-base font-extrabold text-foreground">{title}</h1>
      <div className="flex min-w-9 items-center justify-end gap-1">{right}</div>
    </header>
  );
}
