import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Users, Eye, CheckCircle2, Clock, Calendar, Search, Filter,
  FileText, MessageCircle, MoreVertical, Copy, RefreshCw, XCircle, ShieldCheck,
  Lock, Wrench, IndianRupee, Phone, Check, AlertCircle, Sparkles
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  fetchPublicServices,
  listServiceInquiriesLocal,
  updateInquiryStatusLocal,
  ServiceItem,
  ServiceInquiryItem
} from "@/lib/services";
import { toast } from "sonner";

export const Route = createFileRoute("/my/provider-services")({
  head: () => ({ meta: [{ title: "Provider Services Dashboard — Omeetso" }] }),
  component: ProviderServicesDashboardPage,
});

function ProviderServicesDashboardPage() {
  const nav = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<ServiceInquiryItem[]>([]);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("ALL");
  const [inquirySearch, setInquirySearch] = useState("");
  const [quoteModalInquiry, setQuoteModalInquiry] = useState<ServiceInquiryItem | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number | string>("");
  const [quoteNotes, setQuoteNotes] = useState("");

  const loadData = () => {
    fetchPublicServices().then((data) => {
      setServices(data);
      if (data.length > 0 && !selectedServiceId) {
        setSelectedServiceId(data[0].id);
      }
    });

    const localInquiries = listServiceInquiriesLocal();
    setInquiries(localInquiries);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryStatusFilter !== "ALL" && inq.status !== inquiryStatusFilter) return false;
    if (inquirySearch.trim()) {
      const q = inquirySearch.toLowerCase();
      return (
        inq.customerName.toLowerCase().includes(q) ||
        inq.problemDescription.toLowerCase().includes(q) ||
        inq.customerPhone.includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: ServiceInquiryItem["status"]) => {
    updateInquiryStatusLocal(id, newStatus);
    toast.success(`Booking status updated to ${newStatus}`);
    loadData();
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModalInquiry) return;
    const amountNum = typeof quoteAmount === "string" ? parseFloat(quoteAmount) : quoteAmount;
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid quote amount");
      return;
    }

    updateInquiryStatusLocal(quoteModalInquiry.id, "ACCEPTED", {
      quotationAmount: amountNum,
      providerNotes: quoteNotes.trim() || undefined,
    });
    toast.success("Quote sent & booking accepted!");
    setQuoteModalInquiry(null);
    setQuoteAmount("");
    setQuoteNotes("");
    loadData();
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.length > 1 ? history.back() : window.location.assign("/account")} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">Service Provider Dashboard</h1>
          </div>
          <Link
            to="/services/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow"
          >
            <Plus className="h-4 w-4" />
            <span>List New Service</span>
          </Link>
        </header>

        <main className="p-4 md:mx-auto md:max-w-4xl space-y-6">
          {/* Quick Provider Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                <Wrench className="h-4 w-4 text-primary" /> Active Services
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">{services.length}</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                <Users className="h-4 w-4 text-emerald-600" /> Inquiries & Leads
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">{inquiries.length}</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                <Calendar className="h-4 w-4 text-amber-600" /> Pending Action
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">
                {inquiries.filter((i) => i.status === "REQUESTED").length}
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> KYC Status
              </div>
              <p className="mt-2 text-xs font-extrabold text-emerald-600">Verified Pro ✓</p>
            </div>
          </div>

          {/* Incoming Customer Bookings List */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2 className="text-base font-extrabold text-foreground">Incoming Customer Leads & Bookings</h2>
                <p className="text-xs text-muted-foreground">Respond to customer requests and provide price quotations.</p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {["ALL", "REQUESTED", "ACCEPTED", "COMPLETED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInquiryStatusFilter(st)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      inquiryStatusFilter === st
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-surface-2"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="font-bold">No customer inquiries found</p>
                <p>When customers request service quotes, they will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-foreground">{inq.customerName}</span>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase bg-primary/10 text-primary">
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          📞 {inq.customerPhone} • {new Date(inq.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <a
                        href={`tel:${inq.customerPhone}`}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call Customer
                      </a>
                    </div>

                    <div className="rounded-xl bg-card p-3 text-xs border border-border space-y-1">
                      <p className="font-bold text-foreground">Service Requirement:</p>
                      <p className="text-muted-foreground">{inq.problemDescription}</p>
                      <p className="text-[11px] text-muted-foreground pt-1">
                        🗓️ Requested for: <strong>{new Date(inq.preferredDate).toLocaleDateString()}</strong> ({inq.preferredTimeSlot})
                      </p>
                      {inq.customerAddress && (
                        <p className="text-[11px] text-muted-foreground">
                          📍 {inq.customerAddress.street ? `${inq.customerAddress.street}, ` : ""}{inq.customerAddress.area}, {inq.customerAddress.city}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {inq.status === "REQUESTED" && (
                        <button
                          onClick={() => setQuoteModalInquiry(inq)}
                          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow"
                        >
                          Send Quote & Accept
                        </button>
                      )}
                      {inq.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleUpdateStatus(inq.id, "COMPLETED")}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Quotation & Accept Modal */}
        {quoteModalInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-black text-foreground">Provide Quote & Accept Booking</h3>
              <p className="text-xs text-muted-foreground">
                Customer: <strong>{quoteModalInquiry.customerName}</strong> ({quoteModalInquiry.customerPhone})
              </p>

              <form onSubmit={handleSendQuote} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Quotation Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Notes / Instructions for Customer</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Technician will arrive with equipment at scheduled time."
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalInquiry(null)}
                    className="flex-1 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-primary py-2.5 text-xs font-black text-primary-foreground shadow"
                  >
                    Confirm & Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
