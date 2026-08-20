import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [
    { title: "Welcome to Omeetso — Buy Nearby. Sell Quickly." },
    { name: "description", content: "India's hyperlocal marketplace to buy and sell nearby." },
    { property: "og:title", content: "Welcome to Omeetso" },
    { property: "og:description", content: "Buy nearby. Sell quickly." },
  ] }),
  component: Welcome,
});

function Welcome() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[1440px] px-6 py-10 md:py-20">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-brand/15 px-3 py-1 text-xs font-bold text-navy">
            <Sparkles className="h-3.5 w-3.5" /> India's hyperlocal marketplace
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Buy Nearby.<br />Sell Quickly.
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
            Discover trusted local products, connect with verified sellers, and grow your business — all in your neighbourhood.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white">
              Continue with mobile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/home" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold">
              Browse as guest
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            <Feature icon={MapPin} label="Hyperlocal" />
            <Feature icon={ShieldCheck} label="Verified sellers" />
            <Feature icon={Sparkles} label="Quick sell" />
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute -inset-6 rounded-3xl gradient-brand opacity-10 blur-2xl" />
          <div className="relative aspect-square rounded-3xl gradient-brand p-10 text-white shadow-2xl">
            <div className="grid h-full grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs opacity-70">Nearby</div>
                <div className="mt-1 text-2xl font-black">Madhapur</div>
                <div className="mt-4 text-xs opacity-70">4.2k listings</div>
              </div>
              <div className="rounded-2xl bg-yellow-brand p-4 text-navy">
                <div className="text-xs font-bold">Trending</div>
                <div className="mt-1 text-2xl font-black">Mobiles</div>
                <div className="mt-4 text-xs">120+ new today</div>
              </div>
              <div className="col-span-2 rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs opacity-70">Stores in Hyderabad</div>
                <div className="mt-1 text-lg font-bold">Verified local businesses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <Icon className="mx-auto h-5 w-5 text-navy" />
      <div className="mt-1 text-xs font-semibold">{label}</div>
    </div>
  );
}
