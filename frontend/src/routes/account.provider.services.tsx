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

export const Route = createFileRoute("/account/provider/services")({
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
    if (selectedServiceId && inq.serviceId !== selectedServiceId && inq.service?.id !== selectedServiceId) {
      // If no specific match, still show if all or match
    }
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

  const handleUpdateStatus = (inquiryId: string, nextStatus: any) => {
    updateInquiryStatusLocal(inquiryId, nextStatus);
    toast.success(`Booking status updated to ${nextStatus}`);
    loadData();
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModalInquiry || !quoteAmount) return;

    updateInquiryStatusLocal(
      quoteModalInquiry.id,
      "ACCEPTED",
      Number(quoteAmount),
      quoteNotes.trim()
    );

    toast.success("Quote & Acceptance sent to customer!");
    setQuoteModalInquiry(null);
    setQuoteAmount("");
    setQuoteNotes("");
    loadData();
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.back()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-foreground">Service Provider Dashboard</h1>
              <p className="text-[11px] text-muted-foreground font-semibold">
                Manage service offerings & customer bookings
              </p>
            </div>
          </div>
          <Link
            to="/services/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Service</span>
          </Link>
        </header>

        <main className="p-4 md:mx-auto md:max-w-6xl space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Active Services</span>
                <Wrench className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">{services.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Customer Leads</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">{inquiries.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Confirmed Visits</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">
                {inquiries.filter((i) => i.status === "ACCEPTED" || i.status === "COMPLETED").length}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">KYC / Trust Badge</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm font-black text-emerald-600 dark:text-emerald-400">Verified Pro</p>
            </div>
          </div>

          {/* Active Services Selector Horizontal Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Your Listed Services</h2>
              <Link to="/services/new" className="text-xs font-bold text-primary hover:underline">
                + Add Another Service
              </Link>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`rounded-2xl border p-3 text-left transition shrink-0 min-w-[220px] ${
                    selectedServiceId === s.id
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  <p className="text-xs font-black truncate max-w-[200px]">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    ₹{s.pricing.amount} {s.pricing.priceUnit} • {s.location.area}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Leads & Bookings Section */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-foreground">Customer Leads & Booking Requests</h2>
                <p className="text-xs text-muted-foreground">Respond to incoming inquiries, provide quotations, and schedule doorstep visits</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {["ALL", "PENDING", "ACCEPTED", "COMPLETED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInquiryStatusFilter(st)}
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                      inquiryStatusFilter === st
                        ? "bg-navy text-white"
                        : "bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiries List */}
            {filteredInquiries.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs font-bold">No customer inquiries match this filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-border bg-surface-1 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-foreground">{inq.customerName}</h4>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {inq.customerPhone}
                        </span>
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-xs text-foreground font-medium line-clamp-2">
                        💬 "{inq.problemDescription}"
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>📅 Slot: {new Date(inq.preferredDate).toLocaleDateString()} ({inq.preferredTimeSlot})</span>
                        {inq.customerAddress && <span>• 📍 {inq.customerAddress.area}</span>}
                      </div>

                      {inq.quotationAmount && (
                        <p className="text-xs font-bold text-emerald-600">
                          Quoted Amount: ₹{inq.quotationAmount}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <a
                        href={`tel:${inq.customerPhone}`}
                        className="grid h-9 w-9 place-items-center rounded-xl bg-secondary hover:bg-surface-2 text-foreground transition"
                        title="Call Customer"
                      >
                        <Phone className="h-4 w-4" />
                      </a>

                      {inq.status === "PENDING" && (
                        <button
                          onClick={() => {
                            setQuoteModalInquiry(inq);
                            setQuoteAmount(activeService?.pricing.amount || 499);
                          }}
                          className="flex-1 sm:flex-initial inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-primary-foreground shadow-sm hover:brightness-110"
                        >
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span>Quote & Accept</span>
                        </button>
                      )}

                      {inq.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleUpdateStatus(inq.id, "COMPLETED")}
                          className="flex-1 sm:flex-initial inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark Completed</span>
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
                    className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Notes / Instructions for Customer</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Technician will arrive with high-pressure jet equipment at 10 AM."
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface-1 p-3 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalInquiry(null)}
                    className="flex-1 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-surface-2"
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
