import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, UserCheck, UserX, Star, MapPin, ChevronRight, Users } from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { getFollowedSellers, toggleFollowSeller, type FollowedSeller } from "@/lib/saved";
import { toast } from "sonner";

export const Route = createFileRoute("/following")({
  head: () => ({
    meta: [
      { title: "Following Sellers · Omeetso" },
      { name: "description", content: "View and manage sellers you follow on Omeetso." },
    ],
  }),
  component: FollowingPage,
});

function FollowingPage() {
  const nav = useNavigate();
  const [followed, setFollowed] = useState<FollowedSeller[]>([]);

  useEffect(() => {
    setFollowed(getFollowedSellers());
  }, []);

  const handleUnfollow = (seller: FollowedSeller, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFollowSeller({ id: seller.id, name: seller.name });
    setFollowed((prev) => prev.filter((s) => s.id !== seller.id));
    toast.info(`Unfollowed ${seller.name}`);
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-3 py-3 backdrop-blur safe-t">
          <button onClick={() => history.back()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-extrabold flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-brand" /> Following Sellers ({followed.length})
          </h1>
          <div className="w-10" />
        </header>

        <div className="p-4 md:mx-auto md:max-w-[800px] md:py-6">
          {followed.length === 0 ? (
            <EmptyState
              title="You aren't following any sellers yet"
              body="Follow verified local sellers to stay updated when they list new products!"
              ctaLabel="Discover Products"
              onCta={() => nav({ to: "/results" })}
            />
          ) : (
            <div className="space-y-3">
              {followed.map((s) => (
                <Link
                  key={s.id}
                  to="/seller/$id"
                  params={{ id: s.id }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm hover:border-indigo-brand/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {s.avatar ? (
                      <img src={s.avatar} alt={s.name} className="h-12 w-12 rounded-full object-cover shadow-sm border border-border" />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary font-bold text-indigo-brand text-lg">
                        {s.name?.charAt(0) || "S"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">{s.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-yellow-brand text-yellow-brand" /> {s.rating || 0}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-indigo-brand" /> {s.area || "Madhapur"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleUnfollow(s, e)}
                      className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/60 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                    >
                      <UserX className="h-3.5 w-3.5" /> Unfollow
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
