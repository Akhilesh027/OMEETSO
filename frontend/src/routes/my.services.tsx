import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Wrench, Calendar, Clock, MapPin, CheckCircle2, AlertCircle,
  Trash2, Heart, User, Sparkles, Building, Phone, ArrowRight
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  listServiceInquiriesLocal,
  getSavedServiceIds,
  fetchPublicServices,
  ServiceItem,
  ServiceInquiryItem
} from "@/lib/services";
import { ServiceCard } from "@/components/omeetso/services/ServiceCard";

export const Route = createFileRoute("/my/services")({
  head: () => ({ meta: [{ title: "My Service Bookings — Omeetso" }] }),
  component: MyServicesDashboardPage,
});

function MyServicesDashboardPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "saved">("bookings");
  const [inquiries, setInquiries] = useState<ServiceInquiryItem[]>([]);
  const [savedServices, setSavedServices] = useState<ServiceItem[]>([]);

  const loadData = () => {
    const inqs = listServiceInquiriesLocal();
    setInquiries(inqs);

    const savedIds = getSavedServiceIds();
    fetchPublicServices().then((all) => {
      setSavedServices(all.filter((s) => savedIds.includes(s.id)));
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.length > 1 ? history.back() : window.location.assign("/account")} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">My Service Bookings & Inquiries</h1>
          </div>
          <Link
            to="/my/provider-services"
            className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
          >
            <Wrench className="h-3.5 w-3.5" /> Provider Dashboard
          </Link>
        </header>

        {/* Sub-Tabs */}
        <div className="border-b border-border bg-card px-4 pt-2">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 ${
                activeTab === "bookings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              My Bookings ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 ${
                activeTab === "saved"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Saved Services ({savedServices.length})
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <main className="p-4 md:mx-auto md:max-w-4xl space-y-4">
          {activeTab === "bookings" && (
            <div>
              {inquiries.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground mb-3">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">No active bookings yet</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                    When you request doorstep visits or quotes from electricians, cleaners, or mechanics, they will appear here.
                  </p>
                  <Link
                    to="/services"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Browse Services</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => {
                    const isAccepted = inq.status === "ACCEPTED" || inq.status === "IN_PROGRESS";
                    const isCompleted = inq.status === "COMPLETED";

                    return (
                      <div
                        key={inq.id}
                        className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                isAccepted
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : isCompleted
                                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {inq.status}
                            </span>
                            <h3 className="mt-1.5 text-sm sm:text-base font-extrabold text-foreground">
                              {inq.service?.title || "Home / Appliance Service Visit"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Requested for: <strong>{new Date(inq.preferredDate).toLocaleDateString()}</strong> ({inq.preferredTimeSlot})
                            </p>
                          </div>

                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Customer Requirements Box */}
                        <div className="rounded-2xl bg-secondary/50 p-3 text-xs text-muted-foreground leading-relaxed">
                          <p className="font-bold text-foreground mb-0.5">Problem / Requirement:</p>
                          <p>{inq.problemDescription}</p>
                          {inq.customerAddress && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              📍 Address: {inq.customerAddress.street ? `${inq.customerAddress.street}, ` : ""}{inq.customerAddress.area}, {inq.customerAddress.city}
                            </p>
                          )}
                        </div>

                        {/* Provider notes / quotation */}
                        {inq.quotationAmount && (
                          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs flex items-center justify-between">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300">Quotation / Estimated Amount:</span>
                            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">₹{inq.quotationAmount}</span>
                          </div>
                        )}

                        {inq.providerNotes && (
                          <p className="text-xs text-muted-foreground italic">
                            💬 Provider Note: {inq.providerNotes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div>
              {savedServices.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground mb-3">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">No saved services</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                    Click the heart icon on any service listing to save it for quick booking later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </MobileFrame>
  );
}
