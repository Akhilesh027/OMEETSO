import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/omeetso/Logo";

export function WebsiteFooter() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hideOn = ["/", "/language", "/onboarding", "/welcome", "/login", "/otp", "/profile-setup", "/location", "/register"];
  if (hideOn.includes(path)) return null;

  const groups: { title: string; links: { label: string; to: string }[] }[] = [
    {
      title: "Omeetso",
      links: [
        { label: "About Us", to: "/about" },
        { label: "Contact Us", to: "/contact" },
        { label: "Careers", to: "/careers" },
      ],
    },
    {
      title: "Buy and Sell",
      links: [
        { label: "Browse Categories", to: "/categories" },
        { label: "Quick Sell", to: "/sell/quick" },
        { label: "Detailed Sell", to: "/sell/detailed" },
        { label: "Verified Stores", to: "/stores" },
      ],
    },
    {
      title: "Business",
      links: [
        { label: "Create Store", to: "/store/create" },
        { label: "Promote Listing", to: "/promotions" },
        { label: "Ad Campaigns", to: "/ads" },
      ],
    },
    {
      title: "Support & Safety",
      links: [
        { label: "Help Centre", to: "/help" },
        { label: "Safety Centre", to: "/safety" },
        { label: "Report a Problem", to: "/safety/report" },
        { label: "Community Guidelines", to: "/community-guidelines" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", to: "/terms" },
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Advertising Policy", to: "/advertising-policy" },
        { label: "Cookie Preferences", to: "/cookie-preferences" },
      ],
    },
  ];

  return (
    <footer className="hidden md:block border-t border-border/80 bg-slate-950 text-white mt-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-16">
        
        {/* Top Newsletter & Brand Banner */}
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30 mb-3">
              ⚡ Stay Updated
            </span>
            <h3 className="text-2xl font-black text-white">Get top hyperlocal deals directly in your inbox</h3>
            <p className="text-xs text-white/75 mt-1 font-medium">Join 50,000+ local buyers & sellers getting weekly neighborhood highlights.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex w-full lg:w-auto items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-12 w-full lg:w-72 rounded-2xl bg-white/10 border border-white/20 px-4 text-xs font-bold text-white outline-none placeholder:text-white/50 focus:border-amber-400"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-2xl bg-amber-500 hover:bg-amber-400 px-6 text-xs font-black text-slate-950 transition-colors shadow-md"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-7 gap-8">
          <div className="col-span-2 space-y-4">
            <Logo size="lg" mono />
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              India's premier hyperlocal marketplace connecting buyers, verified individual sellers, and local merchants with direct 0% commission trades.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-extrabold text-amber-400">
                100% Aadhaar Verified
              </span>
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-extrabold text-emerald-400">
                Direct Chat Enabled
              </span>
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-amber-400">{g.title}</h4>
              <ul className="space-y-2.5 text-xs font-medium text-white/70">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to as never} className="hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Omeetso Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-bold text-white/70">
            <span>Made with ❤️ in India</span>
            <span>·</span>
            <span>Hyderabad, Telangana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
