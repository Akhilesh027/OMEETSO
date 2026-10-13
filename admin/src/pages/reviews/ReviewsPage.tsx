import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import {
  getAdminReviewsApi,
  updateAdminReviewStatusApi,
  deleteAdminReviewApi,
  AdminReviewItem
} from "@/api/adminReviews.api";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/config/api";
import { AdminAuthService } from "@/services/adminAuthService";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "reported" | "published" | "hidden">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const [selectedReview, setSelectedReview] = useState<AdminReviewItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const { showSuccess, showError } = useToast();

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const res = await getAdminReviewsApi();
    setLoading(false);
    if (res.success && res.data) {
      setReviews(res.data);
    } else {
      showError("Failed to Load Reviews", res.error || "Could not fetch platform reviews");
    }
  }, [showError]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ── Socket.IO Real-Time Connection ──
  useEffect(() => {
    const token = AdminAuthService.getAccessToken();
    if (!token) return;

    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("admin:join_monitoring");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Real-Time Review Created Listener
    socket.on("admin:review:new", (newReview: AdminReviewItem) => {
      setReviews((prev) => {
        if (prev.some((r) => r.id === newReview.id)) {
          return prev.map((r) => (r.id === newReview.id ? newReview : r));
        }
        return [newReview, ...prev];
      });
      showSuccess(
        "⭐ New Real-Time Review Received",
        `${newReview.reviewerName} reviewed ${newReview.targetName} (${newReview.rating}★)`
      );
    });

    // Real-Time Review Status Update Listener
    socket.on("admin:review:status_updated", (payload: { id: string; status: any; isReported?: boolean }) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === payload.id
            ? {
                ...r,
                status: payload.status,
                isReported: typeof payload.isReported === "boolean" ? payload.isReported : r.isReported
              }
            : r
        )
      );
    });

    // Real-Time Review Deleted Listener
    socket.on("admin:review:deleted", (payload: { id: string }) => {
      setReviews((prev) => prev.filter((r) => r.id !== payload.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [showSuccess]);

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

  const handleStatusChange = async (reviewId: string, status: AdminReviewItem["status"]) => {
    setActionLoading(true);
    const res = await updateAdminReviewStatusApi(reviewId, status, status === "published" ? false : undefined);
    setActionLoading(false);

    if (res.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, status, isReported: status === "published" ? false : r.isReported } : r
        )
      );
      setIsInspectorOpen(false);
      showSuccess("Review Moderated", `Review status changed to ${status}.`);
    } else {
      showError("Moderation Failed", res.error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review permanently?")) return;

    setActionLoading(true);
    const res = await deleteAdminReviewApi(reviewId);
    setActionLoading(false);

    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setIsInspectorOpen(false);
      showSuccess("Review Deleted", "Review permanently removed from database.");
    } else {
      showError("Delete Failed", res.error);
    }
  };

  const reportedCount = reviews.filter((r) => r.isReported || r.status === "under_review").length;
  const publishedCount = reviews.filter((r) => r.status === "published").length;
  const hiddenCount = reviews.filter((r) => r.status === "hidden").length;

  return (
    <PageContainer>
      <PageHeader
        title="Reviews & Ratings Moderation Desk"
        description="Audit customer reviews in real time, inspect store ratings, reported fake feedback, and abusive content."
        badge={socketConnected ? `Realtime Active (${reviews.length} Reviews)` : `${reviews.length} Total Reviews`}
        badgeColor={socketConnected ? "success" : "indigo"}
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search & Realtime Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Reviews (${reviews.length})` },
              { id: "reported", label: `Reported / Flagged (${reportedCount})` },
              { id: "published", label: `Approved Published (${publishedCount})` },
              { id: "hidden", label: `Hidden / Moderated (${hiddenCount})` },
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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 shrink-0">
              {socketConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5 text-amber-500" />}
              {socketConnected ? "Live Gateway Active" : "Connecting..."}
            </div>

            <button
              onClick={() => loadReviews()}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-100 text-slate-500 transition-colors"
              title="Refresh reviews"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <div className="relative w-full md:w-60">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviewer, store..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#3547D4]" />
                    Fetching real-time reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
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
                      <div className="text-[10px] text-slate-400 font-mono">ID: {r.id.slice(-8)}</div>
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
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Delete Review"
                          disabled={actionLoading}
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
              <h3 className="text-sm font-bold text-[#111827]">Review Moderation ({selectedReview.id.slice(-8)})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-[#111827]">
                  <span>Reviewer: {selectedReview.reviewerName}</span>
                  <span className="text-[#3547D4]">★ {selectedReview.rating} Stars</span>
                </div>
                <div className="text-[11px] text-slate-500">Target: {selectedReview.targetName} ({selectedReview.targetType})</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-[#111827] mb-1">Full Comment Text:</p>
                <p className="text-slate-700 italic">"{selectedReview.comment}"</p>
              </div>

              {selectedReview.tags && selectedReview.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedReview.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-[#3547D4] border border-blue-200 rounded-full text-[10px] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#111827]">Moderation Actions:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedReview.id, "published")}
                  disabled={actionLoading}
                  className="py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition"
                >
                  ✓ Publish
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReview.id, "hidden")}
                  disabled={actionLoading}
                  className="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600 transition"
                >
                  👁 Hide Review
                </button>
                <button
                  onClick={() => handleDeleteReview(selectedReview.id)}
                  disabled={actionLoading}
                  className="py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
