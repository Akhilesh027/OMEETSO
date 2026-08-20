import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight, CornerDownLeft, Shield } from "lucide-react";
import { MOCK_SEARCH_INDEX, SearchResultItem } from "@/data/globalSearch";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      const filtered = MOCK_SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.matches.some((m) => m.toLowerCase().includes(q))
      );
      setResults(filtered);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 200);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyDownInResults}
      >
        {/* Search Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-[#E2E8F0] bg-white">
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
              onClick={() => setQuery("")}
              className="p-1 text-[#64748B] hover:text-[#111827] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[#64748B] bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
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
