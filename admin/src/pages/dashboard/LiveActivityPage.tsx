import React, { useEffect, useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  fetchLiveTelemetryStatsApi,
  fetchLiveTelemetryFeedApi,
  fetchVisitorJourneyApi,
  downloadTelemetryReportApi,
  ActivityFeedItem,
  LiveTelemetryStats
} from "@/api/telemetry.api";
import { BACKEND_URL } from "@/config/api";
import { AdminAuthService } from "@/services/adminAuthService";
import { io, Socket } from "socket.io-client";
import {
  Activity,
  Phone,
  MessageCircle,
  Eye,
  Search,
  MapPin,
  Smartphone,
  Monitor,
  Flame,
  User,
  Users,
  Clock,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Wifi,
  WifiOff,
  X,
  Download,
  Calendar,
  Layers,
  Globe2,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from "lucide-react";

export default function LiveActivityPage() {
  const [stats, setStats] = useState<LiveTelemetryStats | null>(null);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Granular Filters
  const [timeRange, setTimeRange] = useState<"today" | "yesterday" | "7d" | "30d" | "all">("today");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [visitorType, setVisitorType] = useState<"all" | "registered" | "guest" | "leads">("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Visitor Journey Drawer
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [visitorJourney, setVisitorJourney] = useState<any[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);

  // Report Summary Modal
  const [showReportSummaryModal, setShowReportSummaryModal] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // Load feed and stats with accurate pagination & parameters
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, feedRes] = await Promise.all([
        fetchLiveTelemetryStatsApi(),
        fetchLiveTelemetryFeedApi({
          page: currentPage,
          limit: pageSize,
          timeRange,
          type: filterType,
          city: filterCity,
          visitorType,
          platform: filterPlatform,
          search: searchQuery
        })
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (feedRes.success && feedRes.data) {
        setActivities(feedRes.data.activities);
        setTotalCount(feedRes.data.pagination.total);
        setTotalPages(feedRes.data.pagination.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, timeRange, filterType, filterCity, visitorType, filterPlatform, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  // Connect to Socket.IO real-time stream
  useEffect(() => {
    const token = AdminAuthService.getAccessToken();
    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("admin:join_monitoring");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("live_activity:new", (newActivity: ActivityFeedItem) => {
      if (isLivePaused) return;

      // Check if new incoming activity passes the current filters
      const matchesCity = filterCity === "all" || newActivity.location?.city?.toLowerCase() === filterCity.toLowerCase();
      const matchesType = filterType === "all" || newActivity.type === filterType;
      const matchesVisitor =
        visitorType === "all" ||
        (visitorType === "registered" && Boolean(newActivity.userContact?.phone)) ||
        (visitorType === "guest" && !newActivity.userContact?.phone) ||
        (visitorType === "leads" && newActivity.isLead);

      if (matchesCity && matchesType && matchesVisitor && currentPage === 1) {
        setActivities((prev) => [newActivity, ...prev.filter((a) => a.id !== newActivity.id)].slice(0, pageSize));
        setTotalCount((c) => c + 1);
      }

      // Update counters
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalPageViewsToday: prev.totalPageViewsToday + 1,
          todayLeadsCount: newActivity.isLead ? prev.todayLeadsCount + 1 : prev.todayLeadsCount
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isLivePaused, filterCity, filterType, visitorType, currentPage, pageSize]);

  // Open visitor journey inspection
  const handleInspectVisitor = async (visitorId: string) => {
    setSelectedVisitorId(visitorId);
    setJourneyLoading(true);
    try {
      const res = await fetchVisitorJourneyApi(visitorId);
      if (res.success && res.data) {
        setVisitorJourney(res.data.events);
      }
    } finally {
      setJourneyLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setTimeRange("today");
    setFilterType("all");
    setFilterCity("all");
    setVisitorType("all");
    setFilterPlatform("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Download clean CSV report
  const handleDownloadFullReport = async () => {
    try {
      setIsExporting(true);
      await downloadTelemetryReportApi({
        timeRange,
        type: filterType,
        city: filterCity,
        visitorType,
        platform: filterPlatform,
        search: searchQuery
      });
    } finally {
      setIsExporting(false);
      setShowReportSummaryModal(false);
    }
  };

  const getActivityBadge = (type: string, isLead: boolean) => {
    if (isLead) {
      return {
        icon: <Flame className="w-4 h-4 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        label: "HOT LEAD"
      };
    }
    switch (type) {
      case "CONTACT_WHATSAPP_CLICKED":
        return { icon: <MessageCircle className="w-4 h-4 text-green-600" />, bg: "bg-green-50 border-green-200 text-green-700", label: "WhatsApp Click" };
      case "CONTACT_CALL_CLICKED":
        return { icon: <Phone className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50 border-blue-200 text-blue-700", label: "Call Click" };
      case "LISTING_VIEW":
        return { icon: <Eye className="w-4 h-4 text-purple-600" />, bg: "bg-purple-50 border-purple-200 text-purple-700", label: "Product View" };
      case "STORE_VISIT":
        return { icon: <Activity className="w-4 h-4 text-indigo-600" />, bg: "bg-indigo-50 border-indigo-200 text-indigo-700", label: "Store Visit" };
      case "SEARCH_PERFORMED":
        return { icon: <Search className="w-4 h-4 text-amber-600" />, bg: "bg-amber-50 border-amber-200 text-amber-700", label: "Search" };
      case "VISIT_OPENED":
        return { icon: <Smartphone className="w-4 h-4 text-sky-600" />, bg: "bg-sky-50 border-sky-200 text-sky-700", label: "Site / App Open" };
      default:
        return { icon: <Activity className="w-4 h-4 text-slate-600" />, bg: "bg-slate-50 border-slate-200 text-slate-700", label: "Page View" };
    }
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <PageContainer>
      <PageHeader
        title="Live Visitor Telemetry & Lead Intelligence"
        description="Comprehensive real-time tracking of actual individuals visiting Omeetso. Accurate pagination, multi-city filtering, and clear downloadable audit reports."
        badge={socketConnected ? "WebSocket Live" : "Connecting..."}
        badgeColor={socketConnected ? "success" : "warning"}
        secondaryActions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLivePaused(!isLivePaused)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
                isLivePaused
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isLivePaused ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />}
              {isLivePaused ? "Paused" : "Live Streaming"}
            </button>
            <button
              onClick={() => setShowReportSummaryModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#16A36A] hover:bg-[#15803D] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Download Report
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {/* ACCURATE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 1. Live Online Now */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Online Right Now</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-2xl font-black text-[#111827]">{stats?.activeOnlineNow ?? 0}</h3>
              <span className="text-xs text-emerald-600 font-semibold">(last 5m)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Active browsing sessions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Wifi className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Unique People Visited Today */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unique People Visited Today</span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-black text-[#3547D4]">{stats?.uniqueVisitorsToday ?? 0}</h3>
              <span className="text-xs text-slate-500 font-semibold">individuals</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
              <span className="text-blue-600 font-bold">{stats?.registeredUsersToday ?? 0} signed-in</span>
              <span>•</span>
              <span>{stats?.guestVisitorsToday ?? 0} guests</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3547D4]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Buyer Leads Generated */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Buyer Leads Generated Today</span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-black text-emerald-700">{stats?.todayLeadsCount ?? 0}</h3>
              <span className="text-xs text-emerald-600 font-bold">Calls & WhatsApp</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">High-intent buyer actions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Total Page Impressions / Hits */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Impressions Today</span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-black text-[#111827]">{stats?.totalPageViewsToday ?? 0}</h3>
              <span className="text-xs text-slate-400 font-medium">hits</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All-time: <span className="font-semibold text-slate-700">{stats?.allTimeUniqueVisitors ?? 0}</span> unique people
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <Globe2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ADVANCED FILTERING PANEL */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm mb-6 space-y-3">
        {/* Row 1: Search & Time Range & Visitor Category */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search visitor name, phone (+91...), IP, city, or product..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3547D4] bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(
                [
                  { id: "today", label: "Today" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "7d", label: "7 Days" },
                  { id: "30d", label: "30 Days" },
                  { id: "all", label: "All Time" }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(setTimeRange, tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === tab.id
                      ? "bg-white text-[#3547D4] shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Clear Filters Button */}
            {(timeRange !== "today" || filterType !== "all" || filterCity !== "all" || visitorType !== "all" || filterPlatform !== "all" || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Granular Dropdowns & Page Size */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Visitor Type Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">User:</span>
              <select
                value={visitorType}
                onChange={(e) => handleFilterChange(setVisitorType, e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Visitors</option>
                <option value="registered">Registered Users Only (Has Phone)</option>
                <option value="guest">Guest / Anonymous Visitors</option>
                <option value="leads">Hot Leads Only (Calls / WhatsApp)</option>
              </select>
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">Action:</span>
              <select
                value={filterType}
                onChange={(e) => handleFilterChange(setFilterType, e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Actions</option>
                <option value="VISIT_OPENED">Site / App Opened</option>
                <option value="LISTING_VIEW">Product Views</option>
                <option value="STORE_VISIT">Store Visits</option>
                <option value="SEARCH_PERFORMED">Searches</option>
                <option value="CONTACT_WHATSAPP_CLICKED">WhatsApp Clicks</option>
                <option value="CONTACT_CALL_CLICKED">Call Clicks</option>
                <option value="DEAL_OFFER_MADE">Price Offers</option>
              </select>
            </div>

            {/* Dynamic City Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">City:</span>
              <select
                value={filterCity}
                onChange={(e) => handleFilterChange(setFilterCity, e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Cities ({stats?.availableCities?.length || 0})</option>
                {(stats?.availableCities || ["Hyderabad", "Bangalore", "Mumbai"]).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">Device:</span>
              <select
                value={filterPlatform}
                onChange={(e) => handleFilterChange(setFilterPlatform, e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Devices</option>
                <option value="android_app">Android Native App</option>
                <option value="ios_app">iOS Native App</option>
                <option value="mobile_web">Mobile Browser</option>
                <option value="desktop_web">Desktop Browser</option>
              </select>
            </div>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={25}>25 items</option>
              <option value={50}>50 items</option>
              <option value={100}>100 items</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP PAGINATION STATUS BAR */}
      <div className="flex items-center justify-between px-2 mb-3 text-xs text-slate-500 font-medium">
        <div>
          {totalCount > 0 ? (
            <span>
              Showing <strong className="text-slate-800">{startRecord}</strong>–
              <strong className="text-slate-800">{endRecord}</strong> of{" "}
              <strong className="text-slate-800">{totalCount}</strong> matching events
            </span>
          ) : (
            <span>No events matching current filters</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
        </div>
      </div>

      {/* REAL-TIME ACTIVITY STREAM */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#E2E8F0]">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#3547D4]" />
            Loading visitor activity stream...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No visitors found matching these filters</p>
            <p className="text-xs text-slate-400">Try changing your time range, city, or clearing the search query.</p>
          </div>
        ) : (
          activities.map((item) => {
            const badge = getActivityBadge(item.type, item.isLead);
            const isRegisteredUser = Boolean(item.userContact?.phone || item.userContact?.name);

            return (
              <div
                key={item.id}
                className={`p-4 md:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-[#F8FAFC] ${
                  item.isLead ? "bg-emerald-50/30 border-l-4 border-l-emerald-500" : ""
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Activity Icon */}
                  <div className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${badge.bg}`}>
                    {badge.icon}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Title & Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#3547D4] transition-colors">
                        {item.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {item.isLead && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                          HOT LEAD
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>

                    {/* Metadata & Contact Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] pt-1">
                      {/* Location Pill */}
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {item.location?.city || "Hyderabad"} {item.location?.area ? `(${item.location.area})` : ""}
                      </span>

                      {/* Device Pill */}
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.device?.platform?.includes("app") ? (
                          <Smartphone className="w-3 h-3 text-[#3547D4]" />
                        ) : (
                          <Monitor className="w-3 h-3 text-slate-500" />
                        )}
                        {item.device?.platform?.replace("_", " ").toUpperCase() || "WEB"}
                      </span>

                      {/* Contact Info (If signed in) */}
                      {isRegisteredUser ? (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 px-2 py-0.5 rounded-md font-bold">
                          <User className="w-3 h-3 text-blue-600" />
                          <span>{item.userContact?.name || "User"}</span>
                          {item.userContact?.phone && (
                            <span className="text-blue-700">({item.userContact.phone})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">
                          Guest Visitor ({item.visitorId.slice(-6)})
                        </span>
                      )}

                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.userContact?.phone && (
                    <a
                      href={`tel:${item.userContact.phone}`}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      title="Call Visitor directly"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  )}
                  {item.userContact?.phone && (
                    <a
                      href={`https://wa.me/${item.userContact.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1"
                      title="Message on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}

                  <button
                    onClick={() => handleInspectVisitor(item.visitorId)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-[#3547D4] hover:border-[#3547D4] transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    Journey <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BOTTOM PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2 py-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Showing Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
            <strong className="text-slate-800">{totalPages}</strong> ({totalCount} total events)
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {/* Dynamic Page Number Buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#3547D4] text-white shadow-xs"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* REPORT SUMMARY & DOWNLOAD MODAL */}
      {showReportSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Download Telemetry & Lead Report</h3>
                  <span className="text-xs text-slate-500">Crystal-Clear Formatted Excel / CSV Report</span>
                </div>
              </div>
              <button
                onClick={() => setShowReportSummaryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs">Current Report Scope:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Time Window:</span>{" "}
                    <strong className="text-slate-700 uppercase">{timeRange}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">City Scope:</span>{" "}
                    <strong className="text-slate-700">{filterCity === "all" ? "All Indian Cities" : filterCity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Users:</span>{" "}
                    <strong className="text-slate-700 uppercase">{visitorType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Matching:</span>{" "}
                    <strong className="text-emerald-700 font-bold">{totalCount} Records</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Includes full visitor details: <strong>Names, Phone Numbers, Emails</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Includes geographic resolution: <strong>City, Area, State, IP Address</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Includes buyer intent: <strong>WhatsApp clicks, Calls dialed, Products viewed</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Encoded with <strong>UTF-8 BOM</strong> for native formatting in Microsoft Excel</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowReportSummaryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadFullReport}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isExporting ? "Generating Report..." : "Download Excel / CSV Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISITOR JOURNEY INSPECTION DRAWER */}
      {selectedVisitorId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Visitor Journey Timeline</h3>
                <span className="text-xs text-slate-500 font-mono">Visitor ID: {selectedVisitorId}</span>
              </div>
              <button
                onClick={() => setSelectedVisitorId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Journey Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {journeyLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#3547D4]" />
                  Loading journey timeline...
                </div>
              ) : visitorJourney.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No previous events found for this session.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {visitorJourney.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-[#3547D4] border-2 border-white" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{evt.description}</p>
                        <div className="text-[11px] text-slate-400">
                          <span>Path: {evt.pagePath}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
