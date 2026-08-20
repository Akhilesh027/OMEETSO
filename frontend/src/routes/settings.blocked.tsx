import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { EmptyBlock } from "@/components/omeetso/account";
import { listBlocked, subscribeAccount, unblockUser, blockUser } from "@/lib/account";
import { UserX, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/blocked")({
  head: () => ({ meta: [{ title: "Blocked users — Omeetso" }] }),
  component: BlockedPage,
});

function BlockedPage() {
  const [, setTick] = useState(0);
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const list = listBlocked();

  const demoBlock = () => {
    blockUser({ id: `u${Date.now()}`, name: "Sample User", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80", reason: "Suspicious behaviour" });
    toast.success("User blocked");
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Blocked users" />
        <div className="px-4 pt-2">
          {list.length === 0 ? (
            <EmptyBlock icon={UserX} title="No blocked users" body="You haven’t blocked anyone yet." cta="Block a sample user" onCta={demoBlock} />
          ) : (
            <div className="space-y-2">
              {list.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 card-elev">
                  {u.avatar ? <img src={u.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><UserX className="h-4 w-4" /></div>}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{u.name}</p>
                    <p className="text-[11px] text-muted-foreground">Blocked {new Date(u.blockedAt).toLocaleDateString("en-IN")}</p>
                    {u.reason && <p className="text-[11px] text-muted-foreground">Reason: {u.reason}</p>}
                  </div>
                  <button onClick={() => setConfirmId(u.id)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">Unblock</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {confirmId && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-navy/40 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-2xl bg-card p-4">
              <p className="text-sm font-bold">Unblock this user?</p>
              <p className="mt-1 text-xs text-muted-foreground">They may be able to message you again if a conversation or listing is available.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setConfirmId(null)} className="flex-1 rounded-full border border-border py-2 text-sm font-semibold">Cancel</button>
                <button onClick={() => { unblockUser(confirmId); setConfirmId(null); toast.success("User unblocked"); }}
                  className="flex-1 rounded-full bg-primary py-2 text-sm font-bold text-primary-foreground">Unblock</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
