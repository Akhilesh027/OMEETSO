import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDataService } from "@/services/mockDataService";
import type { Store } from "@/types";
import {
  Store as StoreIcon,
  BadgeCheck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Star,
  XCircle,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

import { getAdminStoresQueueApi, approveStoreApi, rejectStoreApi } from "@/api/adminStores.api";

export default function StoresListPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "under_review" | "verified" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<Store>>({});

  const { showSuccess, showError } = useToast();

  const loadStores = async () => {
    try {
      const res = await getAdminStoresQueueApi();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: Store[] = res.data.map((item: any) => ({
          id: item.id || item._id,
          name: item.name,
          ownerId: item.owner?.id || item.ownerId || "user_1",
          ownerName: item.owner?.name || item.email || "Merchant",
          category: item.primaryCategory || "General",
          businessType: item.businessType || "Retailer",
          rating: item.rating || 4.8,
          reviewCount: item.reviewCount || 0,
          productCount: 0,
          productsCount: item.productsCount || 0,
          followers: item.followers || 0,
          reportCount: item.reportCount || 0,
          status: (item.status?.toLowerCase() || "active") as any,
          verification: item.status === "APPROVED" || item.status === "active" ? "verified" : item.status === "REJECTED" ? "rejected" : "under_review",
          location: { city: item.city || "Hyderabad", area: item.area || "Madhapur", pincode: item.pincode || "500081" },
          gstin: "36AAAAA0000A1Z5",
          pan: "ABCDE1234F",
          joinedAt: item.createdAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.createdAt || new Date().toISOString()
        }));
        setStores(mapped);
        return;
      }
    } catch { }

    try {
      const res = await fetch("https://api.omeetso.in/api/v1/stores");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: Store[] = json.data.map((item: any) => ({
          id: item.id || item._id,
          name: item.name,
          ownerId: item.ownerId || "user_1",
          ownerName: item.email || "Store Owner",
          category: item.primaryCategory || "General",
          businessType: item.businessType || "Retailer",
          rating: item.rating || 4.8,
          reviewCount: item.reviewCount || 0,
          productCount: 0,
          productsCount: item.productsCount || 0,
          followers: item.followers || 0,
          reportCount: item.reportCount || 0,
          status: (item.status?.toLowerCase() || "active") as any,
          verification: item.status === "active" || item.status === "approved" ? "verified" : "under_review",
          location: { city: item.city || "Hyderabad", area: item.area || "Madhapur", pincode: item.pincode || "500081" },
          gstin: item.gstin || "36AABCU9603R1ZM",
          pan: "ABCDE1234F",
          joinedAt: item.createdAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.createdAt || new Date().toISOString()
        }));
        setStores(mapped);
        return;
      }
    } catch { }
    setStores([]);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.location?.city && s.location.city.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "under_review") return s.verification === "under_review" || (s.status as string) === "submitted";
    if (activeTab === "verified") return s.verification === "verified" || (s.status as string) === "approved";
    if (activeTab === "rejected") return s.verification === "rejected" || (s.status as string) === "rejected";

    return true;
  });

  const handleVerificationChange = async (storeId: string, verification: Store["verification"], reason?: string) => {
    try {
      let result;
      if (verification === "verified") {
        result = await approveStoreApi(storeId, reason);
      } else if (verification === "rejected") {
        result = await rejectStoreApi(storeId, reason || "Invalid store credentials");
      }
      if (result && !result.success) {
        console.error("Store update failed:", result.error);
      }
    } catch (err) {
      console.error("Backend store verification error:", err);
    }

    const updated = MockDataService.updateStoreVerification(storeId, verification, reason);
    setStores(updated);
    setIsInspectorOpen(false);
    showSuccess("Verification Status Updated", `Store verification set to ${verification}.`);
    loadStores();
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddOpen) {
      const updated = MockDataService.addStore(formData);
      setStores(updated);
      setIsAddOpen(false);
      showSuccess("Store Created", "New seller store registered successfully.");
    } else if (isEditOpen && selectedStore) {
      const updated = MockDataService.updateStore(selectedStore.id, formData);
      setStores(updated);
      setIsEditOpen(false);
      showSuccess("Store Updated", "Store details updated successfully.");
    }
    setFormData({});
  };

  const handleDeleteStore = (storeId: string) => {
    if (window.confirm("Are you sure you want to delete this store record permanently?")) {
      const updated = MockDataService.deleteStore(storeId);
      setStores(updated);
      showSuccess("Store Deleted", "Store record permanently removed.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Seller Stores & GSTIN Verification Applications"
        description="Review GSTIN documentation, trade licenses, physical storefront verifications, and badge toggles."
        badge={`${stores.length} Registered Stores`}
        badgeColor="info"
        primaryAction={
          <button
            onClick={() => {
              setFormData({ category: "Electronics", verification: "under_review" });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Store Entry</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Stores (${stores.length})` },
              { id: "under_review", label: "Verification Applications" },
              { id: "verified", label: "GSTIN Verified Stores" },
              { id: "rejected", label: "Rejected Applications" },
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

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search store name, owner, city..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Store Name & ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Owner / Seller</th>
                <th className="p-3">Location</th>
                <th className="p-3">Products & Stats</th>
                <th className="p-3">GSTIN Verification</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching store entries found.
                  </td>
                </tr>
              ) : (
                filteredStores.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/admin/stores/${s.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-[#111827]">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
                          <StoreIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 capitalize text-slate-600 font-medium">{s.category}</td>
                    <td className="p-3 font-medium text-[#111827]">{s.ownerName}</td>
                    <td className="p-3 text-slate-500">{s.location?.city || "Hyderabad"} ({s.location?.pincode})</td>
                    <td className="p-3 text-slate-600">
                      <div>Products: <span className="font-bold text-[#111827]">{s.productsCount}</span></div>
                      <div className="flex items-center space-x-1 text-[11px] text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{s.rating}</span>
                        <span className="text-slate-400">({s.followers} followers)</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize ${s.verification === "verified"
                          ? "bg-emerald-100 text-[#16A36A]"
                          : s.verification === "under_review"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-red-100 text-[#DC3545]"
                          }`}
                      >
                        {s.verification === "verified" && <BadgeCheck className="w-3 h-3" />}
                        <span>{(s.verification || "under_review").replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/stores/${s.id}`);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold bg-indigo-50 text-[#3547D4] hover:bg-[#3547D4] hover:text-white rounded-xl transition-colors border border-indigo-200"
                          title="View Full Store Workspace"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStore(s);
                            setIsInspectorOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                          title="Inspect GSTIN Documents"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStore(s);
                            setFormData(s);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                          title="Edit Store Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStore(s.id)}
                          className="p-1.5 text-slate-400 hover:text-[#DC3545] hover:bg-red-50 rounded-lg"
                          title="Delete Store"
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
      </div>

      {/* GSTIN DOCUMENT VERIFICATION INSPECTOR MODAL */}
      {isInspectorOpen && selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Store GSTIN Verification Inspection ({selectedStore.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FC] rounded-xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
                  <StoreIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#111827]">{selectedStore.name}</div>
                  <div className="text-[#64748B]">Owner: {selectedStore.ownerName} (ID: {selectedStore.ownerId})</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-[11px]">
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>GSTIN Document Verification Status:</span>
                  <span className="capitalize text-xs underline">{selectedStore.verification}</span>
                </div>
                <p className="text-amber-800">
                  GSTIN No: <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-[#111827]">36AAAAA0000A1Z5</code>
                </p>
                <p className="text-amber-800">Trade License: Registered in Telangana State Commerce Board</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl">
                <div>Category: <span className="font-bold text-[#111827]">{selectedStore.category}</span></div>
                <div>Location: <span className="font-bold text-[#111827]">{selectedStore.location?.city}</span></div>
                <div>Products Listed: <span className="font-bold text-[#111827]">{selectedStore.productsCount}</span></div>
                <div>Store Rating: <span className="font-bold text-amber-600">★ {selectedStore.rating}</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#111827]">Verification Action Controls:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleVerificationChange(selectedStore.id, "verified", "Approved GSTIN and trade license")}
                  className="py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 flex items-center justify-center space-x-1"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Verify Store & Grant Badge</span>
                </button>
                <button
                  onClick={() => handleVerificationChange(selectedStore.id, "rejected", "Rejected GSTIN verification submission")}
                  className="py-2.5 bg-[#DC3545] text-white font-bold rounded-xl text-xs hover:bg-red-700 flex items-center justify-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT STORE MODAL */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSaveStore} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">{isAddOpen ? "Register New Seller Store" : "Edit Store Details"}</h3>
              <button type="button" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hyderabad Digital Superstore"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName || ""}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Priya B."
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category || "Electronics"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
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
                Save Store Details
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
