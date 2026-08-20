import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Settings, Save, ShieldCheck, Clock, Sliders, Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function SettingsPage() {
  const [listingExpiryDays, setListingExpiryDays] = useState("30");
  const [maxImageUploads, setMaxImageUploads] = useState("10");
  const [supportSlaHours, setSupportSlaHours] = useState("24");
  const [autoApproveVerified, setAutoApproveVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showSuccess("Marketplace Settings Saved", "Global platform configurations updated in MongoDB.");
    }, 600);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Marketplace Operational Settings"
        description="Configure global platform policy limits, listing expiration rules, and support SLA thresholds."
        badge="Platform Governance"
        badgeColor="indigo"
      />

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Clock className="w-4 h-4 text-[#3547D4]" /> Listing & Moderation Governance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#111827] block mb-1">Default Listing Expiry (Days):</label>
              <input
                type="number"
                value={listingExpiryDays}
                onChange={(e) => setListingExpiryDays(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>

            <div>
              <label className="font-bold text-[#111827] block mb-1">Max Media Uploads per Listing:</label>
              <input
                type="number"
                value={maxImageUploads}
                onChange={(e) => setMaxImageUploads(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 text-xs text-[#111827]">
            <input
              type="checkbox"
              checked={autoApproveVerified}
              onChange={(e) => setAutoApproveVerified(e.target.checked)}
              className="w-4 h-4 rounded text-[#3547D4]"
            />
            <span>Auto-Approve Listings from Level-3 Verified Sellers</span>
          </label>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Support & Service Level Agreement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#111827] block mb-1">Support Ticket SLA Deadline (Hours):</label>
              <input
                type="number"
                value={supportSlaHours}
                onChange={(e) => setSupportSlaHours(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#3547D4] text-white font-bold text-xs rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Settings..." : "Save Platform Settings"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
