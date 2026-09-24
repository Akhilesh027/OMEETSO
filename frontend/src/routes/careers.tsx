import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Briefcase,
  Sparkles,
  HeartHandshake,
  Lightbulb,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  MapPin,
  Mail,
  CheckCircle2,
  ArrowRight,
  Code2,
  Palette,
  Headphones,
  Settings,
  Scale,
  LineChart,
  Copy,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers at Omeetso – Discover. Connect. Grow." },
      {
        name: "description",
        content:
          "Explore career opportunities at Omeetso, operated by Digitalness Industries LLP. Join our team in Hyderabad and build the modern hyperlocal marketplace for India.",
      },
      { property: "og:title", content: "Careers at Omeetso" },
      {
        property: "og:description",
        content:
          "Join our team in Hyderabad building the future of local commerce, discovery, and community opportunities.",
      },
    ],
  }),
  component: CareersPage,
});

const OPPORTUNITY_AREAS = [
  {
    title: "Technology & Engineering",
    icon: Code2,
    description: "Build robust, low-latency web & mobile platforms, search engines, and automated moderation pipelines.",
    roles: ["Full Stack Web Engineers", "Mobile Application Developers", "Backend & Cloud Engineers", "QA & Reliability"],
  },
  {
    title: "Product & UI/UX Design",
    icon: Palette,
    description: "Craft simple, engaging, and accessible interfaces tailored for millions of diverse Indian users.",
    roles: ["Product Designers", "UI/UX Specialists", "Design Systems Engineers"],
  },
  {
    title: "Marketing & Growth",
    icon: Rocket,
    description: "Drive hyperlocal awareness, brand storytelling, digital ad campaigns, and merchant community adoption.",
    roles: ["Digital Marketers", "Content Strategists", "Community Growth Managers"],
  },
  {
    title: "Sales & Merchant Onboarding",
    icon: LineChart,
    description: "Partner with neighborhood stores, local businesses, and regional dealers to accelerate their digital presence.",
    roles: ["Merchant Onboarding Specialists", "Business Development Executives", "Account Managers"],
  },
  {
    title: "Customer Support & Operations",
    icon: Headphones,
    description: "Provide fast, empathetic resolution to buyer and seller queries across payment, listings, and platform tools.",
    roles: ["Customer Support Executives", "Operations Associates", "Listing Support Coordinators"],
  },
  {
    title: "Content Moderation & Safety",
    icon: ShieldCheck,
    description: "Maintain a trusted and scam-free marketplace through diligent review of listings, verifications, and user reports.",
    roles: ["Trust & Safety Analysts", "Listing Review Specialists", "Compliance Officers"],
  },
  {
    title: "Business Development & Partnerships",
    icon: Building2,
    description: "Establish strategic commercial alliances, advertising partnerships, and local ecosystem integrations.",
    roles: ["Partnership Managers", "Category Leads", "Strategy Associates"],
  },
];

const CORE_VALUES = [
  {
    title: "Integrity",
    icon: ShieldCheck,
    description: "We believe in conducting our work responsibly, transparently, and professionally in everything we do.",
  },
  {
    title: "Ownership",
    icon: Rocket,
    description: "We encourage people to take full responsibility for their work, initiatives, and measurable outcomes.",
  },
  {
    title: "Learning",
    icon: GraduationCap,
    description: "We believe continuous learning helps both individuals and organizations adapt and grow sustainably.",
  },
  {
    title: "Collaboration",
    icon: Users,
    description: "Strong results come from people working together openly, sharing insights, and supporting each other.",
  },
  {
    title: "Innovation",
    icon: Lightbulb,
    description: "We continuously look for better ways to improve our products, processes, and user experiences.",
  },
  {
    title: "Customer Focus",
    icon: HeartHandshake,
    description: "Our decisions should ultimately contribute to creating a better, simpler, and more useful experience for users.",
  },
];

const GROW_WITH_US_POINTS = [
  "Learn continuously and expand skill sets",
  "Take ownership of projects from inception to impact",
  "Share ideas openly and challenge existing processes",
  "Collaborate seamlessly with cross-functional peers",
  "Solve real-world problems with practical engineering",
  "Adapt readily to changing technology and market dynamics",
  "Focus obsessively on creating better user experiences",
  "Maintain highest standards of professionalism and integrity",
];

