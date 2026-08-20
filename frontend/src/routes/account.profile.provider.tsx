import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building, ShieldCheck, Sparkles, MapPin, Phone, Upload, Check, Wrench } from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { toast } from "sonner";

export const Route = createFileRoute("/account/profile/provider")({
  component: ProviderProfileKYCPage,
});

function ProviderProfileKYCPage() {
  const [businessName, setBusinessName] = useState("CoolBreeze AC Care");
  const [phone, setPhone] = useState("+91 98765 12001");
  const [experienceYears, setExperienceYears] = useState(8);
  const [city, setCity] = useState("Hyderabad");
  const [idType, setIdType] = useState("GST_CERTIFICATE");
  const [idNumber, setIdNumber] = useState("36AAAAA0000A1Z5");
  const [isKycSubmitted, setIsKycSubmitted] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Provider business profile updated successfully!");
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 font-sans">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.back()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">Service Provider Business Profile</h1>
          </div>
        </header>

        <main className="p-4 md:mx-auto md:max-w-2xl space-y-6">
          {/* KYC Status Card */}
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">Verified Service Partner</h3>
                <p className="text-xs text-muted-foreground">GST & Government ID credentials approved</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-xs">
              Verified
            </span>
          </div>

          <form onSubmit={handleSave} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-foreground">Business Information</h2>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Trade / Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Business Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Years in Service</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Operating City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-2xl bg-primary py-3 text-xs font-black text-primary-foreground shadow hover:brightness-110"
              >
                Save Business Profile
              </button>
            </div>
          </form>
        </main>
      </div>
    </MobileFrame>
  );
}
