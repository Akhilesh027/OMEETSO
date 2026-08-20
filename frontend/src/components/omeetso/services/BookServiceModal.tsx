import { useState } from "react";
import { X, Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Zap, Sparkles, Send } from "lucide-react";
import { ServiceItem, createServiceInquiryLocal, ServiceInquiryItem } from "@/lib/services";
import { createServiceInquiryApi } from "@/api/services.api";
import { toast } from "sonner";

interface BookServiceModalProps {
  service: ServiceItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (inquiry: ServiceInquiryItem) => void;
}

export function BookServiceModal({ service, isOpen, onClose, onSuccess }: BookServiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [area, setArea] = useState(service.location.area || "Hyderabad");
  const [streetAddress, setStreetAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("Morning (09:00 AM - 12:00 PM)");
  const [problemDescription, setProblemDescription] = useState("");
  const [serviceMode, setServiceMode] = useState<"DOORSTEP" | "AT_CENTER" | "ONLINE">(service.serviceType === "DOORSTEP" ? "DOORSTEP" : "DOORSTEP");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !problemDescription.trim()) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        serviceId: service.id,
        customerId: "user-current",
        providerId: service.providerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: {
          street: streetAddress.trim(),
          area: area.trim(),
          city: service.location.city,
          pincode: service.location.pincode,
        },
        preferredDate,
        preferredTimeSlot,
        serviceMode,
        problemDescription: problemDescription.trim(),
      };

      // Try API first, fallback to local storage
      try {
        await createServiceInquiryApi(payload as any);
      } catch {
        // ignored
      }

      const created = createServiceInquiryLocal(payload as any);
      toast.success("Service booking request sent to " + service.businessName + "!");
      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit booking request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-card border border-border p-6 shadow-2xl z-50 max-h-[90dvh] overflow-y-auto animate-in slide-in-from-bottom-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Quick Book & Quote
            </span>
            <h3 className="text-lg font-black text-foreground">{service.title}</h3>
            <p className="text-xs text-muted-foreground font-semibold">by {service.businessName}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Pricing Badge Info */}
        <div className="my-4 rounded-2xl bg-secondary/70 p-3 flex items-center justify-between border border-border/50">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Cost</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-foreground">₹{service.pricing.amount.toLocaleString("en-IN")}</span>
              <span className="text-xs text-muted-foreground font-semibold">
                {service.pricing.priceUnit ? ` / ${service.pricing.priceUnit.replace("per ", "")}` : ""}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> {service.serviceDetails.warranty}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Response: {service.serviceDetails.guaranteedResponseTime}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Preferred Service Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setServiceMode("DOORSTEP")}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-extrabold transition ${
                  serviceMode === "DOORSTEP"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span>🏠 Doorstep Visit</span>
              </button>
              <button
                type="button"
                onClick={() => setServiceMode("AT_CENTER")}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-extrabold transition ${
                  serviceMode === "AT_CENTER"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span>🏢 At Service Center</span>
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Phone Number (WhatsApp) *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Location & Address */}
          {serviceMode === "DOORSTEP" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Locality / Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madhapur, Cyber Hills"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-surface-1 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">House / Flat / Landmark Address</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Sunshine Apartments, Near Metro Pillar 12"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-surface-1 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Preferred Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Preferred Time Slot</label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="Morning (08:00 AM - 11:00 AM)">Morning (08:00 AM - 11:00 AM)</option>
                <option value="Mid-Day (11:00 AM - 02:00 PM)">Mid-Day (11:00 AM - 02:00 PM)</option>
                <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                <option value="Emergency (Immediate / ASAP)">🔥 Emergency (Immediate / ASAP)</option>
              </select>
            </div>
          </div>

          {/* Problem Details */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Describe the Issue or Service Requirements *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Split AC not cooling, making humming noise. Please inspect gas level and coils."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-1 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-black text-primary-foreground shadow-lg hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? "Sending Booking Request..." : "Confirm & Send Booking Request"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
