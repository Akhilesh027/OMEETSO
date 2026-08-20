import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDataService } from "@/services/mockDataService";
import type { Listing, AdCampaign } from "@/types";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Plus,
  Search,
  Eye,
  Megaphone,
  Grid,
  List,
  DollarSign,
  MapPin,
  Tag,
  Zap,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

import { getAdminListingsQueueApi, approveListingApi, rejectListingApi } from "@/api/adminListings.api";

export default function ListingsListPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending_review" | "reported" | "requires_changes" | "active" | "rejected" | "removed"
  >("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBoostOpen, setIsBoostOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<Listing>>({});
  const [rejectReason, setRejectReason] = useState("");
  const [changeNotes, setChangeNotes] = useState("");

  // Boost form
  const [boostPlacement, setBoostPlacement] = useState<AdCampaign["placement"]>("SEARCH_NATIVE_RESULT");
  const [boostBudget, setBoostBudget] = useState<number>(500);
  const [boostDays, setBoostDays] = useState<number>(7);

  const { showSuccess, showError } = useToast();

  const loadListings = async () => {
    try {
      const res = await getAdminListingsQueueApi();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: Listing[] = res.data.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          description: item.description,
          price: item.priceInPaise ? item.priceInPaise / 100 : item.price || 0,
          currency: "INR",
          condition: item.condition,
          categoryId: item.categoryId || item.category,
          subcategoryId: item.subcategoryId,
          sellerId: item.seller?.id || item.sellerId || "user_1",
          sellerName: item.seller?.name || item.sellerName || "Omeetso Seller",
          status: (item.status?.toLowerCase() || "active") as any,
          images: item.images || [],
          coverIndex: item.coverIndex || 0,
          location: { city: item.city || "Hyderabad", area: item.area || "Madhapur", pincode: item.pincode || "500081" },
          reportCount: 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.createdAt || new Date().toISOString()
        }));
        setListings(mapped);
        return;
      }
    } catch { }

    try {
      const res = await fetch("http://localhost:3000/api/v1/listings/feed");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: Listing[] = json.data.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          description: item.description || item.title,
          price: item.priceInPaise ? item.priceInPaise / 100 : item.price || 0,
          currency: "INR",
          condition: item.condition || "Like New",
          categoryId: item.categoryId || "general",
          subcategoryId: item.subcategoryId,
          sellerId: item.sellerId || "u_live",
          sellerName: item.sellerName || "Omeetso Seller",
          status: (item.status?.toLowerCase() || "active") as any,
          images: item.images || [],
          coverIndex: item.coverIndex || 0,
          location: { city: item.city || "Hyderabad", area: item.area || "Madhapur", pincode: item.pincode || "500081" },
          reportCount: 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.createdAt || new Date().toISOString()
        }));
        setListings(mapped);
        return;
      }
    } catch { }
    setListings([]);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.sellerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.categoryId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.location?.city && l.location.city.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "pending_review") return l.status === "pending_review" || l.status === "submitted";
    if (activeTab === "reported") return l.status === "reported" || (l.reportCount || 0) > 0;
    if (activeTab === "requires_changes") return l.status === "requires_changes" || l.status === "changes_required";
    if (activeTab === "active") return l.status === "active" || l.status === "approved";
    if (activeTab === "rejected") return l.status === "rejected";
    if (activeTab === "removed") return l.status === "removed";

    return true;
  });

  const handleStatusChange = async (listingId: string, status: Listing["status"], reason?: string) => {
    try {
      if (status === "active" || status === "approved") {
        await approveListingApi(listingId, reason);
      } else if (status === "rejected") {
        await rejectListingApi(listingId, reason || "Violates platform content policy");
      }
    } catch (err) {
      console.error("Failed backend persistence:", err);
    }

    const updated = MockDataService.updateListingStatus(listingId, status, reason);
    setListings(updated);
    setIsInspectorOpen(false);
    showSuccess("Listing Updated", `Listing status changed to ${status.replace("_", " ")}.`);
    loadListings();
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddOpen) {
      const updated = MockDataService.addListing(formData);
      setListings(updated);
      setIsAddOpen(false);
      showSuccess("Listing Created", "New product listing submitted successfully.");
    } else if (isEditOpen && selectedListing) {
      const updated = MockDataService.updateListing(selectedListing.id, formData);
      setListings(updated);
      setIsEditOpen(false);
      showSuccess("Listing Updated", "Product listing updated successfully.");
    }
    setFormData({});
  };

  const handleDeleteListing = (listingId: string) => {
    if (window.confirm("Are you sure you want to delete this listing record permanently?")) {
      const updated = MockDataService.deleteListing(listingId);
      setListings(updated);
      showSuccess("Listing Deleted", "Listing record permanently removed.");
    }
  };

  const handleBoostListing = () => {
    if (!selectedListing) return;
    MockDataService.boostListing(selectedListing, boostPlacement, boostBudget, boostDays);
    loadListings();
    setIsBoostOpen(false);
    showSuccess("Listing Boosted", `Created ad campaign for ${selectedListing.title} on placement ${boostPlacement}.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Listings Moderation Queue & Catalog"
        description="Review product submissions, counterfeit checks, price approvals, and ad boosting."
        badge={`${listings.length} Catalog Items`}
        badgeColor="warning"
        primaryAction={
          <button
            onClick={() => {
              setFormData({ categoryId: "electronics", priceInPaise: 499900 });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product Listing</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs, View Mode, Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All (${listings.length})` },
              { id: "pending_review", label: "Pending Review" },
              { id: "reported", label: "Reported" },
              { id: "requires_changes", label: "Requires Changes" },
              { id: "active", label: "Approved Active" },
              { id: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${activeTab === tab.id
                  ? "bg-[#3547D4] text-white shadow-sm"
                  : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#F5F7FC] p-1 rounded-xl border border-[#E2E8F0]">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === "table" ? "bg-white text-[#3547D4] shadow-sm" : "text-[#64748B]"
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === "grid" ? "bg-white text-[#3547D4] shadow-sm" : "text-[#64748B]"
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, seller, category..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
          </div>
        </div>

        {/* View render */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3">Product / Title</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No matching listings found.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => navigate(`/admin/listings/${l.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={(l.images && l.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                            alt={l.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[#111827] line-clamp-1">{l.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {l.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-[#3547D4] text-xs">
                        ₹{(l?.priceInPaise ? l.priceInPaise / 100 : (l?.price ?? 0)).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 capitalize font-medium text-slate-600">{l.categoryId}</td>
                      <td className="p-3 font-medium text-[#111827]">{l.sellerName}</td>
                      <td className="p-3 text-slate-500">{l.location?.city || "Hyderabad"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize ${l.status === "active"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : l.status === "pending_review"
                              ? "bg-amber-100 text-amber-900"
                              : l.status === "reported"
                                ? "bg-red-100 text-[#DC3545]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {l.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/listings/${l.id}`);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold bg-indigo-50 text-[#3547D4] hover:bg-[#3547D4] hover:text-white rounded-xl transition-colors border border-indigo-200"
                            title="View Full Listing Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedListing(l);
                              setIsInspectorOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                            title="Quick Moderation Review"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedListing(l);
                              setIsBoostOpen(true);
                            }}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                            title="Boost as Ad Campaign"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedListing(l);
                              setFormData(l);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                            title="Edit Listing"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteListing(l.id)}
                            className="p-1.5 text-slate-400 hover:text-[#DC3545] hover:bg-red-50 rounded-lg"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((l) => (
              <div key={l.id} className="bg-slate-50 rounded-2xl border border-[#E2E8F0] overflow-hidden p-3 space-y-2">
                <img
                  src={(l.images && l.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
                  alt={l.title}
                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{l.categoryId}</span>
                  <span className="text-xs font-extrabold text-[#3547D4]">₹{((l.priceInPaise || 0) / 100).toLocaleString("en-IN")}</span>
                </div>
                <h4 className="text-xs font-bold text-[#111827] line-clamp-1">{l.title}</h4>
                <div className="text-[11px] text-[#64748B]">Seller: {l.sellerName}</div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <button
                    onClick={() => {
                      setSelectedListing(l);
                      setIsInspectorOpen(true);
                    }}
                    className="px-3 py-1 text-xs font-bold bg-[#3547D4] text-white rounded-lg hover:bg-[#111E4D]"
                  >
                    Inspect Queue
                  </button>
                  <button
                    onClick={() => {
                      setSelectedListing(l);
                      setIsBoostOpen(true);
                    }}
                    className="p-1 text-amber-600 hover:bg-amber-100 rounded-lg"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INSPECTOR & MODERATION REVIEW MODAL */}
      {isInspectorOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Listing Inspection ({selectedListing.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <img
                src={(selectedListing.images && selectedListing.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
                alt={selectedListing.title}
                className="w-full h-44 object-cover rounded-xl border border-slate-200"
              />
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#111827]">{selectedListing.title}</h4>
                <div className="text-base font-extrabold text-[#3547D4]">₹{((selectedListing.priceInPaise || 0) / 100).toLocaleString("en-IN")}</div>
                <div>Category: <span className="font-bold capitalize">{selectedListing.categoryId}</span></div>
                <div>Seller: <span className="font-bold">{selectedListing.sellerName}</span></div>
                <div>Location: <span className="font-bold">{selectedListing.location?.city || "Hyderabad"}</span></div>
                <div>Status: <span className="font-bold capitalize">{selectedListing.status.replace("_", " ")}</span></div>
                {(selectedListing.reportCount || 0) > 0 && (
                  <div className="p-2 bg-red-50 text-[#DC3545] font-bold rounded-lg">
                    ⚠️ {selectedListing.reportCount} Safety Reports Flagged!
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#111827]">Moderation Action Buttons:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedListing.id, "active", "Approved by admin moderator")}
                  className="py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleStatusChange(selectedListing.id, "requires_changes", "Requested changes")}
                  className="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600"
                >
                  ✎ Needs Changes
                </button>
                <button
                  onClick={() => handleStatusChange(selectedListing.id, "rejected", "Rejected due to policy violation")}
                  className="py-2 bg-[#DC3545] text-white font-bold rounded-xl text-xs hover:bg-red-700"
                >
                  ✕ Reject Listing
                </button>
                <button
                  onClick={() => {
                    setIsInspectorOpen(false);
                    setIsBoostOpen(true);
                  }}
                  className="py-2 bg-[#3547D4] text-white font-bold rounded-xl text-xs hover:bg-[#111E4D]"
                >
                  ⚡ Boost as Ad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOST AS AD WIZARD MODAL */}
      {isBoostOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">⚡ Boost Listing to Promoted Ad</h3>
              <button onClick={() => setIsBoostOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="font-bold text-amber-900">{selectedListing.title}</p>
                <p className="text-[11px] text-amber-800">Seller: {selectedListing.sellerName}</p>
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Target Ad Placement Slot</label>
                <select
                  value={boostPlacement}
                  onChange={(e) => setBoostPlacement(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                >
                  <option value="SEARCH_NATIVE_RESULT">Search Native Results (Top Sponsored Slot)</option>
                  <option value="HOME_HERO">Home Page Top Banner Carousel</option>
                  <option value="CATEGORY_BANNER">Category Top Sponsored Banner</option>
                  <option value="STORE_SPOTLIGHT">Store Spotlight Featured Grid</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Budget Amount (₹)</label>
                  <input
                    type="number"
                    value={boostBudget}
                    onChange={(e) => setBoostBudget(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={boostDays}
                    onChange={(e) => setBoostDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={() => setIsBoostOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Cancel
              </button>
              <button onClick={handleBoostListing} className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]">
                Launch Ad Boost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LISTING MODAL */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSaveListing} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">{isAddOpen ? "Create New Product Listing" : "Edit Listing Details"}</h3>
              <button type="button" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM4 Wireless Headphones"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Price (Rupees ₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.priceInPaise ? formData.priceInPaise / 100 : ""}
                    onChange={(e) => setFormData({ ...formData, priceInPaise: Number(e.target.value) * 100 })}
                    placeholder="15000"
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Category</label>
                  <select
                    value={formData.categoryId || "mobiles"}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  >
                    <option value="mobiles">Mobiles & Electronics</option>
                    <option value="vehicles">Vehicles & Bikes</option>
                    <option value="furniture">Furniture & Home</option>
                    <option value="fashion">Fashion & Clothing</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]"
              >
                Save Product Listing
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
