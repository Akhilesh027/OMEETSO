import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/omeetso/Logo";
import { toast } from "sonner";
import { Check, Loader2, Mail } from "lucide-react";
import { subscribeNewsletterApi } from "@/api/newsletter.api";

export function WebsiteFooter() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
    try {
      return localStorage.getItem("omeetso_newsletter_subscribed") === "true";
    } catch {
      return false;
    }
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address (e.g. name@example.com)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await subscribeNewsletterApi(cleanEmail, "website_footer");
      if (res.success) {
        setIsSubscribed(true);
        setEmail("");
        toast.success(res.message || "Thank you for subscribing to Omeetso deals and updates!");
      } else {
        toast.error(res.message || "Unable to subscribe right now. Please try again.");
      }
    } catch (err: any) {
      toast.error("Something went wrong while subscribing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const hideOn = ["/", "/language", "/onboarding", "/welcome", "/login", "/otp", "/profile-setup", "/location", "/register"];
  if (hideOn.includes(path)) return null;

  const groups: { title: string; links: { label: string; to: string }[] }[] = [
    {
      title: "Omeetso",
      links: [
        { label: "About Us", to: "/about" },
        { label: "Blogs & Guides", to: "/blogs" },
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
      title: "Legal & Compliance",
      links: [
        { label: "Terms of Service", to: "/terms" },
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Advertising Policy", to: "/advertising-policy" },
        { label: "Cookie Preferences", to: "/cookie-preferences" },
      ],
    },
  ];

  return (
    <footer className="block border-t border-border/80 bg-slate-950 text-white mt-12 md:mt-20 pb-28 md:pb-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 md:py-16">
        
        {/* Top Newsletter & Brand Banner */}
        <div className="mb-10 md:mb-12 rounded-2xl md:rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-5 md:p-8 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-5 md:gap-6 shadow-xl">
          <div className="max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30 mb-2.5">
              ⚡ Stay Updated
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white leading-snug">Get top hyperlocal deals directly in your inbox</h3>
            <p className="text-xs text-white/75 mt-1 font-medium">Join 50,000+ local buyers & sellers getting weekly neighborhood highlights.</p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2.5">
            <div className="relative w-full sm:w-72">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                placeholder={isSubscribed ? "Subscribed! Enter new email..." : "Enter your email address"}
                className="h-11 md:h-12 w-full rounded-xl md:rounded-2xl bg-white/10 border border-white/20 pl-10 pr-4 text-xs font-bold text-white outline-none placeholder:text-white/50 focus:border-amber-400 disabled:opacity-60 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 md:h-12 shrink-0 rounded-xl md:rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-75 disabled:pointer-events-none px-5 md:px-6 text-xs font-black text-slate-950 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Subscribing...</span>
                </>
              ) : isSubscribed && !email ? (
                <>
                  <Check className="h-4 w-4 text-slate-950 stroke-[3]" />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-6 md:gap-8">
          <div className="col-span-2 space-y-3 md:space-y-4">
            <Logo size="lg" mono />
            <p className="text-xs text-white/70 leading-relaxed font-medium max-w-sm">
              India's premier hyperlocal marketplace connecting buyers, verified individual sellers, and local merchants with direct 0% commission trades.
            </p>
          </div>

          {groups.map((g) => (
            <div key={g.title} className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">{g.title}</h4>
              <ul className="space-y-2 text-xs font-medium text-white/70">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to as never} className="hover:text-white transition-colors block py-0.5">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-10 md:mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 md:pt-8 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} DIGITALNESS INDUSTRIES LLP. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-bold text-white/70">
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
