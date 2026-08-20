import { Check, CheckCheck, Clock, AlertCircle, MapPin, Play, Pause, RefreshCw } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/chat";
import { formatChatTime, retryMessage, deleteMessage } from "@/lib/chat";

export function MessageBubble({ m, onReport }: { m: Message; onReport?: (id: string) => void }) {
  if (m.from === "system") return <SystemLine m={m} />;
  const mine = m.from === "me";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm",
        mine ? "rounded-br-md bg-navy text-white" : "rounded-bl-md bg-card border border-border text-foreground",
      )}>
        {m.type === "text" && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
        {m.type === "image" && <ImagePart m={m} mine={mine} />}
        {m.type === "location" && <LocationPart m={m} mine={mine} />}
        {m.type === "voice" && <VoicePart m={m} mine={mine} />}

        <div className={cn("mt-1 flex items-center gap-1 justify-end text-[10px]",
          mine ? "text-white/70" : "text-muted-foreground")}>
          <span>{formatChatTime(m.createdAt)}</span>
          {mine && <StatusIcon status={m.status} />}
          {mine && m.status === "failed" && (
            <button
              aria-label="Retry"
              onClick={() => retryMessage(m.threadId, m.id)}
              className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>
        {!mine && onReport && (
          <button
            onClick={() => onReport(m.id)}
            className="mt-1 text-[10px] font-semibold text-muted-foreground underline"
            aria-label="Report message"
          >
            Report
          </button>
        )}
        {mine && m.status === "failed" && (
          <button
            onClick={() => deleteMessage(m.threadId, m.id)}
            className="ml-2 text-[10px] underline text-white/80"
          >Delete</button>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "sending") return <Clock className="h-3 w-3" aria-label="Sending" />;
  if (status === "sent") return <Check className="h-3 w-3" aria-label="Sent" />;
  if (status === "delivered") return <CheckCheck className="h-3 w-3" aria-label="Delivered" />;
  if (status === "read") return <CheckCheck className="h-3 w-3 text-sky-300" aria-label="Read" />;
  if (status === "failed") return <AlertCircle className="h-3 w-3 text-red-300" aria-label="Failed" />;
  return null;
}

function ImagePart({ m, mine }: { m: Message; mine: boolean }) {
  return (
    <div>
      {m.imageUrl && (
        <img
          src={m.imageUrl}
          alt={m.caption ?? "Shared photo"}
          className="max-h-64 w-full rounded-xl object-cover"
          loading="lazy"
        />
      )}
      {m.caption && <p className={cn("mt-1 whitespace-pre-wrap text-sm", mine ? "text-white" : "text-foreground")}>{m.caption}</p>}
    </div>
  );
}

function LocationPart({ m, mine }: { m: Message; mine: boolean }) {
  const loc = m.location;
  if (!loc) return null;
  return (
    <div className="min-w-[220px]">
      <div className={cn("mb-1 flex items-center gap-1.5 text-xs font-semibold", mine ? "text-white" : "text-foreground")}>
        <MapPin className="h-3.5 w-3.5" /> Approximate meeting point
      </div>
      <div className={cn("rounded-xl border p-2", mine ? "border-white/20 bg-white/10" : "border-border bg-secondary/50")}>
        <div className="grid h-24 place-items-center rounded-lg bg-gradient-to-br from-sky-100 to-emerald-100 text-xs font-semibold text-navy">
          {loc.name}
        </div>
        <p className={cn("mt-1 text-[11px]", mine ? "text-white/80" : "text-muted-foreground")}>{loc.area}</p>
        <button className={cn("mt-1 text-[11px] font-semibold underline", mine ? "text-white" : "text-primary")}>
          Open Map
        </button>
      </div>
    </div>
  );
}

function VoicePart({ m, mine }: { m: Message; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);
  const dur = m.voice?.durationSec ?? 5;

  const toggle = () => {
    if (playing) {
      if (timer.current) window.clearInterval(timer.current);
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const start = Date.now() - progress * 1000;
    timer.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      if (t >= dur) {
        setPlaying(false); setProgress(0);
        if (timer.current) window.clearInterval(timer.current);
      } else setProgress(t);
    }, 100);
  };

  const pct = Math.min(100, (progress / dur) * 100);
  return (
    <div className="flex min-w-[180px] items-center gap-2">
      <button
        onClick={toggle}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        className={cn("grid h-8 w-8 place-items-center rounded-full", mine ? "bg-white/20" : "bg-primary text-primary-foreground")}
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <div className="flex-1">
        <div className={cn("h-1 w-full rounded-full", mine ? "bg-white/20" : "bg-border")}>
          <div className="h-1 rounded-full bg-current" style={{ width: `${pct}%` }} />
        </div>
        <p className={cn("mt-0.5 text-[10px]", mine ? "text-white/80" : "text-muted-foreground")}>
          {formatDur(dur)}
        </p>
      </div>
    </div>
  );
}

function formatDur(s: number) {
  const mm = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function SystemLine({ m }: { m: Message }) {
  const isWarning = m.text?.includes("Warning") || m.text?.includes("⚠️") || m.text?.includes("Safety") || m.text?.includes("Moderator");
  if (isWarning) {
    return (
      <div className="my-2 flex justify-center">
        <div className="max-w-[90%] rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
            <span>Omeetso Safety Warning</span>
          </div>
          <p className="mt-1 text-[11px] font-normal leading-relaxed text-amber-900/90">{m.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-1 flex justify-center">
      <span className="max-w-[80%] rounded-full bg-secondary px-3 py-1 text-[11px] text-muted-foreground text-center">
        {m.text}
      </span>
    </div>
  );
}
