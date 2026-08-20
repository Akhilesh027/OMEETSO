import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { getStore, STORE_STATUS_LABEL } from "@/lib/stores";
import {
  CheckCircle2, ArrowRight, Plus, Eye, LayoutDashboard, Home,
  ShieldCheck, Clock, Sparkles, MapPin, Store as StoreIcon, Package, Star
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/store/success")({
  head: () => ({ meta: [{ title: "Store Created — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) ?? "" }),
  component: Success,
});

function Success() {
  const { id } = useSearch({ from: "/store/success" });
  const s = getStore(id);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    { icon: ShieldCheck, title: "Under Review", desc: "Our team verifies your store details", done: true },
    { icon: Clock, title: "Approval", desc: "Usually within 24 hours", done: false },
    { icon: Package, title: "Add Products", desc: "List your first product to go live", done: false },
    { icon: Star, title: "Start Selling", desc: "Customers discover your store", done: false },
  ];

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background">

        {/* Hero Section */}
        <div className="relative overflow-hidden px-6 pt-12 pb-16 text-center text-white" style={{
          backgroundImage: "linear-gradient(160deg, #111E4D 0%, #1B2A79 40%, #3547D4 100%)"
        }}>
          {/* Animated background elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-yellow-brand/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-electric/25 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          </div>

          {/* Confetti-like dots */}
          {showConfetti && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: ["#FFD166", "#06D6A0", "#EF476F", "#118AB2", "#FFFFFF"][i % 5],
                    left: `${10 + Math.random() * 80}%`,
                    top: `${-10 + Math.random() * 30}%`,
                    opacity: 0.8,
                    animation: `confettiFall ${1.5 + Math.random() * 2}s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CheckCircle2 className="h-10 w-10 text-yellow-brand drop-shadow-lg" />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight">
              🎉 Store Created Successfully!
            </h1>
            <p className="mt-2 text-sm text-white/75 max-w-xs mx-auto leading-relaxed">
              Your business is now being reviewed. You'll be live within 24 hours.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="-mt-6 rounded-t-3xl bg-background relative z-10">
          <div className="px-4 pt-6 pb-8 space-y-5 max-w-lg mx-auto">

            {/* Store Card */}
            {s && (
              <div className="rounded-3xl border border-border bg-card shadow-lg overflow-hidden">
                {/* Mini Cover */}
                <div className="h-16 w-full bg-gradient-to-r from-indigo-900 via-slate-800 to-navy overflow-hidden">
                  {s.cover && <img src={s.cover} alt="" className="h-full w-full object-cover opacity-80" />}
                </div>
                <div className="px-4 pb-4 -mt-6">
                  <div className="flex items-end gap-3">
                    <div className="h-12 w-12 rounded-xl bg-card border-2 border-card shadow-md overflow-hidden shrink-0">
                      {s.logo ? (
                        <img src={s.logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-indigo-brand/10 grid place-items-center text-indigo-brand font-black text-base">
                          {s.name?.charAt(0) || "S"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-2">
                      <p className="text-sm font-extrabold text-foreground truncate">{s.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> {STORE_STATUS_LABEL[s.status]}
                        </span>
                        {s.area && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {s.area}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Timeline */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">What happens next</h2>
              </div>
              <div className="space-y-0">
                {steps.map((st, i) => {
                  const Icon = st.icon;
                  return (
                    <div key={i} className="flex gap-3">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                          st.done
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {st.done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[24px] ${st.done ? "bg-emerald-500/40" : "bg-border"}`} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-5">
                        <p className={`text-sm font-bold ${st.done ? "text-emerald-700" : "text-foreground"}`}>{st.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <Link
                to="/sell/detailed"
                search={{ storeId: id } as never}
                className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-brand to-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-brand/20 hover:opacity-95 transition-all"
              >
                <span className="inline-flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/15">
                    <Plus className="h-4 w-4" />
                  </div>
                  Add Your First Product
                </span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/store/manage/$id/preview"
                  params={{ id }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center hover:bg-muted/50 transition-all shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-brand/10 text-indigo-brand">
                    <Eye className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Preview Store</span>
                </Link>

                <Link
                  to="/store/manage/$id"
                  params={{ id }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center hover:bg-muted/50 transition-all shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Dashboard</span>
                </Link>
              </div>

              <Link
                to="/home"
                className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-all"
              >
                <Home className="h-4 w-4" /> Return Home
              </Link>
            </div>

            {/* Tip */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">Pro Tip</p>
                <p className="text-[11px] text-amber-600/80 mt-0.5 leading-relaxed">
                  Add at least 5 products to boost your store's visibility in search results and get discovered by nearby buyers faster.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Confetti animation keyframes */}
        <style>{`
          @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
            100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
    </MobileFrame>
  );
}
