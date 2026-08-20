import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Star,
  MessageCircle,
  Flag,
  Store,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Filter,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerId: string;
  targetName: string;
  targetType: "store" | "seller" | "product";
  rating: number;
  comment: string;
  isReported: boolean;
  status: "published" | "hidden" | "under_review";
  createdAt: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "REV-101",
    reviewerName: "Ravi Kumar",
    reviewerId: "u_ravi",
    targetName: "AppleWorld Hyderabad",
    targetType: "store",
    rating: 5,
    comment: "Excellent original iPhone with genuine warranty bill! Fast local pickup in Kondapur.",
    isReported: false,
    status: "published",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "REV-102",
    reviewerName: "Meera Sharma",
    reviewerId: "u_meera",
    targetName: "Furnicraft Studio",
    targetType: "store",
    rating: 1,
    comment: "Delivery was delayed by 3 days and sofa wood had scratches. Unresponsive seller.",
    isReported: true,
    status: "under_review",
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: "REV-103",
    reviewerName: "Suspicious Seller",
    reviewerId: "u_bad",
    targetName: "Royal Enfield Classic 350",
    targetType: "product",
    rating: 1,
    comment: "Fake seller! Tried to ask off-platform advance payment via GPay before showing bike.",
    isReported: true,
    status: "under_review",
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: "REV-104",
    reviewerName: "Ananya Rao",
    reviewerId: "u_ananya",
    targetName: "AppleWorld Hyderabad",
    targetType: "store",
    rating: 4,
    comment: "Good pricing on accessories, store staff was polite and verified GSTIN invoice.",
    isReported: false,
    status: "published",
    createdAt: new Date(Date.now() - 172800_000).toISOString(),
  },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [activeTab, setActiveTab] = useState<"all" | "reported" | "published" | "hidden">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const { showSuccess } = useToast();

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "reported") return r.isReported || r.status === "under_review";
    if (activeTab === "published") return r.status === "published";
    if (activeTab === "hidden") return r.status === "hidden";

    return true;
  });

  const handleStatusChange = (reviewId: string, status: ReviewItem["status"]) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status, isReported: status === "published" ? false : r.isReported } : r))
    );
    setIsInspectorOpen(false);
    showSuccess("Review Moderated", `Review status changed to ${status}.`);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review permanently?")) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setIsInspectorOpen(false);
      showSuccess("Review Deleted", "Review permanently removed.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reviews & Ratings Moderation Desk"
        description="Inspect customer reviews, store ratings, reported fake feedback, and abusive content."
        badge={`${reviews.length} Total Reviews`}
        badgeColor="indigo"
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Reviews (${reviews.length})` },
              { id: "reported", label: "Reported / Flagged" },
              { id: "published", label: "Approved Published" },
              { id: "hidden", label: "Hidden / Moderated" },
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
              placeholder="Search reviewer, store, comment..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Review ID & Reviewer</th>
                <th className="p-3">Target Store / Product</th>
                <th className="p-3">Rating Score</th>
                <th className="p-3">Comment Text</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <div>{r.reviewerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {r.id}</div>
                    </td>
                    <td className="p-3 font-medium text-[#3547D4] capitalize">
                      {r.targetName} ({r.targetType})
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{r.rating} / 5</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs truncate">
                      {r.comment}
                      {r.isReported && (
                        <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-red-100 text-[#DC3545] rounded">
                          🚩 Flagged
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          r.status === "published"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : r.status === "under_review"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedReview(r);
                            setIsInspectorOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                          title="Inspect Review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(r.id, "published")}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Approve Review"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 text-slate-400 hover:text-[#DC3545] hover:bg-red-50 rounded-lg"
                          title="Delete Review"
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

      {/* REVIEW INSPECTOR MODAL */}
      {isInspectorOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Review Moderation ({selectedReview.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-[#111827]">
                  <span>Reviewer: {selectedReview.reviewerName}</span>
                  <span className="text-[#3547D4]">★ {selectedReview.rating} Stars</span>
                </div>
                <div className="text-[11px] text-slate-500">Target: {selectedReview.targetName}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-[#111827] mb-1">Full Comment Text:</p>
                <p className="text-slate-700 italic">"{selectedReview.comment}"</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#111827]">Moderation Actions:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedReview.id, "published")}
                  className="py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                >
                  ✓ Publish
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReview.id, "hidden")}
                  className="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600"
                >
                  👁 Hide Review
                </button>
                <button
                  onClick={() => handleDeleteReview(selectedReview.id)}
                  className="py-2 bg-[#DC3545] text-white font-bold rounded-xl text-xs hover:bg-red-700"
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
