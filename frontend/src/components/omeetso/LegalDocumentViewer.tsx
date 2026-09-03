import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  LEGAL_DOCS,
  LEGAL_METADATA,
  type LegalSection,
} from "@/lib/legalDocs";
import {
  Shield,
  FileText,
  Lock,
  CreditCard,
  AlertTriangle,
  Ban,
  ShieldCheck,
  Copyright,
  Cookie,
  Mail,
  Users,
  Layers,
  UserX,
  BookOpen,
  Search,
  CheckCircle2,
  Copy,
  Printer,
  ChevronRight,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Gavel,
} from "lucide-react";
import { toast } from "sonner";

interface LegalDocumentViewerProps {
  defaultSectionId?: string;
  pageTitle?: string;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  terms: FileText,
  privacy: Lock,
  "advertising-refund": CreditCard,
  disclaimer: AlertTriangle,
  prohibited: Ban,
  "trust-safety": ShieldCheck,
  "ip-takedown": Copyright,
  cookies: Cookie,
  grievance: Mail,
  "community-standards": Users,
  "supplemental-terms": Layers,
  "account-deletion": UserX,
  "statutory-basis": BookOpen,
};

export function LegalDocumentViewer({
  defaultSectionId = "terms",
  pageTitle,
}: LegalDocumentViewerProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(defaultSectionId);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewAll, setViewAll] = useState(false);

  const activeDoc = useMemo(() => {
    return LEGAL_DOCS.find((d) => d.id === activeSectionId) || LEGAL_DOCS[0];
  }, [activeSectionId]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return LEGAL_DOCS;
    const query = searchQuery.toLowerCase();
    return LEGAL_DOCS.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const copySection = (doc: LegalSection) => {
    navigator.clipboard.writeText(
      `${doc.title}\n\n${doc.description}\n\n${doc.content}\n\nOperator: ${LEGAL_METADATA.operatorEntity}\nRegistered Office: ${LEGAL_METADATA.registeredOffice}\nContact: ${LEGAL_METADATA.generalEmail}`
    );
    toast.success(`Copied ${doc.shortTitle} to clipboard!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Header & Breadcrumb */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/home" className="hover:text-amber-500 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300">Legal Documentation</span>
            <span>/</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {pageTitle || activeDoc.shortTitle}
            </span>
          </nav>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Omeetso Legal & Compliance Centre
                  </h1>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Comprehensive Legal Documentation Pack for Hyperlocal Classifieds & Advertising Marketplace
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewAll(!viewAll)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                  viewAll
                    ? "border-amber-500 bg-amber-500 text-slate-950"
                    : "border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                {viewAll ? "Single Section View" : "View Full Complete Pack"}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </div>
          </div>

          {/* Document Control Summary Card */}
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-amber-400/20 dark:bg-amber-400/5">
            <div className="flex items-start gap-2.5">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Operator Entity:</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{LEGAL_METADATA.operatorEntity}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Draft Effective Date:</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{LEGAL_METADATA.effectiveDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Governing Law & Court:</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">India (Medchal-Malkajgiri, Telangana)</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Legal & Grievance Contact:</span>
                <a href={`mailto:${LEGAL_METADATA.generalEmail}`} className="block font-semibold text-amber-600 hover:underline dark:text-amber-400">
                  {LEGAL_METADATA.generalEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Registered Office Bar */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>
              <strong>Registered Office:</strong> {LEGAL_METADATA.registeredOffice}
            </span>
          </div>
        </div>
      </header>

      {/* Core Transaction Rule Callout Banner */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-900/50 dark:bg-amber-950/40">
        <div className="mx-auto flex max-w-7xl items-center gap-3 text-xs sm:px-6 lg:px-8">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-slate-800 dark:text-slate-200 leading-snug">
            <strong className="text-amber-700 dark:text-amber-300">CORE BUSINESS MODEL & ZERO-ESCROW RULE:</strong>{" "}
            Omeetso charges strictly for advertising, featured placement, boosted visibility, or other promotional services.
            Omeetso does not collect, hold, route, settle, escrow, guarantee, or refund buyer-seller purchase amounts. All buyer-seller
            negotiations, payments, and handovers take place directly and independently between parties.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-20 space-y-4">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search policies & terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              {/* Navigation List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 px-3 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Legal Documents (13 Parts)
                </div>
                <nav className="space-y-1">
                  {filteredDocs.map((doc) => {
                    const Icon = SECTION_ICONS[doc.id] || FileText;
                    const isActive = activeSectionId === doc.id && !viewAll;

                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setActiveSectionId(doc.id);
                          setViewAll(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                          <span className="truncate">{doc.shortTitle}</span>
                        </div>
                        {doc.badge && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                              isActive
                                ? "bg-slate-950/20 text-slate-950"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {doc.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Links & Contact Box */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Grievance Redressal
                </h4>
                <p className="mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed">
                  For content takedown, privacy requests, or grievances under IT Rules 2021 & DPDP Act:
                </p>
                <div className="mt-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/70">
                  <p className="font-bold text-slate-900 dark:text-slate-200">Grievance Officer</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Digitalness Industries LLP</p>
                  <a
                    href={`mailto:${LEGAL_METADATA.grievanceEmail}`}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline dark:text-amber-400"
                  >
                    {LEGAL_METADATA.grievanceEmail}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Document Display Area */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-8">
            {viewAll ? (
              // View all 13 parts sequentially
              <div className="space-y-12">
                <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300">
                  Showing all 13 Parts of the Complete Legal Documentation Pack for Omeetso.
                </div>
                {LEGAL_DOCS.map((doc, idx) => (
                  <LegalSectionRenderer key={doc.id} doc={doc} index={idx + 1} onCopy={() => copySection(doc)} />
                ))}
              </div>
            ) : (
              // Single Section View
              <LegalSectionRenderer doc={activeDoc} onCopy={() => copySection(activeDoc)} />
            )}

            {/* Bottom Footer Notice */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  © {new Date().getFullYear()} Digitalness Industries LLP. All rights reserved.
                </span>
                <span className="text-[11px] text-slate-400">Effective: {LEGAL_METADATA.effectiveDate}</span>
              </div>
              <p className="leading-relaxed">
                This legal documentation pack is issued by Digitalness Industries LLP for the Omeetso platform (https://www.omeetso.in).
                All content, trademarks, taxonomy, and interface layouts are proprietary. Subject to the laws of India and competent courts
                in Medchal-Malkajgiri District, Telangana.
              </p>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

function LegalSectionRenderer({
  doc,
  index,
  onCopy,
}: {
  doc: LegalSection;
  index?: number;
  onCopy: () => void;
}) {
  const Icon = SECTION_ICONS[doc.id] || FileText;

  // Render markdown-like sections cleanly into structured HTML
  const parsedSections = useMemo(() => {
    return parseMarkdownLegalContent(doc.content);
  }, [doc.content]);

  return (
    <article
      id={doc.id}
      className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100">
                {doc.title}
              </h2>
              {doc.badge && (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                  {doc.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {doc.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            title="Copy section"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      </div>

      {/* Rendered Structured Legal Content */}
      <div className="mt-6 space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {parsedSections}
      </div>
    </article>
  );
}

/**
 * Helper to parse legal markdown content into structured React elements
 * supporting headings (h3, h4), blockquotes, lists, tables, bold text, and links.
 */
function parseMarkdownLegalContent(content: string) {
  const blocks = content.trim().split("\n\n");

  return blocks.map((block, bIdx) => {
    const trimmed = block.trim();

    // Headings (###)
    if (trimmed.startsWith("### ")) {
      const headingText = trimmed.replace("### ", "");
      return (
        <h3
          key={bIdx}
          className="mt-8 pt-4 text-base font-black tracking-tight text-slate-900 border-t border-slate-100 first:border-0 first:pt-0 dark:text-slate-100 dark:border-slate-800 flex items-center gap-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
          {headingText}
        </h3>
      );
    }

    // Subheadings (####)
    if (trimmed.startsWith("#### ")) {
      const subHeadingText = trimmed.replace("#### ", "");
      return (
        <h4 key={bIdx} className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">
          {subHeadingText}
        </h4>
      );
    }

    // Blockquotes (> ...)
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.replace(/^>\s*/gm, "");
      return (
        <div
          key={bIdx}
          className="my-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50/70 p-4 text-xs font-medium text-amber-950 dark:border-amber-400 dark:bg-amber-950/30 dark:text-amber-200 leading-relaxed"
        >
          {formatInlineMarkdown(quoteText)}
        </div>
      );
    }

    // Markdown Table (| ... |)
    if (trimmed.includes("|") && trimmed.includes("\n|")) {
      const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|"));
      if (rows.length >= 2) {
        const headerCols = rows[0]
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean);
        const dataRows = rows.slice(2).map((r) =>
          r
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
        );

        return (
          <div key={bIdx} className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100">
                <tr>
                  {headerCols.map((col, cIdx) => (
                    <th key={cIdx} className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                        {formatInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Bullet Lists (- ...)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s*/, ""));
      return (
        <ul key={bIdx} className="my-3 space-y-2 pl-2">
          {items.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span>{formatInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Numbered Lists (1. ...)
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s*/, ""));
      return (
        <ol key={bIdx} className="my-3 space-y-2 pl-2">
          {items.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-black text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                {iIdx + 1}
              </span>
              <span>{formatInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Standard Paragraph
    return (
      <p key={bIdx} className="leading-relaxed">
        {formatInlineMarkdown(trimmed)}
      </p>
    );
  });
}

/**
 * Format inline bold **text** and links [text](url)
 */
function formatInlineMarkdown(text: string): React.ReactNode {
  // Regex to split by bold text or markdown links
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const linkText = match[1];
        const linkUrl = match[2];
        return (
          <a
            key={index}
            href={linkUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-bold text-amber-600 underline underline-offset-2 hover:text-amber-500 dark:text-amber-400"
          >
            {linkText}
          </a>
        );
      }
    }
    return part;
  });
}
