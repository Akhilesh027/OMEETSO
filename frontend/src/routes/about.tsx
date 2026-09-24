import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Target,
  Compass,
  Store,
  ShieldCheck,
  Zap,
  Users,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Building2,
  Lock,
  Layers,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us – Omeetso | Local Marketplace & Discovery" },
      {
        name: "description",
        content:
          "Omeetso is a modern local marketplace platform developed by Digitalness Industries LLP to make buying, selling, discovering services, and finding opportunities simpler, faster, and zero-commission.",
      },
      { property: "og:title", content: "About Us – Omeetso" },
      {
        property: "og:description",
        content:
          "Discover how Omeetso connects local buyers, sellers, businesses, and opportunities across Hyderabad and India.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Breadcrumb & Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center space-x-2 px-4 py-3 text-xs font-semibold text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
          <Link to="/home" className="hover:text-amber-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">About Us</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover. Connect. Grow.</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
            About Us – <span className="text-amber-400">Omeetso</span>
          </h1>

          <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-slate-200 font-normal">
            Omeetso is a modern local marketplace platform created to make buying, selling, discovering services,
            finding opportunities, and connecting with nearby people simpler, faster, and more accessible.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              Operated by Digitalness Industries LLP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              Uppal, Hyderabad, Telangana
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Zero-Commission Model
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        
        {/* Core Narrative / Introduction */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Transforming Local Discovery & Hyperlocal Commerce
            </h2>
            
            <p>
              Built with a strong focus on local communities, Omeetso brings individuals, sellers, small businesses,
              service providers, and opportunity seekers together on a single digital platform.
            </p>

            <p>
              Omeetso is developed and operated by <strong>Digitalness Industries LLP</strong> with the vision of building a
              reliable, user-friendly, and scalable marketplace ecosystem for local commerce and discovery. Our goal is
              to reduce the complexity often associated with online marketplaces and create a platform where users can
              easily post listings, discover relevant products and opportunities, communicate with interested people, and
              make informed decisions.
            </p>

            {/* Zero-Commission Callout Box */}
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 dark:border-amber-400/20 dark:bg-amber-400/5">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                  0%
                </span>
                The Zero-Commission Marketplace Approach
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                At the heart of Omeetso is a simple idea: <strong>local buying and selling should not be complicated or expensive</strong>.
                Many traditional marketplaces depend heavily on commissions or transaction-based charges. Omeetso is designed
                around a zero-commission marketplace approach, allowing sellers and businesses to reach potential customers
                without paying a commission on every transaction. Our platform is primarily supported through advertising,
                promotional services, and optional paid visibility features such as listing boosts.
              </p>
            </div>

            <p>
              Omeetso enables users to explore a wide variety of local categories including furniture, electronics,
              vehicles, jobs, and other marketplace listings. Whether someone wants to sell a pre-owned product, promote a
              business offering, post a job opportunity, discover an item available nearby, or connect with a local seller,
              Omeetso aims to provide an easy and organized experience.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 mb-3">
                  <Store className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">For Sellers & Businesses</h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Omeetso provides a digital space to present products, services, and opportunities to relevant audiences.
                  Users can create listings with essential information, images, pricing details, location info, and detailed
                  descriptions to improve local visibility and connect directly with interested customers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 mb-3">
                  <Search className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">For Buyers & Seekers</h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Discovery is made convenient. Instead of depending only on distant sellers or large national platforms,
                  users can explore listings available within their local market and directly communicate with the person or
                  business behind the listing.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                At a Glance
              </h3>
              <ul className="mt-4 space-y-3.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Hyperlocal Focus:</strong> Starting with Hyderabad, expanding across Indian cities.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Zero-Commission Trades:</strong> Direct buyer-seller interactions with no transaction cuts.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Multidisciplinary Discovery:</strong> Goods, vehicles, electronics, furniture, jobs & services.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Verified Digital Stores:</strong> Helping neighborhood shops build sustainable digital presence.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Safety First:</strong> Verification badges, listing moderation & reporting tools.
                  </span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Link
                  to="/categories"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  Explore Marketplace
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/contact"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>

            {/* Platform Operator Card */}
            <div className="rounded-3xl border border-slate-200 bg-slate-100/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
                <Building2 className="h-4 w-4 text-amber-500" />
                Platform Operator
              </div>
              <p className="mt-2 leading-relaxed">
                Omeetso is owned, developed, and operated by <strong>Digitalness Industries LLP</strong>, located in Uppal, Hyderabad, Telangana, India.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-white to-white p-8 dark:from-blue-500/10 dark:via-slate-900 dark:to-slate-900 dark:border-blue-500/30 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mb-6 shadow-md shadow-blue-500/20">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
              Our Mission
            </h3>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Our mission is to create an <strong>accessible, transparent, and technology-driven marketplace</strong> where people
              and businesses can discover, connect, communicate, and grow without unnecessary barriers.
            </p>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              We want to make it easier for individuals to sell what they no longer need, for buyers to discover local options,
              for businesses to reach customers, and for opportunity providers to connect with the right audience.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-white to-white p-8 dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-900 dark:border-amber-500/30 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 mb-6 shadow-md shadow-amber-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
              Our Vision
            </h3>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Our vision is to develop Omeetso into a <strong>trusted local discovery and marketplace ecosystem</strong> that supports
              individuals, entrepreneurs, small businesses, sellers, job providers, and communities across India.
            </p>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              We envision a platform where local commerce becomes more organized, digital, and accessible while still
              preserving the direct relationship between buyers and sellers.
            </p>
          </div>
        </section>

        {/* Our Approach (4 Principles) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Our Approach
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Omeetso is being built around four important principles designed to unlock local community commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 mb-4 font-black">
                01
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">Simplicity</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Keeping the platform easy enough for everyday users to post listings, search nearby items, and chat directly without hassle.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 mb-4 font-black">
                02
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">Accessibility</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Empowering small businesses and individual sellers without expensive listing barriers, large tech budgets, or mandatory commissions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 mb-4 font-black">
                03
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">Transparency</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Promoting open communication, transparent listing information, clear safety guidance, and direct buyer-seller relationships.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 mb-4 font-black">
                04
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">Local Opportunity</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Fostering local economic growth across products, commercial opportunities, employment, services, and neighborhood initiatives.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Safety & Intermediary Role */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Platform Safety, Transparency & Responsible Participation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Building trust and reliable interactions in local discovery
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <p>
                Omeetso is being developed with a strong focus on platform safety, transparency, and responsible participation.
                Features such as <strong>seller verification, KYC-based checks where applicable, listing moderation, reporting mechanisms,
                user safety tools, and communication features</strong> are intended to help create a more trustworthy environment.
              </p>
              <p>
                Our moderation systems are designed to identify inappropriate, misleading, prohibited, or suspicious listings and
                allow users to report content or accounts that may violate platform policies.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 sm:p-5 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                Intermediary Platform Notice
              </h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Omeetso functions as a technology marketplace and intermediary platform. We provide the digital infrastructure
                that helps users discover and connect with one another. Marketplace products are listed by independent users,
                sellers, or businesses. Omeetso does not normally own the products being advertised and does not become the buyer
                or seller simply because a listing appears on the platform.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Buyers and sellers are encouraged to independently verify product details, condition, ownership, pricing, delivery
                arrangements, and documentation before completing transactions.
              </p>
            </div>
          </div>
        </section>

        {/* Building Local Connections Through Technology */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30">
              Technology With Purpose
            </span>
            <h2 className="text-2xl font-black tracking-tight sm:text-4xl text-white">
              Building Local Connections Through Technology
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-medium">
              Technology should make local opportunities easier to discover, not more complicated. Omeetso is built around this philosophy.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              A furniture seller should be able to showcase products to nearby customers. A person looking to sell an electronic
              device should be able to create a listing easily. A business should be able to promote its offerings locally. An employer
              should be able to make an opportunity visible to relevant users. And someone searching for any of these should be able to
              find and connect with them through one convenient platform.
            </p>
            <p className="text-xs sm:text-sm font-semibold text-amber-300 pt-2">
              This is the marketplace experience Omeetso is working to create. Omeetso is more than a listing platform—it is a growing digital ecosystem designed to bring local buyers, sellers, businesses, and opportunities closer together.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/sell/quick"
                className="rounded-2xl bg-amber-500 px-6 py-3 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95"
              >
                Start Selling
              </Link>
              <Link
                to="/stores"
                className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-black text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Browse Local Stores
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
