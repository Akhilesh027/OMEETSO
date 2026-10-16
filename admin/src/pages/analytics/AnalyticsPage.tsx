import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  MapPin,
  Users,
  Package,
  Store,
  Search,
  RefreshCw,
  Download,
  Phone,
  Mail,
  Building2,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import {
  getPlatformAnalyticsApi,
  PlatformAnalyticsData,
  RegionalListing,
  RegionalUser,
  RegionalSeller
} from "@/api/adminDashboard.api";

type ActiveTab = "listings" | "users" | "sellers";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("listings");

  const { showSuccess, showError } = useToast();

  const fetchAnalytics = async (city?: string, area?: string) => {
    setIsLoading(true);
    try {
      const cityParam = city !== undefined ? (city === "All" ? "" : city) : (selectedCity === "All" ? "" : selectedCity);
      const areaParam = area !== undefined ? (area === "All" ? "" : area) : (selectedArea === "All" ? "" : selectedArea);

      const res = await getPlatformAnalyticsApi({
        city: cityParam,
        area: areaParam
      });

      if (res.success && res.data) {
        setAnalytics(res.data);
      } else if (res.error) {
        showError("Failed to fetch area data", res.error);
      }
    } catch {
      showError("Error", "Could not fetch regional directory data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedCity, selectedArea);
  }, [selectedCity, selectedArea]);

  // Extract unique cities from returned cities array
  const availableCities = useMemo(() => {
    if (!analytics?.cities) return ["All"];
    const citiesSet = new Set<string>();
    analytics.cities.forEach((c) => {
      if (c.city && c.city.trim()) {
        citiesSet.add(c.city.trim());
      }
    });
    return ["All", ...Array.from(citiesSet).sort()];
  }, [analytics?.cities]);

  // Extract unique areas based on current city filter
  const availableAreas = useMemo(() => {
    if (!analytics?.cities) return ["All"];
    const areasSet = new Set<string>();
    analytics.cities.forEach((c) => {
      if (selectedCity === "All" || c.city.toLowerCase() === selectedCity.toLowerCase()) {
        if (c.area && c.area.trim() && c.area.toLowerCase() !== "all areas") {
          areasSet.add(c.area.trim());
        }
      }
    });
    return ["All", ...Array.from(areasSet).sort()];
  }, [analytics?.cities, selectedCity]);

  // Filter listings by search query
  const filteredListings = useMemo(() => {
    if (!analytics?.listings) return [];
    if (!searchQuery.trim()) return analytics.listings;
    const q = searchQuery.toLowerCase();
    return analytics.listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.categoryId.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
    );
  }, [analytics?.listings, searchQuery]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!analytics?.users) return [];
    if (!searchQuery.trim()) return analytics.users;
    const q = searchQuery.toLowerCase();
    return analytics.users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.area.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
    );
  }, [analytics?.users, searchQuery]);

  // Filter sellers by search query
  const filteredSellers = useMemo(() => {
    if (!analytics?.sellers) return [];
    if (!searchQuery.trim()) return analytics.sellers;
    const q = searchQuery.toLowerCase();
    return analytics.sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.primaryCategory.toLowerCase().includes(q) ||
        s.businessMobile.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }, [analytics?.sellers, searchQuery]);

  // Handle selecting an area directly from the summary table
  const handleSelectAreaRow = (city: string, area: string) => {
    setSelectedCity(city);
    setSelectedArea(area);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExportData = () => {
    if (!analytics) {
      showError("Export Failed", "No area directory data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeTab === "listings") {
      const headers = ["Title", "Category", "Price", "Seller Name", "Seller Phone", "City", "Area", "Status", "Created At"];
      const rows = filteredListings.map((l) => [
        `"${(l.title || "").replace(/"/g, '""')}"`,
        `"${l.categoryId || ""}"`,
        l.priceInPaise ? `₹${(l.priceInPaise / 100).toFixed(0)}` : "Free",
        `"${(l.sellerName || "").replace(/"/g, '""')}"`,
        `"${l.sellerPhone || ""}"`,
        `"${l.city || ""}"`,
        `"${l.area || ""}"`,
        `"${l.status || ""}"`,
        `"${new Date(l.createdAt).toLocaleDateString()}"`
      ]);
      csvContent += [headers, ...rows].map((e) => e.join(",")).join("\n");
    } else if (activeTab === "users") {
      const headers = ["User Name", "Phone", "Email", "Account Type", "City", "Area", "Joined Date"];
      const rows = filteredUsers.map((u) => [
        `"${(u.name || "").replace(/"/g, '""')}"`,
        `"${u.phone || ""}"`,
        `"${u.email || ""}"`,
        `"${u.accountType || ""}"`,
        `"${u.city || ""}"`,
        `"${u.area || ""}"`,
        `"${new Date(u.createdAt).toLocaleDateString()}"`
      ]);
      csvContent += [headers, ...rows].map((e) => e.join(",")).join("\n");
    } else {
      const headers = ["Seller/Store Name", "Owner Name", "Category", "Contact Mobile", "Type", "City", "Area", "Status"];
      const rows = filteredSellers.map((s) => [
        `"${(s.name || "").replace(/"/g, '""')}"`,
        `"${(s.ownerName || "").replace(/"/g, '""')}"`,
        `"${s.primaryCategory || ""}"`,
        `"${s.businessMobile || ""}"`,
        s.isStore ? "Store / Merchant" : "Individual Seller",
        `"${s.city || ""}"`,
        `"${s.area || ""}"`,
        `"${s.status || ""}"`
      ]);
      csvContent += [headers, ...rows].map((e) => e.join(",")).join("\n");
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `omeetso_area_${activeTab}_${selectedCity}_${selectedArea}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess("Export Completed", `Exported ${activeTab} for ${selectedCity} - ${selectedArea}.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Regional Area Directory"
        description="Explore live listings, registered community users, and local merchants/sellers by city and neighborhood area."
        badge="Area Intelligence"
        badgeColor="indigo"
        primaryAction={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchAnalytics(selectedCity, selectedArea)}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#F5F7FC] text-[#111827] hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </button>
            <button
              onClick={handleExportData}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export {activeTab === "listings" ? "Listings" : activeTab === "users" ? "Users" : "Sellers"}</span>
            </button>
          </div>
        }
      />

      {/* Area & City Location Selector Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#111827]">
            <MapPin className="w-4 h-4 text-[#3547D4]" />
            <span>Select Region & Neighborhood Area</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* City Dropdown */}
            <div className="flex items-center space-x-1.5 bg-[#F5F7FC] px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-[#64748B] uppercase">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedArea("All"); // Reset area when city changes
                }}
                className="bg-transparent text-xs font-bold text-[#111827] focus:outline-none cursor-pointer"
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city === "All" ? "All Cities" : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Area Dropdown */}
            <div className="flex items-center space-x-1.5 bg-[#F5F7FC] px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-[#64748B] uppercase">Area / Ward:</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#111827] focus:outline-none cursor-pointer"
              >
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area === "All" ? "All Areas" : area}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filter if customized */}
            {(selectedCity !== "All" || selectedArea !== "All") && (
              <button
                onClick={() => {
                  setSelectedCity("All");
                  setSelectedArea("All");
                }}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Selected Area Context Tag */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs text-[#64748B]">
          <span className="font-medium">Currently viewing area:</span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#3547D4] border border-indigo-100">
            <span>{selectedCity === "All" ? "All Cities" : selectedCity}</span>
            <span>/</span>
            <span>{selectedArea === "All" ? "All Neighborhoods" : selectedArea}</span>
          </span>
        </div>
      </div>

      {/* Directory Category Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveTab("listings");
              setSearchQuery("");
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "listings"
                ? "bg-[#3547D4] text-white shadow-sm"
                : "bg-white text-[#64748B] hover:text-[#111827] hover:bg-slate-100 border border-[#E2E8F0]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Listings from this Area</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-[#3547D4] text-white shadow-sm"
                : "bg-white text-[#64748B] hover:text-[#111827] hover:bg-slate-100 border border-[#E2E8F0]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users of this Area</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("sellers");
              setSearchQuery("");
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sellers"
                ? "bg-[#3547D4] text-white shadow-sm"
                : "bg-white text-[#64748B] hover:text-[#111827] hover:bg-slate-100 border border-[#E2E8F0]"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Sellers & Stores of this Area</span>
          </button>
        </div>

        {/* In-tab Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "listings"
                ? "Search listings in area..."
                : activeTab === "users"
                ? "Search users in area..."
                : "Search stores & sellers..."
            }
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#111827] placeholder:text-slate-400 focus:outline-none focus:border-[#3547D4]"
          />
        </div>
      </div>

      {/* TAB 1: LISTINGS FROM THIS AREA */}
      {activeTab === "listings" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide flex items-center space-x-2">
              <Package className="w-4 h-4 text-[#3547D4]" />
              <span>Listings Catalog ({filteredListings.length} items found)</span>
            </h3>
            <span className="text-[11px] text-[#64748B]">Showing active ads in selected location</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3.5">Listing Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Area / Ward</th>
                  <th className="p-3.5">Seller</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#3547D4]" />
                        <span>Loading listings for this area...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Package className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600">No listings found for this area.</span>
                        <span className="text-xs text-slate-400">Try selecting another area or clearing the filter.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3 max-w-xs">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <div className="font-bold text-[#111827] truncate hover:text-[#3547D4]">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-[#64748B]">ID: {item.id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-[#475569]">
                          {item.categoryId || "General"}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#111827]">
                        {item.priceInPaise ? `₹${(item.priceInPaise / 100).toLocaleString("en-IN")}` : "Free"}
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-[#111827]">{item.area}</div>
                        <div className="text-[10px] text-[#64748B]">{item.city}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-[#111827]">{item.sellerName}</div>
                      </td>
                      <td className="p-3.5 text-[#64748B]">
                        {item.sellerPhone ? (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{item.sellerPhone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "PENDING_APPROVAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px] text-[#64748B]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS OF THIS AREA */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>Registered Community Users ({filteredUsers.length} members)</span>
            </h3>
            <span className="text-[11px] text-[#64748B]">Directory of registered users from this area</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3.5">User Profile</th>
                  <th className="p-3.5">Mobile Contact</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Area / Neighborhood</th>
                  <th className="p-3.5">City</th>
                  <th className="p-3.5">Account Type</th>
                  <th className="p-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#2563EB]" />
                        <span>Loading community users for this area...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600">No registered users in this area yet.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-[#111827]">{u.name}</div>
                            <div className="text-[10px] text-slate-400">ID: {u.id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1.5 text-[#111827] font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-[#64748B]">
                        {u.email ? (
                          <div className="flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No email linked</span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-[#111827]">{u.area}</td>
                      <td className="p-3.5 text-[#64748B]">{u.city}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.accountType === "business"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.accountType === "business" ? "Business / Merchant" : "Individual Member"}
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px] text-[#64748B]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SELLERS & STORES OF THIS AREA */}
      {activeTab === "sellers" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide flex items-center space-x-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Sellers & Merchant Stores ({filteredSellers.length} active sellers)</span>
            </h3>
            <span className="text-[11px] text-[#64748B]">Verified stores & active sellers based in this area</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3.5">Store / Seller Name</th>
                  <th className="p-3.5">Owner / Contact</th>
                  <th className="p-3.5">Primary Category</th>
                  <th className="p-3.5">Business Phone</th>
                  <th className="p-3.5">Area / Ward</th>
                  <th className="p-3.5">City</th>
                  <th className="p-3.5">Merchant Type</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                        <span>Loading sellers for this area...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Store className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600">No sellers or stores found in this area.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              s.isStore ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {s.isStore ? <Building2 className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-[#111827]">{s.name}</div>
                            <div className="text-[10px] text-slate-400">ID: {s.id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-[#111827]">{s.ownerName}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {s.primaryCategory}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#111827]">
                        {s.businessMobile ? (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{s.businessMobile}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-[#111827]">{s.area}</td>
                      <td className="p-3.5 text-[#64748B]">{s.city}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.isStore
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {s.isStore ? "Verified Store" : "Marketplace Seller"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGIONAL AREA BREAKDOWN EXPLORER */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#3547D4]" />
            <span>Marketplace Areas Directory (Click Any Area to Inspect)</span>
          </h3>
          <span className="text-xs text-[#64748B]">
            {analytics?.cities?.length || 0} active {analytics?.cities?.length === 1 ? "neighborhood" : "neighborhoods"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">City</th>
                <th className="p-3">Neighborhood / Area</th>
                <th className="p-3">Active Listings</th>
                <th className="p-3">Registered Users</th>
                <th className="p-3">Sellers / Stores</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Loading regional areas...
                  </td>
                </tr>
              ) : !analytics?.cities || analytics.cities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No neighborhood areas recorded yet.
                  </td>
                </tr>
              ) : (
                analytics.cities.map((row, idx) => {
                  const isSelected =
                    selectedCity.toLowerCase() === row.city.toLowerCase() &&
                    selectedArea.toLowerCase() === row.area.toLowerCase();

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? "bg-indigo-50/60 font-semibold" : ""
                      }`}
                      onClick={() => handleSelectAreaRow(row.city, row.area)}
                    >
                      <td className="p-3 font-bold text-[#111827]">{row.city}</td>
                      <td className="p-3 font-semibold text-[#3547D4]">{row.area}</td>
                      <td className="p-3 text-[#111827]">{row.activeListings}</td>
                      <td className="p-3 text-[#111827]">{row.registeredUsers}</td>
                      <td className="p-3 text-[#111827]">{row.verifiedStores}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAreaRow(row.city, row.area);
                          }}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            isSelected
                              ? "bg-[#3547D4] text-white"
                              : "bg-slate-100 text-[#111827] hover:bg-[#3547D4] hover:text-white"
                          }`}
                        >
                          <span>{isSelected ? "Inspecting" : "View Area"}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
