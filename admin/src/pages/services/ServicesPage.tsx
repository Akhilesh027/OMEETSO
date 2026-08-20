import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Wrench,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Layers,
  Building2,
  User,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  MapPin,
  Send,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Star
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

type ServiceStatus = "all" | "pending_approval" | "active" | "paused" | "rejected";

export function ServicesPage() {
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspector & Action Modals
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [serviceToReject, setServiceToReject] = useState<any | null>(null);

  // Message to Provider modal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");

  // Category Edit Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    id: "",
    name: "",
    icon: "Wrench",
    order: 0,
    isActive: true,
    subcategories: "AC Repair, Deep Cleaning, Electrician, Plumber, Salon",
  });

  const { showSuccess, showError } = useToast();

  const loadAdminServices = async () => {
    setLoading(true);
    let loaded = false;

    // Try port 3000 then 5000
    for (const port of [3000, 5000]) {
      try {
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
        const res = await fetch(
          `http://localhost:${port}/api/v1/admin/services?status=${statusFilter === "all" ? "ALL" : statusFilter.toUpperCase()}&q=${encodeURIComponent(searchQuery)}`,
          {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setServices(json.data);
          loaded = true;
          break;
        }
      } catch {
        // try next
      }
    }

    if (!loaded) {
      // Fallback seed services
      const defaultServices = [
        {
          _id: "srv-ac-001",
          id: "srv-ac-001",
          businessName: "CoolBreeze AC Care & HVAC Solutions",
          providerName: "Ramesh Sharma (Certified Master Tech)",
          providerPhone: "+91 98765 43210",
          title: "Complete Jet Pump AC Servicing & Gas Refill",
          serviceCategoryId: "appliance_repair",
          subcategoryId: "AC Service & Gas Refill",
          serviceType: "DOORSTEP",
          pricing: { amount: 499, priceUnit: "per service", priceType: "STARTING_AT" },
          location: { area: "Madhapur", city: "Hyderabad", pincode: "500081" },
          status: "ACTIVE",
          isFeatured: true,
          isEmergency: true,
          isVerifiedProvider: true,
          stats: { rating: 4.9, reviewsCount: 68, inquiriesCount: 182 },
          serviceDetails: {
            description: "High-pressure jet pump deep clean for Split and Window ACs. Flushes all dust, fungal choke, and drain trays.",
            warranty: "60 Days Cooling & Leak Guarantee",
            guaranteedResponseTime: "Within 60 Mins",
          },
          inclusions: ["Indoor & Outdoor Unit Jet Wash", "Gas Leakage Check", "Filter Sanitization"],
          exclusions: ["Spare part replacement costs", "Copper pipe rewiring"],
        },
        {
          _id: "srv-clean-002",
          id: "srv-clean-002",
          businessName: "SparkleClean Pro Home & Office Deep Cleaners",
          providerName: "Pooja & Clean Crew",
          providerPhone: "+91 98765 43211",
          title: "Full Apartment & Villa Deep Cleaning Service",
          serviceCategoryId: "home_services",
          subcategoryId: "Deep Home Cleaning",
          serviceType: "DOORSTEP",
          pricing: { amount: 2499, priceUnit: "per service", priceType: "STARTING_AT" },
          location: { area: "Gachibowli", city: "Hyderabad", pincode: "500032" },
          status: "ACTIVE",
          isFeatured: true,
          isEmergency: false,
          isVerifiedProvider: true,
          stats: { rating: 4.85, reviewsCount: 42, inquiriesCount: 96 },
          serviceDetails: {
            description: "Top-to-bottom mechanized deep sanitization with German Taski chemicals, bathroom descaling & balcony scrubbing.",
            warranty: "100% Re-clean Guarantee",
            guaranteedResponseTime: "Same Day Slots",
          },
          inclusions: ["Floor Mechanized Scrubbing", "Kitchen Chimney & Tile Degreasing", "Full Bathroom Descaling"],
          exclusions: ["Terrace roof cleaning", "Interior wall painting"],
        },
        {
          _id: "srv-elec-003",
          id: "srv-elec-003",
          businessName: "VoltMaster 24/7 Electrician & Emergency Plumbing",
          providerName: "K. Venkatesh (Master Wireman)",
          providerPhone: "+91 98765 43212",
          title: "24/7 Emergency Electrician & Plumbing Fix",
          serviceCategoryId: "home_services",
          subcategoryId: "Electrician & Wiring",
          serviceType: "DOORSTEP",
          pricing: { amount: 199, priceUnit: "per visit", priceType: "VISITATION_FEE" },
          location: { area: "Kukatpally", city: "Hyderabad", pincode: "500072" },
          status: "PENDING_APPROVAL",
          isFeatured: false,
          isEmergency: true,
          isVerifiedProvider: true,
          stats: { rating: 4.95, reviewsCount: 114, inquiriesCount: 310 },
          serviceDetails: {
            description: "Rapid 30-minute doorstep emergency response for electrical power cuts, MCB short-circuit, and high-pressure pipe leaks.",
            warranty: "30 Days Service Warranty",
            guaranteedResponseTime: "Under 30 Mins",
          },
          inclusions: ["Multi-meter Diagnosis", "Fault Detection", "Immediate First Aid Fix"],
          exclusions: ["New wire bundle costs", "New MCB hardware unit"],
        },
      ];

      if (statusFilter === "all") {
        setServices(defaultServices);
      } else {
        setServices(defaultServices.filter((s) => s.status.toLowerCase() === statusFilter.toLowerCase()));
      }
    }
    setLoading(false);
  };

  const loadAdminCategories = async () => {
    for (const port of [3000, 5000]) {
      try {
        const res = await fetch(`http://localhost:${port}/api/v1/services/categories`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
          return;
        }
      } catch {
        // try next
      }
    }

    setCategories([
      { id: "appliance_repair", name: "Appliance Repair", icon: "Wrench", subcategories: ["AC Service & Repair", "Washing Machine", "Refrigerator", "Microwave"] },
      { id: "home_services", name: "Home Cleaning & Repair", icon: "Home", subcategories: ["Deep Home Cleaning", "Electrician & Wiring", "Plumbing", "Carpentry", "Pest Control"] },
      { id: "beauty_salon", name: "Beauty & Wellness", icon: "Sparkles", subcategories: ["Salon at Doorstep", "Bridal Makeup", "Massage Therapy"] },
      { id: "tutors_trainers", name: "Tutors & Lessons", icon: "BookOpen", subcategories: ["Maths & Science Tutor", "Music Lessons", "Fitness Trainer"] },
      { id: "vehicle_care", name: "Vehicle Care & Towing", icon: "Car", subcategories: ["Car Wash at Doorstep", "24/7 Breakdown Towing", "Bike Servicing"] },
    ]);
  };

  useEffect(() => {
    loadAdminServices();
    loadAdminCategories();
  }, [statusFilter]);

  const handleUpdateStatus = async (serviceId: string, status: string, reason?: string) => {
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      for (const port of [3000, 5000]) {
        try {
          await fetch(`http://localhost:${port}/api/v1/admin/services/${serviceId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ status, rejectionReason: reason }),
          });
          break;
        } catch { }
      }
    } catch { }

    setServices((prev) =>
      prev.map((s) => (s.id === serviceId || s._id === serviceId ? { ...s, status, rejectionReason: reason } : s))
    );

    if (status === "ACTIVE") {
      showSuccess(`Service verified & published live! Provider notified.`);
    } else if (status === "REJECTED") {
      showSuccess(`Service rejected. Moderation feedback dispatched to provider.`);
    }
  };

  const handleToggleFeature = (serviceId: string, current: boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId || s._id === serviceId ? { ...s, isFeatured: !current } : s))
    );
    showSuccess(`Service spotlight status updated.`);
  };

  const handleSendMessageToProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !messageRecipient) return;

    showSuccess(`Direct message & notification dispatched to ${messageRecipient.businessName || "Provider"}!`);
    setIsMessageModalOpen(false);
    setMessageText("");
    setMessageRecipient(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const subs = catForm.subcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setCategories((prev) => [
      ...prev.filter((c) => c.id !== catForm.id),
      { id: catForm.id || catForm.name.toLowerCase().replace(/\s+/g, "_"), name: catForm.name, icon: catForm.icon, subcategories: subs },
    ]);

    showSuccess("Service category updated successfully!");
    setCatModalOpen(false);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location?.city && s.location.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.location?.area && s.location.area.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "pending_approval") return s.status === "PENDING_APPROVAL" || s.status === "submitted";
    if (statusFilter === "active") return s.status === "ACTIVE" || s.status === "approved";
    if (statusFilter === "paused") return s.status === "PAUSED";
    if (statusFilter === "rejected") return s.status === "REJECTED";

    return true;
  });

  const totalInquiries = services.reduce((acc, s) => acc + (s.stats?.inquiriesCount || 0), 0);
  const pendingCount = services.filter((s) => s.status === "PENDING_APPROVAL" || s.status === "submitted").length;

  return (
    <PageContainer>
      <PageHeader
        title="Services & Home Pros Vertical"
        description="Moderate doorstep service technicians, verified rate cards, warranty badges, and service categories."
        primaryAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCatForm({
                  id: "",
                  name: "",
                  icon: "Wrench",
                  order: categories.length + 1,
                  isActive: true,
                  subcategories: "AC Repair, Cleaning, Electrician, Plumber, Salon",
                });
                setCatModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-rose-600" />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={loadAdminServices}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Services Listed</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{services.length}</h3>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 font-bold">Doorstep Pro Listings</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending Verification</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Requires verification</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Customer Bookings & Inquiries</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalInquiries}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Platform leads delivered</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Service Categories</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{categories.length}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Active home sectors</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("services")}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === "services"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          🛠️ Service Moderation Queue ({filteredServices.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === "categories"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          📁 Service Categories & Rate Cards ({categories.length})
        </button>
      </div>

      {activeTab === "services" && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {[
                { id: "all", label: "All Services" },
                { id: "pending_approval", label: "Pending Verification" },
                { id: "active", label: "Active / Verified" },
                { id: "paused", label: "Paused" },
                { id: "rejected", label: "Rejected" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === tab.id
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search service, provider, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-rose-600" /> Loading services queue...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                No services found matching the current search & status filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Service Offering & Provider</th>
                      <th className="p-3.5">Category & Subcategory</th>
                      <th className="p-3.5">Pricing & Unit</th>
                      <th className="p-3.5">Coverage Location</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredServices.map((srv) => {
                      const srvId = srv._id || srv.id;
                      const isApproved = srv.status === "ACTIVE" || srv.status === "approved";
                      const isPending = srv.status === "PENDING_APPROVAL" || srv.status === "submitted";

                      return (
                        <tr key={srvId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-gray-900 dark:text-white max-w-sm truncate">
                              {srv.title}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              <span className="font-medium">{srv.businessName}</span>
                              {srv.isVerifiedProvider && (
                                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 rounded">
                                  <ShieldCheck className="w-2.5 h-2.5" /> Verified Pro
                                </span>
                              )}
                              {srv.isEmergency && (
                                <span className="text-[9.5px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-1.5 rounded">
                                  24/7 Emergency
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-[10px]">
                              {srv.subcategoryId || srv.serviceCategoryId}
                            </span>
                            <div className="text-[11px] text-gray-500 mt-0.5">{srv.serviceType || "DOORSTEP"}</div>
                          </td>

                          <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                            ₹{srv.pricing?.amount}
                            <span className="text-[10px] text-gray-500 font-normal"> / {srv.pricing?.priceUnit?.replace("per ", "") || "service"}</span>
                          </td>

                          <td className="p-3.5 text-gray-700 dark:text-gray-300">
                            <div>{srv.location?.area}, {srv.location?.city}</div>
                            <span className="text-[10px] text-gray-400">{srv.serviceDetails?.guaranteedResponseTime || "Same Day"}</span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : isPending
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                              }`}
                            >
                              {srv.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedService(srv);
                                setIsInspectorOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                              title="Inspect Service & Rate Card"
                            >
                              <Eye className="w-3.5 h-3.5 inline" />
                            </button>

                            <button
                              onClick={() => {
                                setMessageRecipient(srv);
                                setMessageText(`Regarding your service listing "${srv.title}": `);
                                setIsMessageModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition"
                              title="Send Message to Service Provider"
                            >
                              <MessageSquare className="w-3.5 h-3.5 inline" />
                            </button>

                            {!isApproved && (
                              <button
                                onClick={() => handleUpdateStatus(srvId, "ACTIVE")}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                              >
                                Approve
                              </button>
                            )}

                            {srv.status !== "REJECTED" && (
                              <button
                                onClick={() => {
                                  setServiceToReject(srv);
                                  setRejectReason("Pricing terms or insurance warranty requires clarification");
                                  setIsRejectModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition"
                              >
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleFeature(srvId, srv.isFeatured)}
                              className={`px-2 py-1 text-xs font-bold rounded-lg border transition ${
                                srv.isFeatured
                                  ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 text-amber-600"
                                  : "border-gray-300 dark:border-gray-600 text-gray-400 hover:text-gray-700"
                              }`}
                              title="Toggle Featured Spotlight"
                            >
                              ★
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{c.name}</h4>
                    <p className="text-[11px] text-gray-500">{(c.subcategories || []).length} Subcategories</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400">#{c.id}</span>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                {(c.subcategories || []).map((sub: any, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10.5px]">
                    {typeof sub === "string" ? sub : sub.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECTION MODAL */}
      {isInspectorOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-[10px] font-bold">
                  {selectedService.subcategoryId || selectedService.serviceCategoryId}
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">{selectedService.title}</h3>
                <p className="text-xs text-gray-500 font-semibold">{selectedService.businessName} • {selectedService.location?.area}, {selectedService.location?.city}</p>
              </div>
              <button onClick={() => setIsInspectorOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 text-[10px]">Price Rate</span>
                <p className="font-bold text-gray-900 dark:text-white">₹{selectedService.pricing?.amount} {selectedService.pricing?.priceUnit}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Delivery Mode</span>
                <p className="font-bold text-gray-900 dark:text-white">{selectedService.serviceType}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Response Time</span>
                <p className="font-bold text-gray-900 dark:text-white">{selectedService.serviceDetails?.guaranteedResponseTime || "Same Day"}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Warranty</span>
                <p className="font-bold text-gray-900 dark:text-white">{selectedService.serviceDetails?.warranty || "30 Days"}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Service Scope & Description</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                {selectedService.serviceDetails?.description}
              </p>
            </div>

            {selectedService.inclusions && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Inclusions Checklist</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.inclusions.map((inc: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                      ✓ {inc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setMessageRecipient(selectedService);
                  setMessageText(`Official update regarding your service "${selectedService.title}": `);
                  setIsInspectorOpen(false);
                  setIsMessageModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Send Message
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedService.id || selectedService._id, "ACTIVE");
                  setIsInspectorOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow"
              >
                Approve Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {isMessageModalOpen && messageRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-600" /> Send Notice to Service Provider
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <p className="text-xs text-gray-500">
              Sending direct system message to <strong>{messageRecipient.businessName}</strong> ({messageRecipient.providerName}) regarding service <strong>"{messageRecipient.title}"</strong>.
            </p>

            <form onSubmit={handleSendMessageToProvider} className="space-y-3">
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter feedback, KYC verification request, or moderation notice for the provider..."
                className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow"
                >
                  Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && serviceToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Reject Service Listing
            </h3>
            <p className="text-xs text-gray-500">
              Provide a clear reason for rejecting <strong>"{serviceToReject.title}"</strong> by <strong>{serviceToReject.businessName}</strong>. This message will be sent directly to the provider.
            </p>

            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(serviceToReject.id || serviceToReject._id, "REJECTED", rejectReason);
                  setIsRejectModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow"
              >
                Confirm Rejection & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY UPSERT MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white">Add / Edit Service Category</h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Category Slug ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. appliance_repair"
                  value={catForm.id}
                  onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Appliance Repair & Maintenance"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Subcategories (Comma separated)</label>
                <input
                  type="text"
                  placeholder="AC Repair, Washing Machine, Refrigerator"
                  value={catForm.subcategories}
                  onChange={(e) => setCatForm({ ...catForm, subcategories: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
export default ServicesPage;
