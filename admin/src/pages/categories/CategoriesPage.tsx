import React, { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  fetchCategoriesFromDbApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  uploadCategoryImageApi
} from "@/api/adminCategories.api";
import {
  Car,
  Bike,
  Truck,
  Smartphone,
  Laptop,
  Tv,
  Sofa,
  Home,
  Briefcase,
  Wrench,
  Shirt,
  BookOpen,
  Sprout,
  Layers,
  ChevronRight,
  Database,
  RefreshCw,
  Search,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  Sparkles,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  Cpu,
  Watch,
  Camera,
  Package,
  Music,
  Utensils,
  ShieldCheck,
  Power
} from "lucide-react";

export interface CategoryData {
  id: string;
  categoryId: string;
  name: string;
  row: 1 | 2 | 3;
  iconName: string;
  iconUrl?: string;
  imageUrl?: string;
  subcategoriesLabel?: string;
  subcategories?: string[];
  filters?: string[];
  listingCardFields?: string[];
  detailsSpecFields?: string[];
  sellingFormFields?: string[];
  verificationBadges?: string[];
  sortOptions?: string[];
  compareAttributes?: string[];
  specialFeatures?: string[];
  count?: number;
  isActive?: boolean;
}

const AVAILABLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Car,
  Bike,
  Truck,
  Smartphone,
  Laptop,
  Tv,
  Sofa,
  Home,
  Briefcase,
  Wrench,
  Shirt,
  BookOpen,
  Sprout,
  Layers,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  Sparkles,
  Cpu,
  Watch,
  Camera,
  Package,
  Music,
  Utensils,
  ShieldCheck,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryData | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
    row: 1 | 2 | 3;
    iconName: string;
    iconUrl: string;
    imageUrl: string;
    subcategoriesLabel: string;
    subcategories: string[];
    filters: string[];
    isActive: boolean;
  }>({
    name: "",
    categoryId: "",
    row: 1,
    iconName: "Layers",
    iconUrl: "",
    imageUrl: "",
    subcategoriesLabel: "Subcategories",
    subcategories: [],
    filters: [],
    isActive: true
  });

  const [newSubcatInput, setNewSubcatInput] = useState("");
  const [newFilterInput, setNewFilterInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadCategoriesFromDb = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setFetchError(null);

    const res = await fetchCategoriesFromDbApi();
    if (res.success && Array.isArray(res.data)) {
      setCategories(res.data);
      setLastFetchedAt(new Date());
    } else {
      setCategories([]);
      setFetchError(res.error || "Failed to load categories from MongoDB database.");
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadCategoriesFromDb();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: "",
      categoryId: "",
      row: 1,
      iconName: "Layers",
      iconUrl: "",
      imageUrl: "",
      subcategoriesLabel: "Subcategories",
      subcategories: ["General"],
      filters: ["Price", "Condition", "Location"],
      isActive: true
    });
    setNewSubcatInput("");
    setNewFilterInput("");
    setIsCreateModalOpen(true);
  };

  const openEditModal = (cat: CategoryData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCategory(cat);
    setFormData({
      name: cat.name || "",
      categoryId: cat.categoryId || cat.id || "",
      row: cat.row || 1,
      iconName: cat.iconName || "Layers",
      iconUrl: cat.iconUrl || "",
      imageUrl: cat.imageUrl || "",
      subcategoriesLabel: cat.subcategoriesLabel || "Subcategories",
      subcategories: [...(cat.subcategories || [])],
      filters: [...(cat.filters || [])],
      isActive: cat.isActive !== false
    });
    setNewSubcatInput("");
    setNewFilterInput("");
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cat: CategoryData, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadCategoryImageApi(file);
    if (res.success && res.url) {
      setFormData((prev) => ({ ...prev, imageUrl: res.url! }));
      showToast("success", "Category image uploaded");
    } else {
      showToast("error", res.error || "Failed to upload image");
    }
  };

  const handleAddSubcategory = () => {
    const val = newSubcatInput.trim();
    if (val && !formData.subcategories.includes(val)) {
      setFormData((prev) => ({ ...prev, subcategories: [...prev.subcategories, val] }));
      setNewSubcatInput("");
    }
  };

  const handleRemoveSubcategory = (sub: string) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== sub)
    }));
  };

  const handleAddFilter = () => {
    const val = newFilterInput.trim();
    if (val && !formData.filters.includes(val)) {
      setFormData((prev) => ({ ...prev, filters: [...prev.filters, val] }));
      setNewFilterInput("");
    }
  };

  const handleRemoveFilter = (filt: string) => {
    setFormData((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f !== filt)
    }));
  };

  const handleSaveCategory = async (isEditing: boolean) => {
    if (!formData.name.trim()) {
      showToast("error", "Category name is required");
      return;
    }

    setIsSaving(true);
    if (isEditing && selectedCategory) {
      const targetId = selectedCategory.categoryId || selectedCategory.id;
      const res = await updateCategoryApi(targetId, formData);
      if (res.success) {
        showToast("success", `Category "${formData.name}" updated successfully!`);
        setIsEditModalOpen(false);
        await loadCategoriesFromDb();
      } else {
        showToast("error", res.error || "Failed to update category");
      }
    } else {
      const res = await createCategoryApi(formData);
      if (res.success) {
        showToast("success", `Category "${formData.name}" created successfully!`);
        setIsCreateModalOpen(false);
        await loadCategoriesFromDb();
      } else {
        showToast("error", res.error || "Failed to create category");
      }
    }
    setIsSaving(false);
  };

  const handleConfirmDelete = async (permanent: boolean) => {
    if (!categoryToDelete) return;
    setIsSaving(true);
    const targetId = categoryToDelete.categoryId || categoryToDelete.id;
    const res = await deleteCategoryApi(targetId, permanent);
    if (res.success) {
      showToast("success", res.message || "Category removed successfully");
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      await loadCategoriesFromDb();
    } else {
      showToast("error", res.error || "Failed to remove category");
    }
    setIsSaving(false);
  };

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.categoryId?.toLowerCase().includes(q) ||
      cat.subcategories?.some((s) => s.toLowerCase().includes(q)) ||
      cat.filters?.some((f) => f.toLowerCase().includes(q))
    );
  });

  const row1 = filteredCategories.filter((c) => c.row === 1);
  const row2 = filteredCategories.filter((c) => c.row === 2);
  const row3 = filteredCategories.filter((c) => c.row === 3);

  const renderCategoryIcon = (cat: CategoryData, className = "w-5 h-5") => {
    if (cat.imageUrl) {
      return <img src={cat.imageUrl} alt={cat.name} className={`${className} object-cover rounded-md`} />;
    }
    if (cat.iconUrl) {
      return <img src={cat.iconUrl} alt={cat.name} className={`${className} object-contain`} />;
    }
    const IconComp = AVAILABLE_ICONS[cat.iconName] || Layers;
    return <IconComp className={className} />;
  };

  const renderCategoryCard = (cat: CategoryData, index: number) => {
    return (
      <div
        key={cat.categoryId || cat.id}
        onClick={() => {
          setSelectedCategory(cat);
          setIsInspectorOpen(true);
        }}
        className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group space-y-3 relative overflow-hidden shadow-sm hover:shadow-md ${
          cat.isActive === false
            ? "border-amber-300 dark:border-amber-800/60 opacity-75"
            : "border-[#E2E8F0] dark:border-slate-700 hover:border-[#3547D4]"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-[#3547D4] dark:text-indigo-400 group-hover:bg-[#3547D4] group-hover:text-white transition-colors flex items-center justify-center font-bold shrink-0 overflow-hidden">
              {renderCategoryIcon(cat, "w-5 h-5")}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{index + 1}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Row {cat.row}
                </span>
                {cat.isActive === false && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    Inactive
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#111827] dark:text-white group-hover:text-[#3547D4] transition-colors">
                {cat.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => openEditModal(cat, e)}
              title="Edit Category, Icon & Image"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#3547D4] hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => openDeleteModal(cat, e)}
              title="Delete or Disable Category"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-[#64748B] dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>{cat.subcategoriesLabel || "Subcategories"}:</span>
            <strong className="text-[#111827] dark:text-slate-200">{cat.subcategories?.length || 0} Types</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Custom Filters:</span>
            <strong className="text-[#3547D4] dark:text-indigo-400">{cat.filters?.length || 0} Filters</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Live Listings:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{cat.count ?? 0}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between text-xs font-bold text-[#3547D4] dark:text-indigo-400 group-hover:underline">
          <span>Inspect Rules & Fields</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
          }`}
        >
          {notification.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      <PageHeader
        title="Category Management & Schema Engine"
        description="Create, edit, organize category hierarchies, icons, banners, subcategories, and search filter schemas in MongoDB."
        badge={`${categories.length} Categories in Database`}
        badgeColor={categories.length > 0 ? "emerald" : "indigo"}
        primaryAction={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadCategoriesFromDb(true)}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#3547D4]" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync DB"}</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        }
      />

      {/* SEARCH & DB STATUS */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              MongoDB Database: <strong className="text-emerald-600 dark:text-emerald-400">{categories.length} Categories</strong>
            </span>
          </div>
          {lastFetchedAt && (
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Updated: {lastFetchedAt.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories, subcategories or filters..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3547D4] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => loadCategoriesFromDb(true)}
            className="px-3 py-1 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold rounded-lg hover:bg-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 border-3 border-[#3547D4] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Loading categories from MongoDB...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ROW 1 */}
          {row1.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#3547D4]" />
                  <span>Row 1 — Automotive & Personal Tech ({row1.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {row1.map((cat, idx) => renderCategoryCard(cat, idx))}
              </div>
            </div>
          )}

          {/* ROW 2 */}
          {row2.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
                  <span>Row 2 — Home, Real Estate, Careers & Services ({row2.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {row2.map((cat, idx) => renderCategoryCard(cat, idx + row1.length))}
              </div>
            </div>
          )}

          {/* ROW 3 */}
          {row3.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
                  <span>Row 3 — Lifestyle, Hobbies & Agriculture ({row3.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {row3.map((cat, idx) => renderCategoryCard(cat, idx + row1.length + row2.length))}
              </div>
            </div>
          )}

          {categories.length === 0 && !fetchError && (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <Database className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Categories Found in MongoDB</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a category to get started or seed categories on demand.
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-[#3547D4] text-white text-xs font-bold rounded-xl shadow hover:bg-[#111E4D]"
              >
                + Add First Category
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-[#3547D4] dark:text-indigo-400 flex items-center justify-center font-bold">
                  {AVAILABLE_ICONS[formData.iconName] ? (
                    React.createElement(AVAILABLE_ICONS[formData.iconName], { className: "w-5 h-5" })
                  ) : (
                    <Layers className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827] dark:text-white">
                    {isEditModalOpen ? `Edit Category: ${formData.name}` : "Create New Category"}
                  </h3>
                  <span className="text-[10px] text-slate-400">Configure category metadata, icon, image, and schema rules</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* BASIC DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Electric Vehicles"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#3547D4] outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Row Section *
                  </label>
                  <select
                    value={formData.row}
                    onChange={(e) => setFormData({ ...formData, row: Number(e.target.value) as 1 | 2 | 3 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#3547D4] outline-none text-slate-900 dark:text-white"
                  >
                    <option value={1}>Row 1 — Automotive & Personal Tech</option>
                    <option value={2}>Row 2 — Home, Real Estate, Careers & Services</option>
                    <option value={3}>Row 3 — Lifestyle, Hobbies & Agriculture</option>
                  </select>
                </div>
              </div>

              {/* ICON PICKER */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Icon (Lucide Icon Library)
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto">
                  {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                    const IconC = AVAILABLE_ICONS[iconKey];
                    const isSelected = formData.iconName === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setFormData({ ...formData, iconName: iconKey })}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#3547D4] text-white shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700"
                        }`}
                        title={iconKey}
                      >
                        <IconC className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5 truncate w-full text-center">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM IMAGE / ICON UPLOAD OR URL */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Custom Image Banner & Direct Icon URL</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Upload Image Banner:
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-2 text-xs font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#3547D4]" />
                      <span>Upload Banner File</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Or Banner Image URL:
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#3547D4] outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="flex items-center space-x-3 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <img src={formData.imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 truncate">
                      <span className="text-[10px] font-bold text-slate-500 block">Image Preview</span>
                      <span className="text-[10px] text-slate-400 truncate block">{formData.imageUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* SUBCATEGORIES CHIPS EDITOR */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Subcategories ({formData.subcategories.length})
                  </label>
                  <input
                    type="text"
                    value={formData.subcategoriesLabel}
                    onChange={(e) => setFormData({ ...formData, subcategoriesLabel: e.target.value })}
                    placeholder="Subcategories Label (e.g. Brand)"
                    className="px-2 py-0.5 text-[10px] bg-white dark:bg-slate-800 border rounded-lg text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {formData.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-[#3547D4] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(sub)}
                        className="hover:text-rose-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSubcatInput}
                    onChange={(e) => setNewSubcatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    placeholder="Type subcategory and press Enter or click Add"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-3 py-1.5 bg-[#3547D4] text-white font-bold rounded-xl text-xs hover:bg-[#111E4D]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* FILTERS CHIPS EDITOR */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Category Search Filters ({formData.filters.length})
                </label>

                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {formData.filters.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(f)}
                        className="hover:text-rose-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newFilterInput}
                    onChange={(e) => setNewFilterInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFilter();
                      }
                    }}
                    placeholder="Add filter (e.g. Fuel Type, Brand, RAM)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFilter}
                    className="px-3 py-1.5 bg-[#3547D4] text-white font-bold rounded-xl text-xs hover:bg-[#111E4D]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* STATUS TOGGLE */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Category Status</span>
                  <span className="text-[10px] text-slate-400">Controls visibility on mobile apps & web portal</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors ${
                    formData.isActive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{formData.isActive ? "Active" : "Inactive"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-700 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveCategory(isEditModalOpen)}
                className="px-5 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D] disabled:opacity-60 shadow-sm flex items-center space-x-1.5"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? "Saving..." : isEditModalOpen ? "Save Changes" : "Create Category"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete or Disable Category?</h3>
                <span className="text-[11px] text-slate-400">{categoryToDelete.name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Disabling will hide this category from marketplace forms without removing historical listings. Permanent deletion will completely remove this category record from MongoDB.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleConfirmDelete(false)}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600"
              >
                Disable Category
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleConfirmDelete(true)}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEMA INSPECTOR MODAL */}
      {isInspectorOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-[#3547D4] dark:text-indigo-400 flex items-center justify-center font-bold">
                  {renderCategoryIcon(selectedCategory, "w-5 h-5")}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827] dark:text-white">
                    {selectedCategory.name}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Row {selectedCategory.row} • ID: {selectedCategory.categoryId || selectedCategory.id} • {selectedCategory.count || 0} live listings
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* BANNER / IMAGE PREVIEW */}
              {selectedCategory.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-32 relative">
                  <img src={selectedCategory.imageUrl} alt={selectedCategory.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 text-white font-bold text-xs">
                    Category Banner Image
                  </div>
                </div>
              )}

              {/* SUBCATEGORIES */}
              {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                <div className="p-3 bg-[#F5F7FC] dark:bg-slate-900/60 rounded-xl space-y-2 border border-[#E2E8F0] dark:border-slate-700">
                  <h4 className="font-bold text-[#111827] dark:text-slate-200 uppercase tracking-wider text-[10px]">
                    {selectedCategory.subcategoriesLabel || "Subcategories"} ({selectedCategory.subcategories.length}):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#3547D4] dark:text-indigo-300 rounded-lg"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SPECIFIC FILTERS */}
              {selectedCategory.filters && selectedCategory.filters.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-2 border border-[#E2E8F0] dark:border-slate-700">
                  <h4 className="font-bold text-[#111827] dark:text-slate-200 uppercase tracking-wider text-[10px]">
                    Category-Specific Search Filters ({selectedCategory.filters.length}):
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    {selectedCategory.filters.map((f) => (
                      <li key={f} className="flex items-start space-x-1.5">
                        <span className="text-[#3547D4] font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SORT OPTIONS */}
              {selectedCategory.sortOptions && selectedCategory.sortOptions.length > 0 && (
                <div className="p-3 bg-[#F5F7FC] dark:bg-slate-900/60 rounded-xl border border-[#E2E8F0] dark:border-slate-700 space-y-1">
                  <h4 className="font-bold text-[#111827] dark:text-slate-200 text-[11px]">Category Sorting Options:</h4>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {selectedCategory.sortOptions.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={(e) => {
                  setIsInspectorOpen(false);
                  openEditModal(selectedCategory, e);
                }}
                className="px-3.5 py-1.5 text-xs font-bold bg-indigo-50 text-[#3547D4] dark:bg-indigo-950 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 flex items-center space-x-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Category</span>
              </button>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="px-4 py-1.5 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
