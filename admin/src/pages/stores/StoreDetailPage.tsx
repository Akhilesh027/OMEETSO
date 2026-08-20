import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MOCK_STORES } from "@/services/mockDataService";
import type { Store } from "@/types";
import {
  Store as StoreIcon,
  Building,
  UserCheck,
  Package,
  FolderTree,
  MapPin,
  Clock,
  Truck,
  BadgeCheck,
  Tag,
  Zap,
  Megaphone,
  Star,
  ShieldAlert,
  BarChart3,
  History,
  FileText,
  ArrowLeft,
  Search,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

type StoreTab =
  | "overview"
  | "business"
  | "owner"
  | "products"
  | "categories"
  | "location"
  | "contact"
  | "delivery"
  | "verification"
  | "offers"
  | "promotions"
  | "ads"
  | "reviews"
  | "reports"
  | "analytics"
  | "history"
  | "notes";

interface MockStoreProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock" | "under_review";
}

const MOCK_STORE_PRODUCTS: MockStoreProduct[] = [];

export default function StoreDetailPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [liveStore, setLiveStore] = useState<Store | null>(null);
  const [liveProducts, setLiveProducts] = useState<MockStoreProduct[]>([]);

  const mockDefault = MOCK_STORES.find((s) => s.id === storeId) || null;
  const store = liveStore || mockDefault || ({} as any);
  const storeProducts = liveProducts;

  const [activeTab, setActiveTab] = useState<StoreTab>("overview");
  const [verificationStatus, setVerificationStatus] = useState(store.verificationStatus);

  React.useEffect(() => {
    if (!storeId) return;
    fetch(`https://api.omeetso.in/api/v1/stores/${storeId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const item = json.data;
          const mapped: Store = {
            ...MOCK_STORES[0],
            id: item.id || item._id,
            storeName: item.name,
            ownerName: item.email || "Store Owner",
            businessType: item.businessType || "Retailer",
            primaryCategory: item.primaryCategory || "General",
            city: item.city || "Hyderabad",
            area: item.area || "Madhapur",
            pincode: item.pincode || "500081",
            fullAddress: item.address || `${item.area || "Madhapur"}, ${item.city || "Hyderabad"} ${item.pincode || "500081"}`,
            businessMobile: item.businessMobile || "",
            email: item.email || "",
            website: item.website || "",
            gstin: item.gstin || "36AABCU9603R1ZM",
            verificationStatus: item.status === "active" || item.status === "approved" ? "verified" : "under_review",
            status: item.status || "active",
            rating: item.rating || 4.8,
            reviewCount: item.reviewCount || 12,
            logo: item.logo,
            cover: item.cover,
            workingHours: item.workingHours,
            delivery: item.delivery
          } as any;
          setLiveStore(mapped);
          setVerificationStatus(mapped.verificationStatus);
        }
      })
      .catch(() => { });

    fetch(`https://api.omeetso.in/api/v1/stores/${storeId}/listings`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mappedProds: MockStoreProduct[] = json.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            sku: `SKU-${p.id.slice(-6).toUpperCase()}`,
            category: p.category || "General",
            price: p.price || (p.priceInPaise ? p.priceInPaise / 100 : 0),
            stock: 10,
            status: (p.status?.toLowerCase() || "active") as any
          }));
          setLiveProducts(mappedProds);
        }
      })
      .catch(() => { });
  }, [storeId]);
  const [notes, setNotes] = useState<string[]>([
    "GSTIN document verified against Tax records.",
  ]);
  const [newNote, setNewNote] = useState("");

  const handleUpdateVerification = (status: "verified" | "rejected") => {
    setVerificationStatus(status);
    showSuccess("Store Verification Updated", `Store verification status set to ${status}.`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote) return;
    setNotes([`${newNote} (Added by Admin at ${new Date().toLocaleTimeString()})`, ...notes]);
    setNewNote("");
    showSuccess("Internal Note Saved", "Private admin note added.");
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Store Workspace: ${store.storeName}`}
        description={`Owner: ${store.ownerName} | City: ${store.city} | GSTIN: ${(store as any).gstin || "36AABCU9603R1ZM"}`}
        badge={`Store ID: ${store.id}`}
        badgeColor="indigo"
        secondaryActions={
          <button
            onClick={() => navigate("/admin/stores")}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E2E8F0] text-[#111827] hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stores Table</span>
          </button>
        }
      />

      {/* 17 INTERACTIVE TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E2E8F0] pb-2 text-xs">
        {[
          { id: "overview", label: "1. Overview" },
          { id: "business", label: "2. Business Info" },
          { id: "owner", label: "3. Owner" },
          { id: "products", label: "4. Store Products" },
          { id: "categories", label: "5. Categories" },
          { id: "location", label: "6. Location" },
          { id: "contact", label: "7. Contact & Hours" },
          { id: "delivery", label: "8. Delivery" },
          { id: "verification", label: "9. Verification" },
          { id: "offers", label: "10. Offers" },
          { id: "promotions", label: "11. Promotions" },
          { id: "ads", label: "12. Ads" },
          { id: "reviews", label: "13. Reviews" },
          { id: "reports", label: "14. Reports" },
          { id: "analytics", label: "15. Analytics" },
          { id: "history", label: "16. Activity History" },
          { id: "notes", label: "17. Internal Notes" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StoreTab)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeTab === tab.id
              ? "bg-[#3547D4] text-white shadow-sm"
              : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4 text-xs">
        {/* 1. OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">1. Store Complete Overview</h3>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${verificationStatus === "verified"
                  ? "bg-emerald-100 text-[#16A36A]"
                  : "bg-amber-100 text-amber-900"
                  }`}
              >
                {verificationStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Store ID</span>
                <div className="font-mono font-bold text-[#3547D4]">{store.id}</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Store Name</span>
                <div className="font-bold text-[#111827]">{store.storeName}</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Business Type</span>
                <div className="font-bold text-[#111827]">{store.businessType || "Retailer"}</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Total Products</span>
                <div className="font-extrabold text-[#111827]">{storeProducts.length} Products</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Rating</span>
                <div className="font-bold text-amber-600">★ {store.rating || 4.8} / 5 ({store.reviewCount || 12} Reviews)</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">GSTIN Number</span>
                <div className="font-mono font-bold text-[#3547D4]">{(store as any).gstin || "36AABCU9603R1ZM"}</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Area Location</span>
                <div className="font-bold text-[#111827]">{store.area}, {store.city}</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Pincode</span>
                <div className="font-bold text-[#111827]">{store.pincode}</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. BUSINESS INFORMATION */}
        {activeTab === "business" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">2. Complete Business Information</h3>
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0]">
              <div>Store Name: <strong className="text-[#111827]">{store.storeName}</strong></div>
              <div>Business Type: <strong>{store.businessType || "Retailer"}</strong></div>
              <div>GSTIN Number: <strong className="font-mono text-[#3547D4]">{(store as any).gstin || "36AABCU9603R1ZM"}</strong></div>
              <div>Primary Category: <strong>{store.primaryCategory}</strong></div>
              <div>Business Email: <strong>{(store as any).email || "Not Provided"}</strong></div>
              <div>Business Mobile: <strong>{(store as any).businessMobile || "Not Provided"}</strong></div>
              <div>Website URL: <strong className="text-[#3547D4]">{(store as any).website || "N/A"}</strong></div>
              <div>Full Address: <strong>{(store as any).fullAddress || `${store.area}, ${store.city}`}</strong></div>
            </div>
          </div>
        )}

        {/* 3. STORE OWNER */}
        {activeTab === "owner" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">3. Store Owner Profile</h3>
            <div className="p-4 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0] space-y-2">
              <div>Owner Contact/Email: <strong className="text-[#111827]">{store.ownerName}</strong></div>
              <div>Owner ID: <strong className="font-mono text-[#3547D4]">{(store as any).ownerId || "USR-LIVE"}</strong></div>
              <div>Account Status: <strong className="text-[#16A36A]">Active Account</strong></div>
            </div>
          </div>
        )}

        {/* 4. STORE PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">4. Store Products Table ({storeProducts.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="p-3">Product ID</th>
                    <th className="p-3">Product Title</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Inspect Product</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {storeProducts.map((prd) => (
                    <tr
                      key={prd.id}
                      onClick={() => navigate(`/admin/listings`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-mono font-bold text-[#3547D4]">{prd.id}</td>
                      <td className="p-3 font-bold text-[#111827]">{prd.title}</td>
                      <td className="p-3 font-mono text-slate-500">{prd.sku}</td>
                      <td className="p-3">{prd.category}</td>
                      <td className="p-3 font-bold text-[#16A36A]">₹{prd.price}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${(prd.status as string) === "active" || (prd.status as string) === "approved"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : "bg-amber-100 text-amber-900"
                            }`}
                        >
                          {prd.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/listings`);
                          }}
                          className="px-3 py-1 bg-[#3547D4] text-white font-bold rounded-lg text-xs"
                        >
                          Inspect Product
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">5. Assigned Store Categories</h3>
            <div className="p-4 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0] space-y-1">
              <div>Primary Category: <strong className="text-[#3547D4]">{store.primaryCategory} ({storeProducts.length} Products)</strong></div>
            </div>
          </div>
        )}

        {/* 6. LOCATION */}
        {activeTab === "location" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">6. Store Physical Location & Map</h3>
            <div className="p-4 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0] space-y-1">
              <div>Physical Address: <strong>{(store as any).fullAddress || `${store.area}, ${store.city}`}</strong></div>
              <div>Pincode & City: <strong>{store.city}, {store.pincode}</strong></div>
            </div>
          </div>
        )}

        {/* 7. CONTACT & WORKING HOURS */}
        {activeTab === "contact" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">7. Contact Numbers & Operating Schedule</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div>Primary Contact: <strong>{(store as any).businessMobile || "Not Provided"}</strong></div>
              <div>Business Email: <strong>{(store as any).email || "Not Provided"}</strong></div>
            </div>
          </div>
        )}

        {/* 8. DELIVERY */}
        {activeTab === "delivery" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">8. Delivery Radius & Pickup Policy</h3>
            <div className="p-4 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0] space-y-1">
              <div>Store Pickup: <strong className="text-emerald-600">Available ✓</strong></div>
              <div>Local Delivery: <strong className="text-emerald-600">Available ✓</strong></div>
            </div>
          </div>
        )}

        {/* 9. VERIFICATION */}
        {activeTab === "verification" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#111827]">9. GSTIN & Business Verification Inspector</h3>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-slate-700">
              <p>✓ GSTIN {(store as any).gstin || "36AABCU9603R1ZM"} Verified against Tax Registry.</p>
              <p>✓ Store Ownership & Address Verified ✓</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleUpdateVerification("verified")} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">
                Grant Verified Store Badge
              </button>
              <button onClick={() => handleUpdateVerification("rejected")} className="px-4 py-2 bg-[#DC3545] text-white font-bold rounded-xl">
                Reject Verification
              </button>
            </div>
          </div>
        )}

        {/* 10. OFFERS */}
        {activeTab === "offers" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">10. Active Store Offers</h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900">🎁 Monsoon Special 10% Instant Discount on Accessories</span>
            </div>
          </div>
        )}

        {/* 11. PROMOTIONS */}
        {activeTab === "promotions" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">11. Active Store Promotions</h3>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="font-bold text-[#3547D4]">👑 Monthly Store Spotlight Boost Active</span>
            </div>
          </div>
        )}

        {/* 12. ADS */}
        {activeTab === "ads" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">12. Linked Display Campaigns</h3>
            <div className="p-3 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0]">
              <span className="font-bold text-[#111827]">Campaign #250: Apple Store Festival Banner (Active)</span>
            </div>
          </div>
        )}

        {/* 13. REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">13. Store Reviews & Ratings</h3>
            <div className="p-3 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0]">
              <span className="font-bold text-amber-600">★ 4.8 / 5 Rating (140 Verified Customer Reviews)</span>
            </div>
          </div>
        )}

        {/* 14. REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">14. Store Reports (0 Active Reports)</h3>
            <p className="text-slate-500 italic">No buyer reports submitted against this store.</p>
          </div>
        )}

        {/* 15. ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">15. Store Analytics</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#F5F7FC] rounded-xl">Store Visits: <strong>2,910</strong></div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl">Buyer Chats: <strong>182</strong></div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl">Calls Initiated: <strong>64</strong></div>
            </div>
          </div>
        )}

        {/* 16. ACTIVITY HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">16. Store Activity Timeline</h3>
            <ul className="space-y-2 font-mono text-[11px] text-slate-600">
              <li>• 2026-07-01 - Store application submitted by {store.ownerName}.</li>
              <li>• 2026-07-05 - GSTIN verified and Verified Store Badge granted.</li>
            </ul>
          </div>
        )}

        {/* 17. INTERNAL NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#111827]">17. Private Admin Internal Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private admin note..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-[#3547D4] text-white font-bold rounded-xl text-xs">
                Save Private Note
              </button>
            </form>
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              {notes.map((note, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl text-slate-700 text-xs border border-slate-200">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
