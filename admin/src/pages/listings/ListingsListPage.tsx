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
  CheckCheck,
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
  Loader2,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

import {
  getAdminListingsQueueApi,
  approveListingApi,
  rejectListingApi,
  bulkApproveListingsApi,
  updateListingStatusApi,
  createAdminListingApi,
  updateAdminListingApi,
  deleteAdminListingApi
} from "@/api/adminListings.api";

export default function ListingsListPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const cached = localStorage.getItem("omeetso_admin_listings_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { }
    return [];
  });
  const [activeTab, setActiveTab] = useState<
    "all" | "pending_review" | "reported" | "requires_changes" | "active" | "rejected" | "removed"
  >("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");

  // Selection & Bulk Actions state
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  // Modals state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
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
      const res = await getAdminListingsQueueApi({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        const mapped: Listing[] = res.data.map((item: any) => {
          const price = item.price !== undefined && item.price !== null
            ? Number(item.price)
            : (item.priceInPaise ? Number(item.priceInPaise) / 100 : 0);
          const priceInPaise = item.priceInPaise !== undefined && item.priceInPaise !== null
            ? Number(item.priceInPaise)
            : (price ? Math.round(price * 100) : 0);

          return {
            id: item.id || item._id,
            title: item.title,
            description: item.description || item.title,
            price,
            priceInPaise,
            currency: "INR",
            condition: item.condition || "Like New",
            categoryId: item.categoryId || item.category || "General",
            subcategoryId: item.subcategoryId,
            sellerId: item.seller?.id || item.sellerId || "user_1",
            sellerName: item.seller?.name || item.sellerName || "Omeetso Seller",
            status: (item.status?.toLowerCase() || "submitted") as any,
            images: item.images || [],
            coverIndex: item.coverIndex || 0,
            location: { city: item.city || "Hyderabad", area: item.area || "Madhapur", pincode: item.pincode || "500081" },
            reportCount: 0,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.createdAt || new Date().toISOString()
          };
        });
        setListings(mapped);
        try {
          localStorage.setItem("omeetso_admin_listings_cache", JSON.stringify(mapped));
        } catch { }
        return;
      }
    } catch (err) {
      console.error("[ListingsListPage] Error in loadListings:", err);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      (l.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.sellerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.categoryId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.location?.city && l.location.city.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "pending_review") return l.status === "pending_review" || l.status === "submitted" || l.status === "under_review";
    if (activeTab === "reported") return l.status === "reported" || (l.reportCount || 0) > 0;
    if (activeTab === "requires_changes") return l.status === "requires_changes" || l.status === "changes_required";
    if (activeTab === "active") return l.status === "active" || l.status === "approved";
    if (activeTab === "rejected") return l.status === "rejected";
    if (activeTab === "removed") return l.status === "removed";

    return true;
  });

  const isAllSelected =
    filteredListings.length > 0 &&
    filteredListings.every((l) => selectedListingIds.includes(l.id));

  const isSomeSelected =
    filteredListings.some((l) => selectedListingIds.includes(l.id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const currentFilteredIds = new Set(filteredListings.map((l) => l.id));
      setSelectedListingIds((prev) => prev.filter((id) => !currentFilteredIds.has(id)));
    } else {
      const merged = new Set([...selectedListingIds, ...filteredListings.map((l) => l.id)]);
      setSelectedListingIds(Array.from(merged));
    }
  };

  const toggleSelectListing = (id: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setSelectedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedListingIds.length === 0) return;
    const count = selectedListingIds.length;
    if (!window.confirm(`Are you sure you want to approve ${count} selected listing${count > 1 ? "s" : ""}?`)) {
      return;
    }

    setIsBulkApproving(true);
    try {
      const res = await bulkApproveListingsApi(selectedListingIds, "Bulk approved by admin");
      if (res.success) {
        showSuccess(
          "Listings Approved",
          `Successfully approved ${count} listing${count > 1 ? "s" : ""}.`
        );
        setSelectedListingIds([]);
        await loadListings();
      } else {
        showError("Bulk Approval Failed", res.error || "Unable to bulk approve listings.");
      }
    } catch (err: any) {
      showError("Error", err?.message || "Failed to process bulk approval.");
    } finally {
      setIsBulkApproving(false);
    }
  };

  const handleStatusChange = async (listingId: string, status: Listing["status"], reason?: string) => {
    try {
      if (status === "active" || status === "approved") {
        await approveListingApi(listingId, reason);
      } else if (status === "rejected") {
        await rejectListingApi(listingId, reason || "Violates platform content policy");
      } else {
        await updateListingStatusApi(listingId, status, reason);
      }
      showSuccess("Listing Updated", `Listing status changed to ${status.replace("_", " ")}.`);
    } catch (err) {
      console.error("Failed backend persistence:", err);
      showError("Status Update Error", "Unable to update listing status on server.");
    }

    setIsInspectorOpen(false);
    await loadListings();
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditOpen && selectedListing) {
        const res = await updateAdminListingApi(selectedListing.id, formData);
        if (res.success) {
          showSuccess("Listing Updated", "Product listing updated in database.");
        } else {
          showError("Update Failed", res.error || "Could not update listing");
        }
        setIsEditOpen(false);
      }
    } catch (err) {
      showError("Server Error", "Failed to persist listing changes");
    }
    setFormData({});
    await loadListings();
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this listing from the database?")) {
      setListings((prev) => prev.filter((item) => item.id !== listingId));
      try {
        const res = await deleteAdminListingApi(listingId);
        if (res.success) {
          showSuccess("Listing Deleted", "Product listing permanently deleted from database.");
        } else {
          showError("Delete Failed", res.error || "Could not delete listing from database");
        }
      } catch {
        showError("Server Error", "Unable to delete listing from database");
      }
      await loadListings();
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

        {/* Bulk Action Bar */}
        {selectedListingIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-xl shadow-xs transition-all animate-in fade-in-50">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-7 h-7 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs">
                {selectedListingIds.length}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {selectedListingIds.length} listing{selectedListingIds.length > 1 ? "s" : ""} selected
                </p>
                <p className="text-[11px] text-slate-500">
                  Choose an action to apply across all selected listings
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedListingIds([])}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={isBulkApproving}
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {isBulkApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    <span>Bulk Approve ({selectedListingIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* View render */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#3547D4] focus:ring-[#3547D4] cursor-pointer"
                      title={isAllSelected ? "Deselect all" : "Select all"}
                    />
                  </th>
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
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No matching listings found.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((l) => {
                    const isSelected = selectedListingIds.includes(l.id);
                    return (
                      <tr
                        key={l.id}
                        onClick={() => navigate(`/admin/listings/${l.id}`)}
                        className={`transition-colors cursor-pointer ${isSelected ? "bg-indigo-50/70 hover:bg-indigo-100/60" : "hover:bg-slate-50"
                          }`}
                      >
                        <td
                          className="p-3 w-10 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelectListing(l.id, e)}
                            className="w-4 h-4 rounded border-slate-300 text-[#3547D4] focus:ring-[#3547D4] cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={(l.images && l.images[0]) || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100"}
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
                          ₹{(l?.price ?? ((l?.priceInPaise || 0) / 100)).toLocaleString("en-IN")}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedListing(l);
                                setIsBoostOpen(true);
                              }}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                              title="Boost as Ad Campaign"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteListing(l.id);
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 rounded-lg transition-colors inline-flex items-center justify-center"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((l) => {
              const isSelected = selectedListingIds.includes(l.id);
              return (
                <div
                  key={l.id}
                  className={`relative bg-slate-50 rounded-2xl border transition-all overflow-hidden p-3 space-y-2 ${isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20"
                      : "border-[#E2E8F0]"
                    }`}
                >
                  {/* Select Checkbox on Card */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-slate-200 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelectListing(l.id, e)}
                      className="w-4 h-4 rounded border-slate-300 text-[#3547D4] focus:ring-[#3547D4] cursor-pointer block"
                    />
                  </div>
                  <img
                    src={(l.images && l.images[0]) || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400"}
                    alt={l.title}
                    className="w-full h-36 object-cover rounded-xl border border-slate-200"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{l.categoryId}</span>
                    <span className="text-xs font-extrabold text-[#3547D4]">₹{(l.price ?? ((l.priceInPaise || 0) / 100)).toLocaleString("en-IN")}</span>
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
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedListing(l);
                          setIsBoostOpen(true);
                        }}
                        className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Boost Listing"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteListing(l.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                src={(selectedListing.images && selectedListing.images[0]) || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400"}
                alt={selectedListing.title}
                className="w-full h-44 object-cover rounded-xl border border-slate-200"
              />
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#111827]">{selectedListing.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500">Product Amount:</span>
                  <span className="text-base font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    ₹{(selectedListing.price ?? ((selectedListing.priceInPaise || 0) / 100)).toLocaleString("en-IN")}
                  </span>
                </div>
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

            <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
              <div>
                <div className="text-xs font-bold text-[#111827] mb-1">Image & Listing Moderation Feedback:</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "Product images are blurry or low resolution",
                    "Please provide clear photos showing all angles",
                    "Poor lighting or glare makes details unclear",
                    "Please upload well-lit photos with clear condition labels"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setChangeNotes(preset)}
                      className={`px-2 py-1 text-[11px] rounded-lg border transition-colors ${changeNotes === preset
                        ? "bg-amber-100 border-amber-400 text-amber-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="Optional custom moderation notes / instructions for seller..."
                  className="w-full p-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-1 focus:ring-[#3547D4]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    handleStatusChange(selectedListing.id, "active", changeNotes || "Approved by admin moderator");
                    setIsInspectorOpen(false);
                  }}
                  className="py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(
                      selectedListing.id,
                      "requires_changes",
                      changeNotes || "Product images appear blurry or require additional detail photos. Please upload clearer photos."
                    );
                    setIsInspectorOpen(false);
                  }}
                  className="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600 transition-colors"
                >
                  ✎ Needs Changes
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(
                      selectedListing.id,
                      "rejected",
                      changeNotes || "Rejected due to content or image clarity policy violation"
                    );
                    setIsInspectorOpen(false);
                  }}
                  className="py-2 bg-[#DC3545] text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-colors"
                >
                  ✕ Reject Listing
                </button>
                <button
                  onClick={() => {
                    setIsInspectorOpen(false);
                    setIsBoostOpen(true);
                  }}
                  className="py-2 bg-[#3547D4] text-white font-bold rounded-xl text-xs hover:bg-[#111E4D] transition-colors"
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

      {/* EDIT LISTING DETAILS MODAL */}
      {isEditOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSaveListing} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Edit Listing Details</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                    value={formData.price !== undefined && formData.price !== null ? formData.price : (formData.priceInPaise ? formData.priceInPaise / 100 : "")}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setFormData({ ...formData, price: p, priceInPaise: Math.round(p * 100) });
                    }}
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
                onClick={() => setIsEditOpen(false)}
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
