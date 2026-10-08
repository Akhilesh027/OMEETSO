import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight, ArrowLeft, CornerDownLeft, Shield } from "lucide-react";
import { MOCK_SEARCH_INDEX, SearchResultItem } from "@/data/globalSearch";
import { MockDataService } from "@/services/mockDataService";
import { API_BASE } from "@/config/api";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [liveListings, setLiveListings] = useState<any[]>([]);
  const [liveStores, setLiveStores] = useState<any[]>([]);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);

      // Pre-fetch live data to ensure search returns real MongoDB entities
      fetch(`${API_BASE}/users/admin/all`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setLiveUsers(res.data);
          }
        })
        .catch(() => {});

      fetch(`${API_BASE}/listings`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setLiveListings(res.data);
          }
        })
        .catch(() => {});

      fetch(`${API_BASE}/stores`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setLiveStores(res.data);
          }
        })
        .catch(() => {});
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      const q = query.trim().toLowerCase();

      // Dynamically compile index from users, listings, stores, and mock index
      const dynamicItems: SearchResultItem[] = [];

      try {
        // 1. Users Search (Live MongoDB + Mock)
        const combinedUsers = [...liveUsers];
        const mockUsers = MockDataService.getUsers() || [];
        mockUsers.forEach((mu) => {
          if (!combinedUsers.some((u) => u.id === mu.id || (u as any)._id === mu.id)) {
            combinedUsers.push(mu);
          }
        });

        combinedUsers.forEach((u) => {
          const uId = String(u.id || (u as any)._id || "");
          const uName = String(u.name || (u as any).profile?.name || "");
          const uUsername = String((u as any).username || "");
          const uMobile = String(u.mobile || (u as any).phone || "");
          const uEmail = String(u.email || "");
          const uCity = String(u.city || (u as any).profile?.city || "");

          if (
            uId.toLowerCase().includes(q) ||
            uName.toLowerCase().includes(q) ||
            uUsername.toLowerCase().includes(q) ||
            uMobile.toLowerCase().includes(q) ||
            uEmail.toLowerCase().includes(q) ||
            uCity.toLowerCase().includes(q)
          ) {
            dynamicItems.push({
              id: uId,
              category: "Users",
              title: uName || uUsername || `User (${uMobile})`,
              subtitle: `ID: ${uId} • ${uMobile || "No Phone"} • ${uCity || "Hyderabad"}`,
              badge: u.status || "active",
              route: `/admin/users/${uId}`,
              matches: [uId, uName, uUsername, uMobile, uEmail, uCity].filter(Boolean)
            });
          }
        });

        // 2. Listings Search (Live MongoDB + Mock)
        const combinedListings = [...liveListings];
        const mockListings = MockDataService.getListings() || [];
        mockListings.forEach((ml) => {
          if (!combinedListings.some((l) => l.id === ml.id || (l as any)._id === ml.id)) {
            combinedListings.push(ml);
          }
        });

        combinedListings.forEach((l) => {
          const lId = String(l.id || (l as any)._id || "");
          const lTitle = String(l.title || "");
          const lCat = String(l.category || l.categoryId || "");
          const lSeller = String(l.sellerName || l.businessName || "");

          if (
            lId.toLowerCase().includes(q) ||
            lTitle.toLowerCase().includes(q) ||
            lCat.toLowerCase().includes(q) ||
            lSeller.toLowerCase().includes(q)
          ) {
            const priceVal = l.priceInPaise ? Math.round(l.priceInPaise / 100) : l.price || 0;
            dynamicItems.push({
              id: lId,
              category: "Listings",
              title: lTitle,
              subtitle: `ID: ${lId} • ₹${priceVal} • Seller: ${lSeller || "Local Seller"}`,
              badge: l.status || "active",
              route: `/admin/listings/${lId}`,
              matches: [lId, lTitle, lCat, lSeller].filter(Boolean)
            });
          }
        });

        // 3. Stores Search (Live MongoDB + Mock)
        const combinedStores = [...liveStores];
        const mockStores = MockDataService.getStores() || [];
        mockStores.forEach((ms) => {
          if (!combinedStores.some((s) => s.id === ms.id || (s as any)._id === ms.id)) {
            combinedStores.push(ms);
          }
        });

        combinedStores.forEach((s) => {
          const sId = String(s.id || (s as any)._id || "");
          const sName = String(s.name || "");
          const sOwner = String(s.ownerName || s.owner || "");

          if (
            sId.toLowerCase().includes(q) ||
            sName.toLowerCase().includes(q) ||
            sOwner.toLowerCase().includes(q)
          ) {
            dynamicItems.push({
              id: sId,
              category: "Stores",
              title: sName,
              subtitle: `ID: ${sId} • Owner: ${sOwner || "Verified Owner"}`,
              badge: s.status || "active",
              route: `/admin/stores/${sId}`,
              matches: [sId, sName, sOwner].filter(Boolean)
            });
          }
        });
      } catch (err) {
        console.warn("Global search error:", err);
      }

      const staticMatches = MOCK_SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.matches.some((m) => m.toLowerCase().includes(q))
      );

      setResults([...dynamicItems, ...staticMatches]);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(handler);
  }, [query]);

  const handleKeyDownInResults = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        navigate(selected.route);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  // Group results by category
  const groupedResults = results.reduce<Record<string, SearchResultItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let globalItemCounter = 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[80vh] cursor-default"
        onKeyDown={handleKeyDownInResults}
      >
        {/* Search Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-[#E2E8F0] bg-white">
          <button
            type="button"
            onClick={onClose}
            title="Back / Close (ESC)"
            className="p-1.5 -ml-1 text-[#64748B] hover:text-[#111827] hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Search className="w-5 h-5 text-[#3547D4] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by User ID, Name, Mobile, Listing ID, Store, Campaign, Payment, Ticket, Safety Report..."
            className="w-full text-sm font-medium text-[#111827] placeholder-[#64748B] bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              title="Clear search query"
              className="p-1 text-[#64748B] hover:text-[#111827] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close search modal (ESC)"
            className="inline-flex items-center p-1 text-[#64748B] hover:text-[#111827] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[#64748B] bg-slate-100 rounded border border-slate-200">
              ESC
            </kbd>
            <X className="w-4 h-4 sm:hidden" />
          </button>
        </div>

        {/* Results / Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8 text-xs text-[#64748B] space-x-2">
              <Loader2 className="w-4 h-4 text-[#3547D4] animate-spin" />
              <span>Searching admin data...</span>
            </div>
          )}

          {!isLoading && !query.trim() && (
            <div className="p-6 text-center text-xs text-[#64748B] space-y-2">
              <div className="flex justify-center">
                <Shield className="w-8 h-8 text-[#3547D4] opacity-50" />
              </div>
              <p className="font-semibold text-[#111827]">Omeetso Global Search</p>
              <p>Type any record ID (e.g. LST-8821, USR-4092, STR-501) or customer details.</p>
            </div>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-xs text-[#64748B]">
              <p className="font-semibold text-[#111827]">No records found matching "{query}"</p>
              <p className="mt-1">Try searching with User ID, Mobile number, or Listing title.</p>
            </div>
          )}

          {!isLoading &&
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-2">
                  {category} ({items.length})
                </h4>
                <div className="space-y-1">
                  {items.map((item) => {
                    const currentIndex = globalItemCounter++;
                    const isSelected = currentIndex === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(item.route);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? "bg-[#3547D4] text-white shadow-sm" : "hover:bg-slate-50 text-[#111827]"
                        }`}
                      >
                        <div className="min-w-0 pr-2 space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs truncate">{item.title}</span>
                            {item.badge && (
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                  isSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-slate-100 text-[#64748B] border-slate-200"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate ${isSelected ? "text-indigo-100" : "text-[#64748B]"}`}>
                            {item.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          {isSelected && <CornerDownLeft className="w-4 h-4 text-white" />}
                          {!isSelected && <ArrowRight className="w-4 h-4 text-slate-300" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center space-x-3">
            <span>
              Use <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">↑</kbd>{" "}
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">↵</kbd> to select
            </span>
          </div>
          <span>Showing {results.length} results</span>
        </div>
      </div>
    </div>
  );
};
