import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  TrendingUp,
  Zap,
  Award,
  PackagePlus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  DollarSign,
  PlusCircle,
  Filter,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface ListingBoostItem {
  id: string;
  listingTitle: string;
  sellerName: string;
  boostType: "TOP_SEARCH" | "FEATURED_BADGE" | "STORE_SPOTLIGHT";
  packageName: string;
  durationDays: number;
  amountPaid: number;
  status: "active" | "expired" | "pending_payment";
  startDate: string;
  endDate: string;
}

const INITIAL_BOOSTS: ListingBoostItem[] = [
  {
    id: "BST-401",
    listingTitle: "Hyundai Creta 1.5 SX (O) Petrol 2023",
    sellerName: "Rajesh Sharma",
    boostType: "TOP_SEARCH",
    packageName: "7-Day Top Search Priority",
    durationDays: 7,
    amountPaid: 499,
    status: "active",
    startDate: new Date(Date.now() - 86400_000).toISOString(),
    endDate: new Date(Date.now() + 6 * 86400_000).toISOString(),
  },
  {
    id: "BST-402",
    listingTitle: "AppleWorld Hyderabad Store",
    sellerName: "AppleWorld Electronics",
    boostType: "STORE_SPOTLIGHT",
    packageName: "Monthly Store Verified Spotlight",
    durationDays: 30,
    amountPaid: 1999,
    status: "active",
    startDate: new Date(Date.now() - 5 * 86400_000).toISOString(),
    endDate: new Date(Date.now() + 25 * 86400_000).toISOString(),
  },
  {
    id: "BST-403",
    listingTitle: "Royal Enfield Classic 350 Stealth Black",
    sellerName: "Vikram Reddy",
    boostType: "FEATURED_BADGE",
    packageName: "3-Day Featured Badge",
    durationDays: 3,
    amountPaid: 199,
    status: "expired",
    startDate: new Date(Date.now() - 4 * 86400_000).toISOString(),
    endDate: new Date(Date.now() - 86400_000).toISOString(),
  },
];

export default function PromotionsPage() {
  const [boosts, setBoosts] = useState<ListingBoostItem[]>(INITIAL_BOOSTS);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [targetTitle, setTargetTitle] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [packageName, setPackageName] = useState("7-Day Top Search Priority");
  const [price, setPrice] = useState(499);

  const { showSuccess } = useToast();

  const filteredBoosts = boosts.filter((b) => {
    const matchesSearch =
      b.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.packageName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "active") return b.status === "active";
    if (activeTab === "expired") return b.status === "expired";
    return true;
  });

  const handleGrantBoost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle || !sellerName) return;

    const newBoost: ListingBoostItem = {
      id: `BST-${Date.now()}`,
      listingTitle: targetTitle,
      sellerName,
      boostType: "TOP_SEARCH",
      packageName,
      durationDays: 7,
      amountPaid: price,
      status: "active",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 86400_000).toISOString(),
    };

    setBoosts([newBoost, ...boosts]);
    setIsWizardOpen(false);
    setTargetTitle("");
    setSellerName("");
    showSuccess("Promotion Boost Granted", `Boost activated for "${newBoost.listingTitle}".`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Promotions & Organic Boost Packages"
        description="Manage seller boost subscriptions, Top-of-Search placement packages, and Featured Store spotlight badges."
        badge={`${boosts.filter((b) => b.status === "active").length} Active Boosts`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4 text-[#FFB800]" />
            <span>Grant Promotional Boost</span>
          </button>
        }
      />

      {/* Boost Packages Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-900 rounded-xl font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Top Search Boost (₹499)</div>
            <div className="text-sm font-extrabold text-[#111827]">7 Days Top Placement</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-[#3547D4] rounded-xl font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Featured Badge (₹199)</div>
            <div className="text-sm font-extrabold text-[#111827]">3 Days Highlight Badge</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-[#16A36A] rounded-xl font-bold">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Store Spotlight (₹1,999)</div>
            <div className="text-sm font-extrabold text-[#111827]">30 Days Verified Banner</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-1.5 text-xs">
            {[
              { id: "all", label: `All Promotions (${boosts.length})` },
              { id: "active", label: "Active Boosts" },
              { id: "expired", label: "Expired Packages" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#3547D4] text-white shadow-sm"
                    : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search listing, seller, package..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Boost ID & Target Item</th>
                <th className="p-3">Seller Name</th>
                <th className="p-3">Promotional Package</th>
                <th className="p-3">Amount Paid</th>
                <th className="p-3">Validity Window</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredBoosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No promotional boost records found.
                  </td>
                </tr>
              ) : (
                filteredBoosts.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <div>{b.listingTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {b.id}</div>
                    </td>
                    <td className="p-3 text-[#3547D4] font-semibold">{b.sellerName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                        ⚡ {b.packageName}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#16A36A]">₹{b.amountPaid}</td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          b.status === "active"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRANT PROMOTIONAL BOOST WIZARD */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleGrantBoost} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Grant Promotional Seller Boost</h3>
              <button type="button" onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Target Product / Store Title</label>
                <input
                  type="text"
                  required
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Hyundai Creta 2023"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Seller Account Name</label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Promotional Package</label>
                <select
                  value={packageName}
                  onChange={(e) => {
                    setPackageName(e.target.value);
                    if (e.target.value.includes("Top")) setPrice(499);
                    else if (e.target.value.includes("Featured")) setPrice(199);
                    else setPrice(1999);
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                >
                  <option value="7-Day Top Search Priority">⚡ 7-Day Top Search Priority (₹499)</option>
                  <option value="3-Day Featured Badge">🏅 3-Day Featured Badge (₹199)</option>
                  <option value="Monthly Store Verified Spotlight">👑 Monthly Store Verified Spotlight (₹1,999)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Boost Package Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsWizardOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]">
                Activate Boost
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
