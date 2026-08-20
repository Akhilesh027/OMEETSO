import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Package,
  Boxes,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  Sliders,
  DollarSign,
  Truck,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

type ProductTab =
  | "overview"
  | "details"
  | "specs"
  | "media"
  | "inventory"
  | "pricing"
  | "delivery"
  | "moderation"
  | "promotion"
  | "analytics"
  | "reports"
  | "history"
  | "notes";

export default function StoreProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const [stock, setStock] = useState(12);
  const [reservedStock] = useState(2);
  const [lowStockThreshold] = useState(5);
  const [status] = useState<"active" | "out_of_stock" | "paused">("active");

  const [notes, setNotes] = useState<string[]>([
    "Stock audit completed by Admin. Quantity corrected from 10 to 12 units on 2026-07-22.",
  ]);
  const [newNote, setNewNote] = useState("");

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Stock Level Updated", `Updated available stock for product ${productId || "PRD-201"} to ${stock} units.`);
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
        title={`Store Product Inspector: Apple iPhone 15 Pro Max 256GB`}
        description={`Product ID: ${productId || "PRD-201"} | SKU: SKU-IPH15-256 | Store: AppleWorld Hyderabad`}
        badge={`Stock: ${stock} Units (${status.toUpperCase()})`}
        badgeColor="indigo"
        secondaryActions={
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E2E8F0] text-[#111827] hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store Workspace</span>
          </button>
        }
      />

      {/* 13 INTERACTIVE TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E2E8F0] pb-2 text-xs">
        {[
          { id: "overview", label: "1. Overview" },
          { id: "details", label: "2. Details" },
          { id: "specs", label: "3. Specs" },
          { id: "media", label: "4. Media" },
          { id: "inventory", label: "5. Inventory" },
          { id: "pricing", label: "6. Pricing" },
          { id: "delivery", label: "7. Delivery" },
          { id: "moderation", label: "8. Moderation" },
          { id: "promotion", label: "9. Promotion" },
          { id: "analytics", label: "10. Analytics" },
          { id: "reports", label: "11. Reports" },
          { id: "history", label: "12. Activity History" },
          { id: "notes", label: "13. Internal Notes" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProductTab)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === tab.id
                ? "bg-[#3547D4] text-white shadow-sm"
                : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4 text-xs">
        {/* 1. OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Product Price</span>
                <div className="font-extrabold text-[#16A36A]">₹1,34,900</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Current Stock</span>
                <div className="font-extrabold text-[#111827]">{stock} Units</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Reserved Stock</span>
                <div className="font-bold text-[#3547D4]">{reservedStock} Units</div>
              </div>
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Available Stock</span>
                <div className="font-bold text-emerald-600">{stock - reservedStock} Units</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCT DETAILS */}
        {activeTab === "details" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">2. Complete Product Information</h3>
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0]">
              <div>Product Title: <strong>Apple iPhone 15 Pro Max 256GB</strong></div>
              <div>SKU Code: <strong className="font-mono text-[#3547D4]">SKU-IPH15-256</strong></div>
              <div>Category / Sub: <strong>Mobiles / Smartphones</strong></div>
              <div>Brand / Model: <strong>Apple / 15 Pro Max</strong></div>
              <div>Condition: <strong>Brand New (Sealed Box)</strong></div>
              <div>Warranty: <strong>1 Year Apple Official Warranty ✓</strong></div>
            </div>
          </div>
        )}

        {/* 5. INVENTORY CONTROL */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#111827]">5. Complete Inventory & Stock Control</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]">
              <div>Current Total Stock: <strong>{stock} Units</strong></div>
              <div>Reserved Orders: <strong>{reservedStock} Units</strong></div>
              <div>Available for Purchase: <strong>{stock - reservedStock} Units</strong></div>
              <div>Low Stock Threshold: <strong>{lowStockThreshold} Units</strong></div>
            </div>

            <form onSubmit={handleStockUpdate} className="flex items-center space-x-3 p-4 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0]">
              <label className="font-bold text-[#111827]">Update Total Stock Quantity:</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-24 p-2 rounded-lg border border-[#E2E8F0] font-bold text-center"
              />
              <button type="submit" className="px-4 py-2 bg-[#3547D4] text-white font-bold rounded-xl">
                Save & Update Stock Audit Log
              </button>
            </form>
          </div>
        )}

        {/* 13. INTERNAL NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#111827]">13. Private Admin Internal Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private note for this product..."
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

        {/* OTHER TABS */}
        {activeTab !== "overview" && activeTab !== "details" && activeTab !== "inventory" && activeTab !== "notes" && (
          <div className="p-4 bg-slate-50 rounded-xl text-slate-700">
            Inspector tab <strong>{activeTab.toUpperCase()}</strong> active for store product {productId || "PRD-201"}. All details verified.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