function CareersPage() {
  const [selectedDept, setSelectedDept] = useState("Technology & Engineering");

  const copyEmail = () => {
    navigator.clipboard.writeText("info@omeetso.in");
    toast.success("Copied info@omeetso.in to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Breadcrumb Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center space-x-2 px-4 py-3 text-xs font-semibold text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
          <Link to="/home" className="hover:text-amber-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">Careers</span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover. Connect. Grow.</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
            Careers at <span className="text-amber-400">Omeetso</span>
          </h1>

          <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-slate-200 font-normal">
            At Omeetso, we believe that great products are built by people who are curious, responsible, creative, and
            willing to grow together.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              Operated by Digitalness Industries LLP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              Uppal, Hyderabad, Telangana, India
            </span>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-amber-400" />
              <span>info@omeetso.in</span>
              <Copy className="h-3 w-3 text-slate-400 ml-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        
        {/* Intro Overview & Grow With Us */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Build the Future of Local Commerce
            </h2>

            <p>
              Omeetso is developed and operated by <strong>Digitalness Industries LLP</strong> with the vision of building a modern
              local marketplace that connects people, businesses, sellers, and opportunities through technology.
            </p>

            <p>
              Our workplace is focused on <strong>learning, collaboration, innovation, ownership, and continuous improvement</strong>.
              We want to create an environment where people can contribute ideas, solve real problems, develop new skills, and grow
              along with the platform.
            </p>

            {/* Our Culture Highlight */}
            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 sm:p-8 dark:border-blue-500/30 dark:bg-blue-500/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Our Culture
              </h3>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Our culture is built around <strong>simplicity, teamwork, trust, and continuous learning</strong>. We aim to maintain a
                professional yet flexible working environment where people can communicate openly, contribute ideas, and take
                responsibility for meaningful work.
              </p>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                At Omeetso, we believe every team member can contribute to improving the platform. Good ideas can come from anywhere,
                and we encourage people to think creatively, challenge existing processes, and look for better ways of doing things.
              </p>
            </div>
          </div>

          {/* Grow With Us Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Grow With Us
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Omeetso is a growing digital platform, and growth should happen not only for the business but also for the people who are part of it. We encourage team members to:
              </p>

              <div className="space-y-2.5 pt-2">
                {GROW_WITH_US_POINTS.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="mailto:info@omeetso.in?subject=Career%20Enquiry%20-%20Omeetso"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-xs font-black text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  Apply / Send Resume
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Learning, Teamwork & Innovation Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Learning & Development</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Technology and digital businesses evolve rapidly. We encourage our team to stay updated with new tools,
              technologies, digital trends, and industry developments while gaining practical, hands-on experience.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Working Together</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Building a marketplace requires coordination between different people, ideas, and responsibilities. Strong teamwork
              comes from clear communication, mutual respect, and accountability to our users.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Innovation & Ideas</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Omeetso is being built with a long-term vision. We continuously explore ways to improve user experience, marketplace
              safety, technology, business visibility, and local discovery through creative problem solving.
            </p>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Our Values
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              The foundational principles that guide our everyday decisions, culture, and products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                    {val.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Opportunity Areas / Functional Departments */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Opportunity Areas & Departments
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              As Omeetso grows, opportunities become available across key functional streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OPPORTUNITY_AREAS.map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                      {dept.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Key Roles & Pathways
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.roles.map((role, rIdx) => (
                        <span
                          key={rIdx}
                          className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Build With Purpose & Application Callout */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30">
              Build With Purpose
            </span>

            <h2 className="text-2xl font-black tracking-tight sm:text-4xl text-white">
              Connect With Us & Shape Local Discovery
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-slate-200">
              Omeetso is more than a digital platform. It is an evolving marketplace ecosystem designed to make local
              discovery and connections easier through technology. People who become part of our journey have the opportunity
              to contribute to building something that can grow across communities and cities.
            </p>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/15 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                How to Apply
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                Interested in working with Omeetso? Send your resume and portfolio/note to:
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="mailto:info@omeetso.in?subject=Career%20Enquiry%20-%20[Role%20/%20Department]"
                  className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-colors shadow-md flex items-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email info@omeetso.in</span>
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Address</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>Subject line format:</strong> <em>Career Enquiry – [Role or Department]</em>
              </p>
              <p className="text-[11px] text-slate-300">
                <strong>Location:</strong> Uppal, Hyderabad, Telangana, India
              </p>
            </div>

            <div className="pt-2 text-xs font-bold text-amber-400">
              Omeetso — Discover. Connect. Grow.
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
