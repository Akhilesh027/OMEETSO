import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Briefcase, ShieldCheck, CheckCircle, FileText, Lock, Globe } from "lucide-react";

export default function AdvertisersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Advertisers Directory & Ad Policy Compliance"
        description="Review advertiser business KYC documents, external URL safety rules, and advertising policy compliance."
        badge="Advertiser Management"
        badgeColor="indigo"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#3547D4]" />
            <span>External Landing Page Safety Standards</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>Mandatory HTTPS enforcement on all advertiser destination URLs.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>Automated insertion of rel="noopener noreferrer" on external redirects.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>Blocking unsafe schemes (javascript:, data:, file:).</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#3547D4]" />
            <span>Targeting & Privacy Controls</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>Geography targeting limited to Country, State, City, Pincode & Radius.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>Strict prohibition on sensitive personal targeting (religion, health, private chat text).</span>
            </li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}
