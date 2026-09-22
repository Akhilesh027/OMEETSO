import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { deleteNotification, getNotification, markRead, timeAgo } from "@/lib/account";
import { toast } from "sonner";
import { Sparkles, Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/notifications/$id")({
  head: () => ({ meta: [{ title: "Notification — Omeetso" }] }),
  component: NotifDetail,
});

function NotifDetail() {
  const { id } = useParams({ from: "/notifications/$id" });
  const nav = useNavigate();
  const n = getNotification(id);
  useEffect(() => {
    if (n && !n.read) {
      markRead(id, true);
      import("@/api/notifications.api").then(({ markNotificationReadApi }) => {
        markNotificationReadApi(id);
      });
    }
  }, [id, n]);

  if (!n) {
    return (
      <MobileFrame>
        <div className="min-h-dvh p-6 pt-16 text-center">
          <p className="text-sm text-muted-foreground">Notification not found.</p>
          <Link to="/notifications" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Notification" />
        <div className="mx-4 mt-2 rounded-2xl bg-card p-4 card-elev">
          <p className="text-[11px] font-bold uppercase text-muted-foreground">{n.category}</p>
          <h1 className="mt-1 text-lg font-extrabold text-foreground">{n.title}</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{new Date(n.time).toLocaleString("en-IN")}</p>
          <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{n.body}</p>

          {n.promoted && (
            <div className="mt-3 rounded-2xl border border-yellow-brand/40 bg-yellow-brand/10 p-3 text-xs">
              <p className="flex items-center gap-1 font-bold"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> Promoted · {n.advertiser}</p>
              <p className="mt-1 text-muted-foreground">You’re seeing this because of your advertisement preferences.</p>
              <Link to="/settings/ad-preferences" className="mt-1 inline-block text-[11px] font-bold text-primary">Manage ad preferences</Link>
            </div>
          )}

          {(() => {
            let dest = n.destination;
            const isJob = n.category === "job_application" || n.title?.toLowerCase().includes("job") || n.body?.toLowerCase().includes("application");
            if (isJob && (!dest || dest.includes("profile/jobs") || dest === "/account" || dest === "/account/jobs")) {
              dest = "/my/jobs";
            }
            const label = n.destinationLabel || (isJob ? "View Job Application" : "View Details");

            if (!dest) return null;

            return (
              <button
                type="button"
                onClick={() => {
                  markRead(id, true);
                  if (dest.startsWith("/chat/")) {
                    const chatId = dest.replace("/chat/", "");
                    nav({ to: "/chat/$id", params: { id: chatId } });
                  } else if (dest.startsWith("/product/")) {
                    const prodId = dest.replace("/product/", "");
                    nav({ to: "/product/$id", params: { id: prodId } });
                  } else if (dest.startsWith("/store/")) {
                    const storeId = dest.replace("/store/", "");
                    nav({ to: "/store/$id", params: { id: storeId } });
                  } else if (dest.startsWith("/job/")) {
                    const jobId = dest.replace("/job/", "").split("?")[0].split("#")[0];
                    nav({ to: "/job/$id", params: { id: jobId } });
                  } else if (dest.startsWith("/my/employer/jobs")) {
                    nav({ to: "/my/employer/jobs" });
                  } else if (dest.startsWith("/my/jobs")) {
                    try {
                      const urlObj = new URL(dest, "http://localhost");
                      const searchId = urlObj.searchParams.get("id") || urlObj.searchParams.get("jobId") || undefined;
                      const searchTab = (urlObj.searchParams.get("tab") as any) || undefined;
                      nav({ to: "/my/jobs", search: { id: searchId, tab: searchTab } as any });
                    } catch {
                      nav({ to: "/my/jobs" as any });
                    }
                  } else if (dest.startsWith("/")) {
                    nav({ to: dest as any });
                  } else {
                    window.location.href = dest;
                  }
                }}
                className="mt-4 flex w-full items-center justify-between rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            );
          })()}

          <button onClick={() => { markRead(id, false); toast.success("Marked as unread"); nav({ to: "/notifications" }); }}
            className="mt-2 w-full rounded-full border border-border py-2 text-xs font-semibold">
            Mark as unread
          </button>
          <button onClick={() => { deleteNotification(id); toast.success("Notification deleted"); nav({ to: "/notifications" }); }}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-full border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700">
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
