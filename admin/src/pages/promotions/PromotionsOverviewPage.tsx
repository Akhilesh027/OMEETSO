import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdCampaignsApi,
  getAdminAdProductsApi,
  getAdminAdPlacementsApi,
  approveAdminAdCampaignApi,
  rejectAdminAdCampaignApi
} from "@/api/adminAds.api";
import {
  Zap,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ImageIcon,
  Package,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  MapPin,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function PromotionsOverviewPage() {
  const location = useLocation();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes("active")) return "ACTIVE";
    if (path.includes("pending")) return "PENDING_REVIEW";
    if (path.includes("rejected")) return "REJECTED";
    if (path.includes("packages")) return "PACKAGES";
    if (path.includes("placements")) return "PLACEMENTS";
    if (path.includes("listing")) return "LISTING_BOOST";
    return "ALL";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Moderation modal states
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [campRes, pkgRes, placeRes] = await Promise.all([
      getAdminAdCampaignsApi(),
      getAdminAdProductsApi(),
      getAdminAdPlacementsApi()
    ]);
    setLoading(false);

    if (campRes.success && campRes.data) setCampaigns(campRes.data);
    if (pkgRes.success && pkgRes.data) setPackages(pkgRes.data);
    if (placeRes.success && placeRes.data) setPlacements(placeRes.data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (campaignId: string) => {
    setActionLoading(true);
    const res = await approveAdminAdCampaignApi(campaignId);
    setActionLoading(false);

    if (res.success) {
      showSuccess("Campaign Approved & Activated", "Ad inventory captured and banner is now live!");
      setSelectedCampaign(null);
      loadData();
    } else {
      showError("Approval Failed", res.error);
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign || !rejectionReason.trim()) return;
    setActionLoading(true);
    const res = await rejectAdminAdCampaignApi(selectedCampaign.id, rejectionReason.trim());
    setActionLoading(false);

    if (res.success) {
      showSuccess("Campaign Rejected", "Wallet hold released and balance restored to seller.");
      setIsRejectModalOpen(false);
      setSelectedCampaign(null);
      loadData();
    } else {
      showError("Rejection Failed", res.error);
    }
  };

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const pendingCount = campaigns.filter((c) => c.status === "PENDING_REVIEW").length;
  const rejectedCount = campaigns.filter((c) => c.status === "REJECTED").length;
  const listingBoostCount = campaigns.filter((c) => c.campaignType === "LISTING_BOOST").length;
  const totalRevenuePaise = campaigns
    .filter((c) => c.status === "ACTIVE" || c.paymentStatus === "PAID")
    .reduce((acc, c) => acc + (c.pricing?.totalInPaise || 0), 0);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "PENDING_REVIEW" && c.status !== "PENDING_REVIEW") return false;
    if (activeTab === "ACTIVE" && c.status !== "ACTIVE") return false;
    if (activeTab === "REJECTED" && c.status !== "REJECTED") return false;
    if (activeTab === "LISTING_BOOST" && c.campaignType !== "LISTING_BOOST") return false;
    if (activeTab === "BANNER_AD" && c.campaignType !== "BANNER_AD") return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(search) ||
        c.productName?.toLowerCase().includes(search) ||
        c.listing?.title?.toLowerCase().includes(search) ||
        c.advertiser?.name?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Promotions, Boosts & Placement Specs Master Workspace"
        description="Detailed control of seller search priority boosts, custom banner campaigns, wallet holds, and all 6 physical placement specifications."
        badge={`${pendingCount} Pending SLA Reviews`}
        badgeColor={pendingCount > 0 ? "amber" : "emerald"}
        secondaryActions={
          <button
            onClick={loadData}
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
            title="Refresh All Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Listing Search Boosts</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{listingBoostCount}</div>
          <div className="text-[10px] text-amber-600 font-bold">Search Priority & Badging</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Pending 24h SLA Review</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{pendingCount}</div>
          <div className="text-[10px] text-blue-600 font-bold">Wallet Holds Reserved</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Boost Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">₹{(totalRevenuePaise / 100).toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Captured from Seller Wallet</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Physical Slot Specs</span>
            <Layers className="w-4 h-4 text-[#3547D4]" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{placements.length} Slot Specs</div>
          <div className="text-[10px] text-[#3547D4] font-bold">Configured in MongoDB</div>
        </div>
      </div>

      {/* Main Consolidated Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "ALL", label: `All (${campaigns.length})` },
              { id: "LISTING_BOOST", label: `⚡ Listing Boosts (${listingBoostCount})` },
              { id: "PLACEMENTS", label: `📐 Slot Specs (${placements.length})` },
              { id: "PENDING_REVIEW", label: `Pending Review (${pendingCount})` },
              { id: "ACTIVE", label: `Active Live (${activeCount})` },
              { id: "REJECTED", label: `Rejected (${rejectedCount})` },
              { id: "PACKAGES", label: `Pricing Plans (${packages.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
              placeholder="Search campaign, listing, seller..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* VIEW A: SEPARATE DETAILED LISTING BOOSTS SECTION */}
        {activeTab === "LISTING_BOOST" ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong className="font-bold">Listing Boost Engine:</strong> Promotes existing seller product cards to priority search rankings (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">SEARCH_TOP</code>) with a <strong className="font-bold">SPONSORED</strong> badge.
                </span>
              </div>
              <span className="font-bold font-mono text-amber-800">{filteredCampaigns.length} Active Listing Boosts</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3547D4]" />
                Loading seller listing boosts...
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-[#F5F7FC] rounded-2xl border border-[#E2E8F0]">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-700">0 Listing Boosts Found</div>
                  <p className="text-xs text-slate-400">There are currently 0 listing search priority boosts submitted by sellers.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCampaigns.map((c) => (
                  <div key={c.id} className="bg-[#F5F7FC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3 shadow-sm hover:border-[#3547D4] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#111827]">{c.productName || "Listing Boost"}</h4>
                          <span className="text-[10px] font-mono text-slate-400">ID: {c.id}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : c.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-900" : "bg-red-100 text-red-700"
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="font-bold text-[#111827] flex items-center justify-between">
                        <span className="truncate">{c.listing?.title || "Product Listing Title"}</span>
                        <span className="text-[#3547D4]">₹{((c.pricing?.totalInPaise || 0) / 100).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Seller: {c.advertiser?.name || "Seller"}</span>
                        <span>Placements: {c.placementIds?.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                        <MapPin className="w-3 h-3 text-[#3547D4] shrink-0" />
                        <span className="truncate">Target: {c.locationSummary || c.targeting?.city || c.listing?.city || "All Locations"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-mono">24h SLA: {new Date(c.reviewDeadlineAt || Date.now()).toLocaleDateString("en-IN")}</span>
                      <button
                        onClick={() => setSelectedCampaign(c)}
                        className="px-3 py-1.5 bg-[#3547D4] text-white font-bold rounded-xl text-xs hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect & Moderate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "PLACEMENTS" ? (
          /* VIEW B: SEPARATE DETAILED SLOT SPECS (6) SECTION */
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#3547D4] shrink-0" />
                <span>
                  <strong className="font-bold">Physical Ad Placement Specifications:</strong> 6 dynamic slots configured in MongoDB with resolution rules, aspect ratios, file size caps, and max slot capacity.
                </span>
              </div>
              <span className="font-bold font-mono text-[#3547D4]">6 Slot Specs Configured</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {placements.map((p) => (
                <div key={p.id || p.placementId} className="bg-[#F5F7FC] p-5 rounded-2xl border border-[#E2E8F0] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#3547D4] flex items-center justify-center font-bold text-xs shrink-0">
                        <Maximize2 className="w-4.5 h-4.5 text-[#3547D4]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#111827]">{p.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">ID: {p.placementId}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-white rounded-xl border border-slate-200">
                    <div>Ratio: <span className="font-bold text-[#111827]">{p.aspectRatio}</span></div>
                    <div>Min Res: <span className="font-bold text-[#3547D4]">{p.minimumWidth}x{p.minimumHeight}</span></div>
                    <div>Max Slots: <span className="font-bold text-[#111827]">{p.maximumActiveSlots}</span></div>
                    <div>Max Size: <span className="font-bold text-[#111827]">{Math.round((p.maximumFileSizeBytes || 0) / (1024 * 1024))} MB</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>Types: {p.campaignTypes?.join(", ")}</span>
                    <span className="text-emerald-600 font-bold">● Serving</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "PACKAGES" ? (
          /* VIEW C: PRICING PLANS TAB */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Configured Seller Pricing & Boost Plans ({packages.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live monetization packages available to sellers and merchants across Omeetso.</p>
              </div>
              <Link
                to="/admin/promotions/packages"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                Manage & Add Plans <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg) => {
                const price = Math.round((pkg.priceInPaise || 0) / 100);
                const originalPrice = pkg.originalPriceInPaise ? Math.round(pkg.originalPriceInPaise / 100) : 0;
                const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                const isBoost = pkg.campaignType === "LISTING_BOOST";

                return (
                  <div
                    key={pkg.id || pkg._id}
                    className={`bg-white p-5 rounded-2xl border transition-all shadow-xs space-y-3.5 flex flex-col justify-between ${
                      pkg.active === false ? "border-slate-200 opacity-60" : isBoost ? "border-indigo-100" : "border-amber-100"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            isBoost ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isBoost ? "⚡ Boost Plan" : "🎨 Banner Ad"}
                        </span>
                        {pkg.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                            {pkg.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900">{pkg.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-900">₹{price.toLocaleString("en-IN")}</span>
                          {originalPrice > price && (
                            <span className="text-xs text-slate-400 line-through">₹{originalPrice.toLocaleString("en-IN")}</span>
                          )}
                          {discount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {pkg.durationDays} Days
                        </span>
                      </div>

                      {pkg.estimatedReach && (
                        <div className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1 font-medium text-slate-500">
                            <Eye className="w-3.5 h-3.5 text-indigo-500" /> Est. Reach:
                          </span>
                          <span className="font-bold text-slate-800">{pkg.estimatedReach}</span>
                        </div>
                      )}

                      {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {pkg.features.slice(0, 3).map((f: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">
                        Slots: {pkg.permittedPlacements?.slice(0, 2).join(", ")}
                        {pkg.permittedPlacements?.length > 2 ? ` +${pkg.permittedPlacements.length - 2}` : ""}
                      </span>
                      <Link to="/admin/promotions/packages" className="text-xs font-bold text-indigo-600 hover:underline">
                        Edit →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW D: ALL / STATUS CAMPAIGN TABLE */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F7FC] border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-3 font-bold">Campaign & Type</th>
                  <th className="p-3 font-bold">Seller</th>
                  <th className="p-3 font-bold">Listing Item</th>
                  <th className="p-3 font-bold">Target Location</th>
                  <th className="p-3 font-bold">Hold Value</th>
                  <th className="p-3 font-bold">Moderation SLA</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#3547D4]" />
                      Loading promotions & boost queue...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-700">0 Campaigns Found</div>
                        <p className="text-xs text-slate-400">There are currently 0 seller boost or banner campaigns matching this filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((c) => {
                    const isSlaBreached = c.reviewDeadlineAt && new Date(c.reviewDeadlineAt).getTime() < Date.now();
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-[#111827]">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3547D4] flex items-center justify-center font-bold text-xs shrink-0">
                              {c.campaignType === "BANNER_AD" ? <ImageIcon className="w-4 h-4 text-amber-600" /> : <Zap className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div>
                              <div className="text-[#3547D4]">{c.productName || c.campaignType}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {c.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {c.advertiser?.name || c.advertiser?.email || "Seller Account"}
                        </td>
                        <td className="p-3 font-semibold text-[#111827]">
                          <div>{c.listing?.title || "Product Listing"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Placements: {c.placementIds?.join(", ")}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#3547D4] font-bold border border-blue-200 text-[11px]">
                            <MapPin className="w-3 h-3 text-[#3547D4] shrink-0" />
                            <span className="truncate max-w-[140px]">{c.locationSummary || c.targeting?.city || c.listing?.city || "All Locations"}</span>
                          </span>
                        </td>
                        <td className="p-3 font-bold text-[#111827]">
                          ₹{((c.pricing?.totalInPaise || 0) / 100).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3">
                          {c.status === "PENDING_REVIEW" ? (
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit ${
                                isSlaBreached
                                  ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                                  : "bg-amber-100 text-amber-900 border border-amber-200"
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {isSlaBreached ? "SLA Breached" : "Due within 24h"}
                            </span>
                          ) : (
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                c.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : c.status === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {c.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="px-3 py-1.5 bg-[#3547D4] text-white rounded-xl font-bold text-xs hover:bg-blue-700 flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect & Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECTOR MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Ad Campaign Inspector ({selectedCampaign.id})</h3>
              <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#111827] uppercase text-[10px]">Creative Asset Preview:</span>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {selectedCampaign.bannerUrl ? (
                    <img
                      src={selectedCampaign.bannerUrl}
                      alt="Banner Preview"
                      className="max-h-48 w-full object-cover rounded-lg border border-slate-300 shadow-sm"
                    />
                  ) : (
                    <div className="p-6 text-center text-slate-400">No custom creative banner uploaded. Uses listing card image.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl bg-slate-50">
                <div>Campaign Type: <span className="font-bold text-[#111827]">{selectedCampaign.campaignType}</span></div>
                <div>Package: <span className="font-bold text-[#111827]">{selectedCampaign.productName || "Boost Plan"}</span></div>
                <div>Seller Account: <span className="font-bold text-[#111827]">{selectedCampaign.advertiser?.name || "Seller"}</span></div>
                <div>Reserved Hold: <span className="font-bold text-[#3547D4]">₹{((selectedCampaign.pricing?.totalInPaise || 0) / 100).toLocaleString("en-IN")}</span></div>
                <div>Listing Title: <span className="font-bold text-[#111827] truncate block">{selectedCampaign.listing?.title}</span></div>
                <div>Placements: <span className="font-bold text-[#111827]">{selectedCampaign.placementIds?.join(", ")}</span></div>
                <div className="col-span-2 flex items-center gap-1.5 p-2 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 font-medium">
                  <MapPin className="w-4 h-4 text-[#3547D4] shrink-0" />
                  <span>Target Location: <strong className="text-[#111827]">{selectedCampaign.locationSummary || selectedCampaign.targeting?.city || selectedCampaign.listing?.city || "Pan-India / All Locations"}</strong></span>
                </div>
              </div>
            </div>

            {selectedCampaign.status === "PENDING_REVIEW" && (
              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl text-xs hover:bg-red-200"
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1" />
                  Reject Campaign
                </button>
                <button
                  onClick={() => handleApprove(selectedCampaign.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve & Activate Ad
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Reject Ad Campaign ({selectedCampaign.id})
            </h3>
            <p className="text-xs text-slate-600">
              Rejecting will release the reserved wallet hold amount back to the seller's available balance.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#111827]">Mandatory Rejection Reason:</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Creative banner resolution too low, violates promotional guidelines..."
                className="w-full p-3 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection & Release Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
