import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdPlacementsApi,
  createAdminAdPlacementApi,
  updateAdminAdPlacementApi,
  deleteAdminAdPlacementApi,
  getAdminAdSettingsApi,
  updateAdminAdSettingsApi
} from "@/api/adminAds.api";
import { getFrontendBaseUrl } from "@/config/api";
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Maximize2,
  Users,
  Sparkles,
  Image as ImageIcon,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Globe,
  Smartphone,
  Layout,
  Tag,
  DollarSign,
  PackageCheck,
  ArrowRight,
  TrendingUp,
  Check,
  X,
  AlertCircle,
  Copy,
  Power,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Target,
  CheckCircle2,
  Info
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

type PlacementCategoryTab = "GOOGLE" | "OMEETSO" | "ALL";
type SurfaceFilter = "ALL" | "HOMEPAGE" | "PRODUCT_DETAILS" | "CATEGORY" | "SEARCH" | "STORES_JOBS" | "GLOBAL_MOBILE";
type FormatFilter = "ALL" | "GOOGLE_ADSENSE" | "BANNER_AD" | "LISTING_BOOST" | "HAS_PLANS" | "OCCUPIED" | "AVAILABLE";

const PRESET_PLACEMENTS = [
  // 📱 Product Detail Page High-Yield Placements (Google AdSense)
  {
    placementId: "PRODUCT_DETAIL_SIDEBAR_MIDDLE",
    name: "Product Detail - Right Sidebar Middle Deal",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    minimumWidth: 400,
    minimumHeight: 120,
    maximumFileSizeBytes: 1048576,
    maximumActiveSlots: 5,
    page: "Product Detail Page",
    route: "/product/:id",
    position: "Right Sidebar between Seller Profile & Quick Action Card",
    description: "Desktop sidebar middle partner deal banner visible immediately as buyers view price and seller details.",
    device: "Desktop Web",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "4455667795",
    adFormat: "horizontal",
    active: true,
  },
  {
    placementId: "PRODUCT_DETAIL_SIDEBAR_RAIL",
    name: "Product Detail - Desktop Sticky Lower Rail",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "1:1",
    minimumWidth: 300,
    minimumHeight: 250,
    maximumFileSizeBytes: 2097152,
    maximumActiveSlots: 5,
    page: "Product Detail Page",
    route: "/product/:id",
    position: "Right Sidebar sticky lower rail below Safety Card",
    description: "High-viewability sticky rail ad that stays in the user viewport as they scroll through photos and specs.",
    device: "Desktop Web",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "4455667791",
    adFormat: "rectangle",
    active: true,
  },
  {
    placementId: "PRODUCT_DETAIL_MID_CONTENT",
    name: "Product Detail - In-Article Mid-Content",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    minimumWidth: 728,
    minimumHeight: 90,
    maximumFileSizeBytes: 2097152,
    maximumActiveSlots: 5,
    page: "Product Detail Page",
    route: "/product/:id",
    position: "Left Column below Product Description",
    description: "Natural reading break banner placed immediately beneath the product description and specifications table.",
    device: "Web & Mobile App",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "4455667792",
    adFormat: "horizontal",
    active: true,
  },
  {
    placementId: "PRODUCT_DETAIL_CONTEXTUAL_MREC",
    name: "Product Detail - Contextual Accessories MREC",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "1:1",
    minimumWidth: 300,
    minimumHeight: 250,
    maximumFileSizeBytes: 2097152,
    maximumActiveSlots: 5,
    page: "Product Detail Page",
    route: "/product/:id",
    position: "Left Column between Seller Overview & Safety Guide",
    description: "Contextual unit for related accessories, transport services, insurance, and local merchant offers matching the item.",
    device: "Web & Mobile App",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "4455667788",
    adFormat: "rectangle",
    active: true,
  },
  {
    placementId: "PRODUCT_DETAIL_SIMILAR_INFEED",
    name: "Product Detail - Similar Items In-Feed Card",
    campaignTypes: ["LISTING_BOOST"],
    aspectRatio: "CARD",
    minimumWidth: 600,
    minimumHeight: 400,
    maximumFileSizeBytes: 2097152,
    maximumActiveSlots: 5,
    page: "Product Detail Page",
    route: "/product/:id",
    position: "Similar Products Grid Position #3",
    description: "Native sponsored card blended seamlessly alongside alternative and similar listings.",
    device: "Web & Mobile App",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "4455667793",
    adFormat: "in-feed",
    active: true,
  },
  {
    placementId: "PRODUCT_DETAIL_BOTTOM_BILLBOARD",
    name: "Product Detail - Bottom Marketplace Billboard",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    minimumWidth: 728,
    minimumHeight: 90,
    maximumFileSizeBytes: 2097152,
    maximumActiveSlots: 5,
    page: "Product Detail Page",
    route: "/product/:id",
    position: "Footer of Product Listing page below Similar Items",
    description: "Wide horizontal banner capturing users who scroll through the full product page without making an inquiry.",
    device: "Web & Mobile App",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "4455667794",
    adFormat: "horizontal",
    active: true,
  },
  // 📲 Global & Search Placements (Google AdSense)
  {
    placementId: "GLOBAL_MOBILE_STICKY_ANCHOR",
    name: "Global Mobile Sticky Bottom Anchor Banner",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "6:1",
    minimumWidth: 320,
    minimumHeight: 50,
    maximumFileSizeBytes: 524288,
    maximumActiveSlots: 5,
    page: "Universal Mobile Screens",
    route: "/*",
    position: "Fixed Docked Screen Bottom on Mobile",
    description: "High-CTR Google Anchor unit docked to the bottom of mobile screens with smooth collapse controls.",
    device: "Mobile Only",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "4455667790",
    adFormat: "horizontal",
    active: true,
  },
  {
    placementId: "SEARCH_DESKTOP_SKYSCRAPER",
    name: "Search Results Desktop Skyscraper",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "1:2",
    minimumWidth: 300,
    minimumHeight: 600,
    maximumFileSizeBytes: 2097152,
    maximumActiveSlots: 5,
    page: "Search Results",
    route: "/results",
    position: "Right Rail Filter Sidebar on Desktop",
    description: "Vertical half-page skyscraper display ad pinned on desktop search and filter view.",
    device: "Desktop Web",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "1122334455",
    adFormat: "vertical",
    active: true,
  },
  {
    placementId: "CATEGORY_DESKTOP_SIDEBAR",
    name: "Category Browse Desktop Sidebar",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "1:1",
    minimumWidth: 300,
    minimumHeight: 250,
    maximumFileSizeBytes: 2097152,
    maximumActiveSlots: 5,
    page: "Category Browse",
    route: "/category/all",
    position: "Category Filter Sidebar on Desktop",
    description: "Contextual square/rectangle display banner pinned in category filter rails.",
    device: "Desktop Web",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "3344556677",
    adFormat: "rectangle",
    active: true,
  },
  {
    placementId: "HOMEPAGE_INFEED",
    name: "Homepage Recommended In-Feed Cards",
    campaignTypes: ["LISTING_BOOST"],
    aspectRatio: "CARD",
    page: "Homepage",
    route: "/",
    position: "Recommended & Recent Listings Grid",
    maximumActiveSlots: 10,
    device: "Web & Mobile App",
    networkProvider: "GOOGLE_ADSENSE",
    googleSlotId: "8899001122",
    adFormat: "in-feed",
    active: true,
  },
  // 🏠 Core Omeetso Marketplace Direct & Boost Placements
  {
    placementId: "HOMEPAGE_HERO",
    name: "Home Page Banners",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "16:9",
    page: "Homepage",
    route: "/",
    position: "Main Hero Showcase Slider",
    maximumActiveSlots: 10,
    device: "Web & Mobile App",
    networkProvider: "DIRECT_ADVERTISER",
    active: true,
  },
  {
    placementId: "CATEGORY_HEADER",
    name: "Category Page Header Banners",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    page: "Category Browse",
    route: "/category/all",
    position: "Header Billboard Banner above listings",
    maximumActiveSlots: 8,
    device: "Web & Mobile App",
    networkProvider: "DIRECT_ADVERTISER",
    active: true,
  },
  {
    placementId: "SEARCH_TOP",
    name: "Search Results Priority Spots",
    campaignTypes: ["LISTING_BOOST"],
    aspectRatio: "1:1",
    page: "Search Results",
    route: "/results",
    position: "Guaranteed top 1-3 ranking spots in search",
    maximumActiveSlots: 15,
    device: "Web & Mobile App",
    networkProvider: "DIRECT_ADVERTISER",
    active: true,
  },
  {
    placementId: "STORE_BANNER",
    name: "Store Directory Billboard",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    page: "Stores Directory",
    route: "/stores",
    position: "Showroom billboard header",
    maximumActiveSlots: 6,
    device: "Web & Mobile App",
    networkProvider: "DIRECT_ADVERTISER",
    active: true,
  },
  {
    placementId: "JOBS_HEADER",
    name: "Jobs Portal Header Banner",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    page: "Jobs Portal",
    route: "/jobs",
    position: "Jobs portal top header banner",
    maximumActiveSlots: 5,
    device: "Web & Mobile App",
    networkProvider: "DIRECT_ADVERTISER",
    active: true,
  }
];

export interface AdPlacementsPageProps {
  initialTab?: PlacementCategoryTab;
}

export default function AdPlacementsPage({ initialTab }: AdPlacementsPageProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from prop, pathname, or query param
  const getInitialActiveTab = (): PlacementCategoryTab => {
    if (initialTab) return initialTab;
    const pathname = location.pathname.toLowerCase();
    if (pathname.includes("/google")) return "GOOGLE";
    if (pathname.includes("/omeetso")) return "OMEETSO";
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab")?.toUpperCase();
    if (tabParam === "GOOGLE" || tabParam === "OMEETSO" || tabParam === "ALL") {
      return tabParam as PlacementCategoryTab;
    }
    return "GOOGLE"; // Default to Google view as requested
  };

  const [activeCategoryTab, setActiveCategoryTab] = useState<PlacementCategoryTab>(getInitialActiveTab);

  // Synchronize when URL path or prop changes
  useEffect(() => {
    const nextTab = getInitialActiveTab();
    setActiveCategoryTab(nextTab);
  }, [location.pathname, location.search, initialTab]);

  const [placements, setPlacements] = useState<any[]>(PRESET_PLACEMENTS);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("ALL");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("ALL");
  const [googleVisibilityFilter, setGoogleVisibilityFilter] = useState<"ALL" | "SHOW_ONLY" | "HIDE_ONLY">("ALL");

  // Google AdSense Global Account Settings State
  const [googleAdsEnabled, setGoogleAdsEnabled] = useState(
    () => localStorage.getItem("admin_google_adsense_enabled") !== "false"
  );
  const [googleClientId, setGoogleClientId] = useState(
    () => localStorage.getItem("admin_google_adsense_client_id") || "ca-pub-18494959839"
  );
  const [isTestMode, setIsTestMode] = useState(
    () => localStorage.getItem("admin_google_adsense_test_mode") !== "false"
  );
  const [copiedSlotId, setCopiedSlotId] = useState<string | null>(null);

  // Add Placement Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [placementId, setPlacementId] = useState("");
  const [name, setName] = useState("");
  const [campaignType, setCampaignType] = useState<"BANNER_AD" | "LISTING_BOOST">("BANNER_AD");
  const [aspectRatio, setAspectRatio] = useState("3:1");
  const [minimumWidth, setMinimumWidth] = useState("728");
  const [minimumHeight, setMinimumHeight] = useState("90");
  const [maximumFileSizeBytes, setMaximumFileSizeBytes] = useState("2097152");
  const [maximumActiveSlots, setMaximumActiveSlots] = useState("5");
  const [pageLocation, setPageLocation] = useState("Product Details");
  const [routePath, setRoutePath] = useState("/product/:id");
  const [positionDesc, setPositionDesc] = useState("In-Page Sponsored Unit");
  const [description, setDescription] = useState("");
  const [deviceTarget, setDeviceTarget] = useState("Web & Mobile App");
  const [baseCPM, setBaseCPM] = useState("100");
  const [baseDailyRate, setBaseDailyRate] = useState("299");
  const [networkProvider, setNetworkProvider] = useState<"GOOGLE_ADSENSE" | "DIRECT_ADVERTISER" | "HYBRID">("GOOGLE_ADSENSE");
  const [googleSlotId, setGoogleSlotId] = useState("");
  const [adFormat, setAdFormat] = useState("auto");
  const [createActiveShow, setCreateActiveShow] = useState(true);

  // Edit Placement Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editPlacementId, setEditPlacementId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCampaignType, setEditCampaignType] = useState<"BANNER_AD" | "LISTING_BOOST">("BANNER_AD");
  const [editAspectRatio, setEditAspectRatio] = useState("16:9");
  const [editMinimumWidth, setEditMinimumWidth] = useState("1600");
  const [editMinimumHeight, setEditMinimumHeight] = useState("900");
  const [editMaximumFileSizeBytes, setEditMaximumFileSizeBytes] = useState("3145728");
  const [editMaximumActiveSlots, setEditMaximumActiveSlots] = useState("5");
  const [editPageLocation, setEditPageLocation] = useState("Homepage");
  const [editRoutePath, setEditRoutePath] = useState("/");
  const [editPositionDesc, setEditPositionDesc] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeviceTarget, setEditDeviceTarget] = useState("Web & Mobile App");
  const [editBaseCPM, setEditBaseCPM] = useState("100");
  const [editBaseDailyRate, setEditBaseDailyRate] = useState("299");
  const [editActive, setEditActive] = useState(true);
  const [editNetworkProvider, setEditNetworkProvider] = useState<"GOOGLE_ADSENSE" | "DIRECT_ADVERTISER" | "HYBRID">("GOOGLE_ADSENSE");
  const [editGoogleSlotId, setEditGoogleSlotId] = useState("");
  const [editAdFormat, setEditAdFormat] = useState("auto");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();

  // Load Placements and Global Ad Settings from Backend
  const loadPlacements = useCallback(async () => {
    setLoading(true);
    const [placeRes, settingsRes] = await Promise.all([
      getAdminAdPlacementsApi(),
      getAdminAdSettingsApi()
    ]);
    setLoading(false);

    if (placeRes.success && Array.isArray(placeRes.data) && placeRes.data.length > 0) {
      setPlacements(placeRes.data);
    }
    if (settingsRes.success && settingsRes.data) {
      if (typeof settingsRes.data.googleAdsEnabled === "boolean") {
        setGoogleAdsEnabled(settingsRes.data.googleAdsEnabled);
        localStorage.setItem("admin_google_adsense_enabled", String(settingsRes.data.googleAdsEnabled));
      }
      if (settingsRes.data.googleClientId) {
        setGoogleClientId(settingsRes.data.googleClientId);
        localStorage.setItem("admin_google_adsense_client_id", settingsRes.data.googleClientId);
      }
      if (typeof settingsRes.data.googleTestMode === "boolean") {
        setIsTestMode(settingsRes.data.googleTestMode);
        localStorage.setItem("admin_google_adsense_test_mode", String(settingsRes.data.googleTestMode));
      }
    }
  }, []);

  useEffect(() => {
    loadPlacements();
  }, [loadPlacements]);

  // Master Global Google Ads ON/OFF Toggle
  const handleToggleGoogleAdsMaster = async () => {
    const nextEnabled = !googleAdsEnabled;
    setGoogleAdsEnabled(nextEnabled);
    localStorage.setItem("admin_google_adsense_enabled", String(nextEnabled));

    showSuccess(
      nextEnabled ? "Google Ads Visible (ON)" : "Google Ads Hidden (OFF)",
      nextEnabled
        ? "Google Ads units are now active & visible to users across the platform."
        : "Google Ads units have been disabled and hidden from users across the platform."
    );

    const res = await updateAdminAdSettingsApi({
      googleAdsEnabled: nextEnabled,
      googleClientId,
      googleTestMode: isTestMode
    });
    if (!res.success && res.error) {
      showError("Sync Warning", res.error);
    }
  };

  const handleSaveGoogleSettings = async () => {
    localStorage.setItem("admin_google_adsense_client_id", googleClientId);
    localStorage.setItem("admin_google_adsense_test_mode", String(isTestMode));
    localStorage.setItem("admin_google_adsense_enabled", String(googleAdsEnabled));

    const res = await updateAdminAdSettingsApi({
      googleAdsEnabled,
      googleClientId: googleClientId.trim(),
      googleTestMode: isTestMode
    });

    if (res.success) {
      showSuccess("Google AdSense Settings Saved", "Client ID & Test Mode preferences updated.");
    } else {
      showSuccess("Settings Saved Locally", "Client ID & Test Mode updated.");
    }
  };

  // Dedicated SHOW / DON'T SHOW (ON / OFF) Toggle for Google Ad Slots
  const handleToggleGoogleSlotShow = async (p: any) => {
    const newActiveState = !(p.active !== false);

    // Optimistic UI update
    setPlacements((prev) =>
      prev.map((item) =>
        (item.placementId === p.placementId || item.id === p.id || item._id === p._id)
          ? { ...item, active: newActiveState }
          : item
      )
    );

    const targetId = p.id || p._id;
    if (targetId) {
      const res = await updateAdminAdPlacementApi(targetId, { active: newActiveState });
      if (res.success) {
        showSuccess(
          newActiveState ? "Google Ad Slot: SHOW" : "Google Ad Slot: DON'T SHOW",
          `"${p.name}" is now set to ${newActiveState ? "SHOW (Visible on site)" : "DON'T SHOW (Hidden from buyers)"}.`
        );
      } else {
        showError("Toggle Failed", res.error);
        loadPlacements();
      }
    } else {
      showSuccess(
        newActiveState ? "Google Ad Slot: SHOW" : "Google Ad Slot: DON'T SHOW",
        `"${p.name}" is now set to ${newActiveState ? "SHOW (Visible)" : "DON'T SHOW (Hidden)"}.`
      );
    }
  };

  // Quick 1-Click Active / Paused Toggle for Omeetso Direct Ads
  const handleToggleOmeetsoSlotActive = async (p: any) => {
    const newActiveState = !(p.active !== false);

    setPlacements((prev) =>
      prev.map((item) =>
        (item.placementId === p.placementId || item.id === p.id || item._id === p._id)
          ? { ...item, active: newActiveState }
          : item
      )
    );

    const targetId = p.id || p._id;
    if (targetId) {
      const res = await updateAdminAdPlacementApi(targetId, { active: newActiveState });
      if (res.success) {
        showSuccess("Omeetso Slot Toggled", `"${p.name}" is now ${newActiveState ? "ACTIVE" : "PAUSED"}.`);
      } else {
        showError("Toggle Failed", res.error);
        loadPlacements();
      }
    } else {
      showSuccess("Omeetso Slot Toggled", `"${p.name}" is now ${newActiveState ? "ACTIVE" : "PAUSED"}.`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSlotId(text);
    setTimeout(() => setCopiedSlotId(null), 2000);
    showSuccess("Slot ID Copied", `Copied ${text} to clipboard.`);
  };

  // Open Add Placement Modal with sensible defaults based on active tab
  const openCreateModal = () => {
    if (activeCategoryTab === "GOOGLE") {
      setNetworkProvider("GOOGLE_ADSENSE");
      setPageLocation("Product Details");
      setRoutePath("/product/:id");
      setPlacementId("PRODUCT_DETAIL_CUSTOM_BANNER");
      setName("Product Detail Custom Partner Ad");
      setCampaignType("BANNER_AD");
      setAspectRatio("3:1");
      setMinimumWidth("728");
      setMinimumHeight("90");
      setGoogleSlotId("9988776655");
      setAdFormat("horizontal");
    } else {
      setNetworkProvider("DIRECT_ADVERTISER");
      setPageLocation("Homepage");
      setRoutePath("/");
      setPlacementId("HOMEPAGE_SPECIAL_BILLBOARD");
      setName("Homepage Special Partner Billboard");
      setCampaignType("BANNER_AD");
      setAspectRatio("16:9");
      setMinimumWidth("1600");
      setMinimumHeight("900");
      setGoogleSlotId("");
      setAdFormat("auto");
    }
    setCreateActiveShow(true);
    setIsAddModalOpen(true);
  };

  const handleCreatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementId.trim() || !name.trim()) return;

    setActionLoading(true);
    const newPlacementPayload = {
      placementId: placementId.trim().toUpperCase().replace(/\s+/g, "_"),
      name: name.trim(),
      campaignTypes: [campaignType],
      aspectRatio,
      minimumWidth: Number(minimumWidth),
      minimumHeight: Number(minimumHeight),
      maximumFileSizeBytes: Number(maximumFileSizeBytes),
      maximumActiveSlots: Number(maximumActiveSlots),
      page: pageLocation,
      route: routePath,
      position: positionDesc,
      description,
      device: deviceTarget,
      baseCPM: Number(baseCPM),
      baseDailyRate: Number(baseDailyRate),
      networkProvider,
      googleSlotId: googleSlotId.trim(),
      adFormat,
      active: createActiveShow
    };

    const res = await createAdminAdPlacementApi(newPlacementPayload);
    setActionLoading(false);

    if (res.success) {
      showSuccess("Placement Created", `${name} added to live ad system.`);
      setIsAddModalOpen(false);
      loadPlacements();
    } else {
      // Optimistic local add
      setPlacements((prev) => [
        {
          id: `local_${Date.now()}`,
          ...newPlacementPayload,
          pricingPlans: [],
          bookedSlotsCount: 0,
          bookedCampaigns: []
        },
        ...prev
      ]);
      showSuccess("Placement Added", `${name} configured.`);
      setIsAddModalOpen(false);
    }
  };

  const openEditModal = (p: any) => {
    setEditId(p.id || p._id || "");
    setEditPlacementId(p.placementId);
    setEditName(p.name);
    setEditCampaignType(p.campaignTypes?.[0] || "BANNER_AD");
    setEditAspectRatio(p.aspectRatio || "16:9");
    setEditMinimumWidth(String(p.minimumWidth || "1200"));
    setEditMinimumHeight(String(p.minimumHeight || "600"));
    setEditMaximumFileSizeBytes(String(p.maximumFileSizeBytes || "2097152"));
    setEditMaximumActiveSlots(String(p.maximumActiveSlots || "5"));
    setEditPageLocation(p.page || "Homepage");
    setEditRoutePath(p.route || "/");
    setEditPositionDesc(p.position || "");
    setEditDescription(p.description || "");
    setEditDeviceTarget(p.device || "Web & Mobile App");
    setEditBaseCPM(String(p.baseCPM || "100"));
    setEditBaseDailyRate(String(p.baseDailyRate || "299"));
    setEditActive(p.active !== false);
    setEditNetworkProvider(p.networkProvider || (p.googleSlotId ? "GOOGLE_ADSENSE" : "DIRECT_ADVERTISER"));
    setEditGoogleSlotId(p.googleSlotId || "");
    setEditAdFormat(p.adFormat || "auto");
    setIsEditModalOpen(true);
  };

  const handleUpdatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    setActionLoading(true);
    const updatePayload = {
      name: editName.trim(),
      campaignTypes: [editCampaignType],
      aspectRatio: editAspectRatio,
      minimumWidth: Number(editMinimumWidth),
      minimumHeight: Number(editMinimumHeight),
      maximumFileSizeBytes: Number(editMaximumFileSizeBytes),
      maximumActiveSlots: Number(editMaximumActiveSlots),
      page: editPageLocation,
      route: editRoutePath,
      position: editPositionDesc,
      description: editDescription,
      device: editDeviceTarget,
      baseCPM: Number(editBaseCPM),
      baseDailyRate: Number(editBaseDailyRate),
      active: editActive,
      networkProvider: editNetworkProvider,
      googleSlotId: editGoogleSlotId.trim(),
      adFormat: editAdFormat
    };

    const res = await updateAdminAdPlacementApi(editId, updatePayload);
    setActionLoading(false);

    if (res.success) {
      showSuccess("Placement Updated", `${editName} configuration saved.`);
      setIsEditModalOpen(false);
      loadPlacements();
    } else {
      setPlacements((prev) =>
        prev.map((item) => ((item.id === editId || item._id === editId) ? { ...item, ...updatePayload } : item))
      );
      showSuccess("Placement Updated", `${editName} changes saved.`);
      setIsEditModalOpen(false);
    }
  };

  const handleDeletePlacement = async (id: string, name: string) => {
    setActionLoading(true);
    const res = await deleteAdminAdPlacementApi(id);
    setActionLoading(false);
    setDeleteConfirmId(null);

    if (res.success) {
      showSuccess("Placement Deleted", `${name} removed from registry.`);
      loadPlacements();
    } else {
      setPlacements((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      showSuccess("Placement Removed", `${name} removed.`);
    }
  };

  // Classification helper: Is this a Google AdSense placement?
  const isGooglePlacement = (p: any) => {
    return Boolean(p.googleSlotId || p.networkProvider === "GOOGLE_ADSENSE" || (p.placementId || "").includes("PRODUCT_DETAIL_") || (p.placementId || "").includes("GLOBAL_MOBILE") || (p.placementId || "").includes("SKYSCRAPER") || (p.placementId || "").includes("CATEGORY_DESKTOP_SIDEBAR"));
  };

  // Classification helper: Is this an Omeetso Direct / Boost placement?
  const isOmeetsoPlacement = (p: any) => {
    return !p.googleSlotId && (p.networkProvider === "DIRECT_ADVERTISER" || p.networkProvider === "HYBRID" || !p.networkProvider || (p.campaignTypes || []).includes("LISTING_BOOST") || (p.placementId || "").includes("HOMEPAGE_HERO") || (p.placementId || "").includes("CATEGORY_HEADER") || (p.placementId || "").includes("SEARCH_TOP") || (p.placementId || "").includes("STORE_BANNER") || (p.placementId || "").includes("JOBS_HEADER"));
  };

  // Categorized Placements Counts
  const googlePlacementsList = useMemo(() => placements.filter(isGooglePlacement), [placements]);
  const omeetsoPlacementsList = useMemo(() => placements.filter(isOmeetsoPlacement), [placements]);

  const googleShowingCount = googlePlacementsList.filter((p) => p.active !== false).length;
  const googleHiddenCount = googlePlacementsList.filter((p) => p.active === false).length;
  const omeetsoActiveCount = omeetsoPlacementsList.filter((p) => p.active !== false).length;
  const totalBookedAds = omeetsoPlacementsList.reduce((acc, p) => acc + (p.bookedSlotsCount || 0), 0);
  const totalSlotsCapacity = placements.reduce((acc, p) => acc + (p.maximumActiveSlots || 0), 0);

  // Filtered List based on Active Category Tab + Surface / Format Filters
  const filteredPlacements = useMemo(() => {
    let list: any[] = [];
    if (activeCategoryTab === "GOOGLE") {
      list = googlePlacementsList;
      if (googleVisibilityFilter === "SHOW_ONLY") {
        list = list.filter((p) => p.active !== false);
      } else if (googleVisibilityFilter === "HIDE_ONLY") {
        list = list.filter((p) => p.active === false);
      }
    } else if (activeCategoryTab === "OMEETSO") {
      list = omeetsoPlacementsList;
    } else {
      list = placements;
    }

    // Apply surface filter
    if (surfaceFilter !== "ALL") {
      if (surfaceFilter === "HOMEPAGE") {
        list = list.filter((p) => p.placementId.includes("HOME"));
      } else if (surfaceFilter === "PRODUCT_DETAILS") {
        list = list.filter((p) => p.placementId.includes("PRODUCT"));
      } else if (surfaceFilter === "CATEGORY") {
        list = list.filter((p) => p.placementId.includes("CATEGORY"));
      } else if (surfaceFilter === "SEARCH") {
        list = list.filter((p) => p.placementId.includes("SEARCH"));
      } else if (surfaceFilter === "STORES_JOBS") {
        list = list.filter((p) => p.placementId.includes("STORE") || p.placementId.includes("JOB"));
      } else if (surfaceFilter === "GLOBAL_MOBILE") {
        list = list.filter((p) => p.placementId.includes("MOBILE") || p.placementId.includes("GLOBAL") || (p.device || "").toLowerCase().includes("mobile"));
      }
    }

    // Apply format filter in ALL or Omeetso tab
    if (formatFilter !== "ALL") {
      if (formatFilter === "GOOGLE_ADSENSE") list = list.filter(isGooglePlacement);
      if (formatFilter === "BANNER_AD") list = list.filter((p) => p.campaignTypes?.includes("BANNER_AD"));
      if (formatFilter === "LISTING_BOOST") list = list.filter((p) => p.campaignTypes?.includes("LISTING_BOOST"));
      if (formatFilter === "HAS_PLANS") list = list.filter((p) => (p.pricingPlans || []).length > 0);
      if (formatFilter === "OCCUPIED") list = list.filter((p) => (p.bookedSlotsCount || 0) > 0);
      if (formatFilter === "AVAILABLE") list = list.filter((p) => (p.bookedSlotsCount || 0) < (p.maximumActiveSlots || 5));
    }

    return list;
  }, [placements, activeCategoryTab, googlePlacementsList, omeetsoPlacementsList, surfaceFilter, formatFilter, googleVisibilityFilter]);

  // Helper to get site URL for a route
  const getLiveUrl = (route?: string, placementId?: string) => {
    const base = getFrontendBaseUrl();
    if (placementId?.includes("PRODUCT") || route?.includes("product")) {
      return `${base}/product/6ab7681c7576cca06aea03ee`;
    }
    if (!route || route === "/") return base;
    if (route.includes(":id") || route.includes("/all") || route.includes("category")) return `${base}/category/electronics`;
    if (route.includes("results") || route.includes("search")) return `${base}/results`;
    if (route.includes("store")) return `${base}/stores`;
    if (route.includes("job")) return `${base}/jobs`;
    return `${base}${route}`;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Ad Placements Management"
        description="Independently control Google AdSense programmatic ad units with 1-click Show / Don't Show switches, and manage Omeetso marketplace advertiser banner placements & priority boosts."
        badge={`${placements.length} Total Surfaces Registered`}
        badgeColor="indigo"
        primaryAction={
          <div className="flex items-center gap-2">
            {activeCategoryTab === "OMEETSO" && (
              <a
                href="/admin/promotions/packages"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pricing Packages</span>
              </a>
            )}
            <button
              onClick={openCreateModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs text-white ${
                activeCategoryTab === "GOOGLE" ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{activeCategoryTab === "GOOGLE" ? "Add Google Ad Slot" : activeCategoryTab === "OMEETSO" ? "Add Omeetso Placement" : "Add Placement Slot"}</span>
            </button>
          </div>
        }
        secondaryActions={
          <button
            onClick={loadPlacements}
            className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-xs"
            title="Refresh placements"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {/* 🚀 PRIMARY TAB SELECTOR: Clean Separation Between Google Ads & Omeetso Ads */}
      <div className="mb-6 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 inline-flex flex-wrap gap-1.5 w-full sm:w-auto shadow-inner">
        <button
          type="button"
          onClick={() => {
            setActiveCategoryTab("GOOGLE");
            navigate("/admin/ads/placements/google");
          }}
          className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeCategoryTab === "GOOGLE"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Google Ads Placements</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              activeCategoryTab === "GOOGLE" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {googlePlacementsList.length} Units
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              googleAdsEnabled
                ? activeCategoryTab === "GOOGLE" ? "bg-emerald-400 text-slate-950" : "bg-emerald-100 text-emerald-800"
                : activeCategoryTab === "GOOGLE" ? "bg-rose-400 text-slate-950" : "bg-rose-100 text-rose-800"
            }`}
          >
            {googleAdsEnabled ? "ON" : "OFF"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveCategoryTab("OMEETSO");
            navigate("/admin/ads/placements/omeetso");
          }}
          className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeCategoryTab === "OMEETSO"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Omeetso Ads Placements</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              activeCategoryTab === "OMEETSO" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {omeetsoPlacementsList.length} Surfaces
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveCategoryTab("ALL");
            navigate("/admin/ads/placements");
          }}
          className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeCategoryTab === "ALL"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Placements (Overview)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              activeCategoryTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {placements.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🌐 SECTION 1: GOOGLE ADS PLACEMENTS VIEW                                   */}
      {/* ========================================================================= */}
      {activeCategoryTab === "GOOGLE" && (
        <div className="space-y-6">
          {/* Master Google AdSense Control Card with Global ON/OFF Switch */}
          <div className="p-5.5 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-lg border border-blue-700/40 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-13 w-13 rounded-2xl bg-blue-500/20 border border-blue-400/40 grid place-items-center shrink-0 text-blue-400 shadow-inner">
                  <Globe className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-white">Google AdSense Network Control</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-xs flex items-center gap-1 ${
                        googleAdsEnabled
                          ? "bg-emerald-500 text-white"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {googleAdsEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {googleAdsEnabled ? "LIVE & SHOWING" : "DISABLED & HIDDEN"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {googleShowingCount} of {googlePlacementsList.length} Units Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Centrally manage Google AdSense display units across Product Details, Search Rails, and Category Pages. Use the master switch below to show or completely hide all Google ads platform-wide.
                  </p>
                </div>
              </div>

              {/* Master ON / OFF Control Button (Show / Don't Show) */}
              <div className="flex items-center gap-3 flex-wrap shrink-0 bg-white/5 border border-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">Google Ads Visibility</div>
                  <div className="text-[10px] text-slate-300">
                    {googleAdsEnabled ? "Showing to visitors" : "Hidden from visitors"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleGoogleAdsMaster}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 ${
                    googleAdsEnabled
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50"
                      : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 ring-2 ring-rose-400/50"
                  }`}
                  title={googleAdsEnabled ? "Click to turn off and hide all Google Ads" : "Click to turn on and show Google Ads"}
                >
                  {googleAdsEnabled ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>SHOW GOOGLE ADS (ON)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>DON'T SHOW GOOGLE ADS (OFF)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Global Settings Grid */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-2xl">
                <span className="text-slate-400 font-bold shrink-0">Publisher ID:</span>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="bg-transparent border-none text-white font-mono font-bold focus:outline-hidden w-full text-xs"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
                <button
                  onClick={handleSaveGoogleSettings}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                >
                  Save
                </button>
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-2xl">
                <div>
                  <span className="font-bold text-white block">AdSense Sandbox Mode</span>
                  <span className="text-[10px] text-slate-400">
                    {isTestMode ? "Preview Mode (Safe for Dev)" : "Live Production Ads Active"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextMode = !isTestMode;
                    setIsTestMode(nextMode);
                    localStorage.setItem("admin_google_adsense_test_mode", String(nextMode));
                    showSuccess("Mode Toggled", `AdSense sandbox mode is now ${nextMode ? "ENABLED (Preview)" : "DISABLED (Live)"}.`);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${
                    isTestMode ? "bg-amber-500 text-slate-950 font-black" : "bg-emerald-500 text-white"
                  }`}
                >
                  {isTestMode ? "TEST MODE" : "LIVE ADS"}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-2xl gap-2">
                <a
                  href={`${getFrontendBaseUrl()}/product/6ab7681c7576cca06aea03ee`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition-all"
                  title="View Product Detail Page with all active Google ad units"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`${getFrontendBaseUrl()}/ads.txt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
                >
                  <span>View ads.txt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Google Ads Placement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{googlePlacementsList.length}</div>
                <div className="text-xs font-semibold text-slate-500">Google Ad Slots Configured</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">{googleShowingCount}</div>
                <div className="text-xs font-semibold text-slate-500">Slots Set to SHOW</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 grid place-items-center shrink-0">
                <EyeOff className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-rose-600">{googleHiddenCount}</div>
                <div className="text-xs font-semibold text-slate-500">Slots Set to DON'T SHOW</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {googlePlacementsList.filter((p) => p.placementId.includes("PRODUCT")).length}
                </div>
                <div className="text-xs font-semibold text-slate-500">Product Page Units</div>
              </div>
            </div>
          </div>

          {/* Quick Visibility & Surface Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter Slots:</span>
              {[
                { id: "ALL", label: `All Surfaces (${googlePlacementsList.length})` },
                { id: "PRODUCT_DETAILS", label: "📱 Product Details (6)" },
                { id: "SEARCH", label: "🔍 Search Skyscraper" },
                { id: "CATEGORY", label: "📁 Category Sidebar" },
                { id: "GLOBAL_MOBILE", label: "📲 Mobile Anchor" },
                { id: "HOMEPAGE", label: "🏠 Homepage In-Feed" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSurfaceFilter(tab.id as SurfaceFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    surfaceFilter === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Visibility State Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              <button
                onClick={() => setGoogleVisibilityFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  googleVisibilityFilter === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setGoogleVisibilityFilter("SHOW_ONLY")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  googleVisibilityFilter === "SHOW_ONLY" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Showing Only ({googleShowingCount})
              </button>
              <button
                onClick={() => setGoogleVisibilityFilter("HIDE_ONLY")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  googleVisibilityFilter === "HIDE_ONLY" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                Hidden Only ({googleHiddenCount})
              </button>
            </div>
          </div>

          {/* Google Ads Placements Grid */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-[#E2E8F0]">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
              <p className="text-sm font-semibold text-slate-600">Loading Google AdSense slot specifications...</p>
            </div>
          ) : filteredPlacements.length === 0 ? (
            <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-[#E2E8F0] space-y-3">
              <Globe className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-base font-bold text-slate-700">No Google Ad Slots Match the Filter</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No Google AdSense placements match the selected criteria. Try resetting the surface or visibility filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredPlacements.map((p) => {
                const liveUrl = getLiveUrl(p.route, p.placementId);
                const isShowing = p.active !== false;

                return (
                  <div
                    key={p.id || p._id || p.placementId}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isShowing
                        ? "border-blue-200 hover:border-blue-300"
                        : "border-slate-300 bg-slate-50/60 opacity-80"
                    }`}
                  >
                    {/* Header */}
                    <div className="p-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-blue-50/40 to-transparent space-y-3.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-900 text-white shadow-2xs">
                            {p.placementId}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            🌐 Google AdSense
                          </span>
                          {p.googleSlotId && (
                            <div className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-0.5 rounded-lg text-[10px] text-blue-900 font-bold shadow-2xs">
                              <span>Slot ID:</span>
                              <span className="font-mono text-blue-700 font-black">{p.googleSlotId}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(p.googleSlotId)}
                                className="text-blue-500 hover:text-blue-700 ml-0.5"
                                title="Copy Google Slot ID"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* ON / OFF BUTTON (SHOW / DON'T SHOW) */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleGoogleSlotShow(p)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 ${
                              isShowing
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40"
                                : "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40"
                            }`}
                            title={isShowing ? "Click to set this slot to DON'T SHOW" : "Click to set this slot to SHOW"}
                          >
                            {isShowing ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>SHOW (ON)</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>DON'T SHOW (OFF)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Surface & Route Information */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="flex items-center gap-1 font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                          <Layout className="w-3 h-3 text-blue-600" /> Page: {p.page || "Product Detail Page"}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          <Globe className="w-3 h-3 text-slate-400" /> {p.route || "/"}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                          <Smartphone className="w-3 h-3 text-slate-400" /> {p.device || "Web & Mobile App"}
                        </span>
                        {p.adFormat && (
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg text-[11px] border border-indigo-100 uppercase">
                            Format: {p.adFormat}
                          </span>
                        )}
                      </div>

                      {/* Title & Position Description */}
                      <div>
                        <h3 className="text-base font-black text-slate-900">{p.name}</h3>
                        <div className="text-xs font-semibold text-blue-700 mt-0.5">
                          📌 In-Page Position: {p.position || "In-Page Contextual Slot"}
                        </div>
                        {p.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Google Ad Spec Details & Status Footer */}
                    <div className="p-5 pt-4 space-y-3.5 bg-white">
                      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Dimensions:</span>
                          <span className="font-bold text-slate-900">{p.minimumWidth}×{p.minimumHeight}px</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold">Ratio:</span>
                          <span className="font-bold text-slate-900">{p.aspectRatio}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isShowing ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                            }`}
                          />
                          <span className={`text-[11px] font-bold ${isShowing ? "text-emerald-700" : "text-rose-700"}`}>
                            {isShowing ? "Live on Website" : "Hidden from Users"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                            title="Preview slot live on frontend"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                            <span>Preview Live</span>
                          </a>

                          <button
                            onClick={() => openEditModal(p)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Specs</span>
                          </button>
                        </div>

                        <div>
                          {deleteConfirmId === (p.id || p._id) ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeletePlacement(p.id || p._id, p.name)}
                                className="px-2.5 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(p.id || p._id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center justify-center"
                              title="Delete slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 SECTION 2: OMEETSO ADS PLACEMENTS VIEW                                 */}
      {/* ========================================================================= */}
      {activeCategoryTab === "OMEETSO" && (
        <div className="space-y-6">
          {/* Omeetso Marketplace Ads Workspace Banner */}
          <div className="p-5.5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-700/30 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-13 w-13 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 grid place-items-center shrink-0 text-indigo-400 shadow-inner">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-white">Omeetso Marketplace Direct Ads & Boosts</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500 text-white shadow-xs">
                      Self-Serve Monetization
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {totalBookedAds} Live Paid Campaigns
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Direct advertiser surfaces, homepage hero sliders, category headers, and search priority boost cards purchased by marketplace sellers through pricing packages.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <a
                  href="/admin/promotions/packages"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Manage Pricing Plans</span>
                </a>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Direct Surface</span>
                </button>
              </div>
            </div>
          </div>

          {/* Omeetso Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{omeetsoPlacementsList.length}</div>
                <div className="text-xs font-semibold text-slate-500">Marketplace Ad Surfaces</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{totalBookedAds}</div>
                <div className="text-xs font-semibold text-slate-500">Paid Active Campaigns</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">15 Plans</div>
                <div className="text-xs font-semibold text-slate-500">Connected Pricing Packages</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
                <Maximize2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {omeetsoPlacementsList.reduce((acc, p) => acc + (p.maximumActiveSlots || 5), 0)}
                </div>
                <div className="text-xs font-semibold text-slate-500">Total Rotation Slots</div>
              </div>
            </div>
          </div>

          {/* Omeetso Surface Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E2E8F0]">
            {[
              { id: "ALL", label: `All Surfaces (${omeetsoPlacementsList.length})` },
              { id: "HOMEPAGE", label: "🏠 Homepage Banners" },
              { id: "CATEGORY", label: "📁 Category Page Header" },
              { id: "SEARCH", label: "🔍 Search Results Priority" },
              { id: "STORES_JOBS", label: "🏬 Stores & Jobs Portal" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSurfaceFilter(tab.id as SurfaceFilter)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  surfaceFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Omeetso Placements Grid */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-[#E2E8F0]">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
              <p className="text-sm font-semibold text-slate-600">Loading marketplace placements...</p>
            </div>
          ) : filteredPlacements.length === 0 ? (
            <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-[#E2E8F0] space-y-3">
              <Target className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-base font-bold text-slate-700">No Omeetso Placements Found</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No marketplace ad surfaces match the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPlacements.map((p) => {
                const booked = p.bookedSlotsCount || 0;
                const maxSlots = p.maximumActiveSlots || 5;
                const occupancyPct = Math.min(100, Math.round((booked / maxSlots) * 100));
                const isBanner = p.campaignTypes?.includes("BANNER_AD");
                const bookedCampaigns = Array.isArray(p.bookedCampaigns) ? p.bookedCampaigns : [];
                const pricingPlans = Array.isArray(p.pricingPlans) ? p.pricingPlans : [];
                const liveUrl = getLiveUrl(p.route, p.placementId);

                return (
                  <div
                    key={p.id || p._id || p.placementId}
                    className={`bg-white rounded-3xl border ${
                      p.active !== false ? "border-[#E2E8F0]" : "border-slate-300 opacity-75 bg-slate-50/50"
                    } shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between`}
                  >
                    {/* Header */}
                    <div className="p-5 pb-4 space-y-3.5 border-b border-slate-100 bg-slate-50/40">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
                            {p.placementId}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              isBanner
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            }`}
                          >
                            {isBanner ? "🎨 Banner" : "⚡ Sponsored Card"}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Direct Advertiser
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleToggleOmeetsoSlotActive(p)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all shadow-2xs ${
                              p.active !== false
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-slate-300 hover:bg-slate-400 text-slate-700"
                            }`}
                            title={p.active !== false ? "Click to Pause Slot" : "Click to Activate Slot"}
                          >
                            <Power className="w-3 h-3" />
                            <span>{p.active !== false ? "ACTIVE" : "PAUSED"}</span>
                          </button>

                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Live</span>
                          </a>

                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs transition-colors shadow-2xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {deleteConfirmId === (p.id || p._id) ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeletePlacement(p.id || p._id, p.name)}
                                className="px-2.5 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(p.id || p._id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Location & Page */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                          <Layout className="w-3 h-3" /> Page: {p.page || "Homepage"}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          <Globe className="w-3 h-3 text-slate-400" /> {p.route || "/"}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                          <Smartphone className="w-3 h-3 text-slate-400" /> {p.device || "Web & Mobile App"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900">{p.name}</h3>
                        <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                          📌 Position: {p.position || "Standard Surface Placement"}
                        </div>
                        {p.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold">
                            <Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Ratio: <strong>{p.aspectRatio}</strong>
                          </span>
                          <span>·</span>
                          <span>Min: <strong>{p.minimumWidth}×{p.minimumHeight}px</strong></span>
                          <span>·</span>
                          <span>Max File: <strong>{Math.round((p.maximumFileSizeBytes || 2097152) / (1024 * 1024))} MB</strong></span>
                        </div>
                      </div>

                      {/* Pricing Rates */}
                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white grid place-items-center shrink-0">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900">
                              Starting From <span className="text-emerald-700">₹{p.startingPrice || 199}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Daily Rate: ₹{p.baseDailyRate || 299}/day · CPM: ₹{p.baseCPM || 100}/1k views
                            </div>
                          </div>
                        </div>

                        <a
                          href="/admin/promotions/packages"
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200"
                        >
                          <span>{pricingPlans.length} Pricing Packages</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Booked Ads Occupancy */}
                    <div className="p-5 pt-4 space-y-3.5 bg-white">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                          <span className="text-slate-700">Slot Occupancy (Max Rotation: {maxSlots})</span>
                          <span className={booked >= maxSlots ? "text-rose-600 font-black" : "text-emerald-600"}>
                            {booked} / {maxSlots} Active Slots ({occupancyPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupancyPct >= 100 ? "bg-rose-500" : occupancyPct >= 60 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${occupancyPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Booked Campaigns List */}
                      {bookedCampaigns.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {bookedCampaigns.map((ad: any) => (
                            <div
                              key={ad.campaignId}
                              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{ad.listingTitle}</div>
                                <div className="text-[10px] text-slate-500 truncate">{ad.advertiserName} · {ad.city}</div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                {ad.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📑 SECTION 3: ALL PLACEMENTS (COMBINED OVERVIEW)                           */}
      {/* ========================================================================= */}
      {activeCategoryTab === "ALL" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{placements.length}</div>
                <div className="text-xs font-semibold text-slate-500">Total Placement Surfaces</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-blue-600">{googlePlacementsList.length}</div>
                <div className="text-xs font-semibold text-slate-500">Google AdSense Slots</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">{omeetsoPlacementsList.length}</div>
                <div className="text-xs font-semibold text-slate-500">Omeetso Marketplace Slots</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
                <Maximize2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{totalSlotsCapacity}</div>
                <div className="text-xs font-semibold text-slate-500">Max Rotation Capacity</div>
              </div>
            </div>
          </div>

          {/* Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Format Filter:</span>
            {[
              { id: "ALL", label: "All Formats" },
              { id: "GOOGLE_ADSENSE", label: `🌐 Google AdSense (${googlePlacementsList.length})` },
              { id: "BANNER_AD", label: "🎨 Banners & Billboards" },
              { id: "LISTING_BOOST", label: "⚡ Sponsored Cards & Boosts" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormatFilter(f.id as FormatFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  formatFilter === f.id
                    ? "bg-indigo-600 text-white font-bold shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Combined Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPlacements.map((p) => {
              const isGoogle = isGooglePlacement(p);
              const isShowing = p.active !== false;

              return (
                <div
                  key={p.id || p._id || p.placementId}
                  className={`bg-white rounded-3xl border ${
                    isShowing ? "border-[#E2E8F0]" : "border-slate-300 opacity-75 bg-slate-50/50"
                  } shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between`}
                >
                  <div className="p-5 pb-4 space-y-3 border-b border-slate-100 bg-slate-50/40">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                          {p.placementId}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            isGoogle
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {isGoogle ? "🌐 Google AdSense" : "🎯 Omeetso Direct"}
                        </span>
                      </div>

                      {/* Quick Toggle */}
                      {isGoogle ? (
                        <button
                          type="button"
                          onClick={() => handleToggleGoogleSlotShow(p)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all shadow-xs ${
                            isShowing
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-rose-600 hover:bg-rose-700 text-white"
                          }`}
                        >
                          {isShowing ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{isShowing ? "SHOW" : "DON'T SHOW"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleOmeetsoSlotActive(p)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                            isShowing
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-slate-300 hover:bg-slate-400 text-slate-700"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isShowing ? "ACTIVE" : "PAUSED"}</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">{p.name}</h3>
                      <div className="text-xs font-semibold text-slate-500 mt-0.5">
                        {p.page} · {p.route}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{p.minimumWidth}×{p.minimumHeight}px ({p.aspectRatio})</span>
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ➕ CREATE PLACEMENT MODAL                                                  */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {networkProvider === "GOOGLE_ADSENSE" ? "Add Google AdSense Slot" : "Add Omeetso Placement"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure slot identifier, provider network, page location, and initial display status.
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlacement} className="space-y-4 text-xs">
              {/* Network Provider Selector */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1.5">Network Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNetworkProvider("GOOGLE_ADSENSE")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold border transition-all ${
                      networkProvider === "GOOGLE_ADSENSE"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Google AdSense</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkProvider("DIRECT_ADVERTISER")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold border transition-all ${
                      networkProvider === "DIRECT_ADVERTISER"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Omeetso Direct</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Placement Code ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRODUCT_DETAIL_NEW_BANNER"
                  value={placementId}
                  onChange={(e) => setPlacementId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden focus:border-indigo-600 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Product Detail - Sidebar Partner Ad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              {networkProvider === "GOOGLE_ADSENSE" && (
                <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google AdSense Slot Configuration</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-blue-950 mb-1">Google Slot ID *</label>
                      <input
                        type="text"
                        required
                        value={googleSlotId}
                        onChange={(e) => setGoogleSlotId(e.target.value)}
                        placeholder="e.g. 4455667795"
                        className="w-full px-2.5 py-2 rounded-xl border border-blue-200 font-mono font-bold bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-blue-950 mb-1">Ad Format</label>
                      <select
                        value={adFormat}
                        onChange={(e) => setAdFormat(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-blue-200 font-bold bg-white text-xs"
                      >
                        <option value="horizontal">Horizontal (728×90)</option>
                        <option value="rectangle">Medium Rectangle (300×250)</option>
                        <option value="vertical">Skyscraper (300×600)</option>
                        <option value="in-feed">In-Feed Native Card</option>
                        <option value="auto">Auto Responsive</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Page Surface</label>
                  <select
                    value={pageLocation}
                    onChange={(e) => setPageLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="Product Details">Product Details</option>
                    <option value="Homepage">Homepage</option>
                    <option value="Category Browse">Category Browse</option>
                    <option value="Search Results">Search Results</option>
                    <option value="Stores Directory & Showrooms">Stores Directory</option>
                    <option value="Jobs Portal">Jobs Portal</option>
                    <option value="Universal Mobile Screens">Universal Mobile</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Path</label>
                  <input
                    type="text"
                    value={routePath}
                    onChange={(e) => setRoutePath(e.target.value)}
                    placeholder="e.g. /product/:id"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">In-Page Position</label>
                <input
                  type="text"
                  value={positionDesc}
                  onChange={(e) => setPositionDesc(e.target.value)}
                  placeholder="e.g. Below Product Specifications"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aspect Ratio</label>
                  <input
                    type="text"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    placeholder="3:1, 1:1, 16:9"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Width (px)</label>
                  <input
                    type="number"
                    value={minimumWidth}
                    onChange={(e) => setMinimumWidth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Height (px)</label>
                  <input
                    type="number"
                    value={minimumHeight}
                    onChange={(e) => setMinimumHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Initial Display State: SHOW vs DON'T SHOW */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Initial Display Status</span>
                  <span className="text-[10px] text-slate-500">
                    {createActiveShow ? "Slot will be visible immediately on site" : "Slot will be hidden initially"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateActiveShow(!createActiveShow)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    createActiveShow ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                  }`}
                >
                  {createActiveShow ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{createActiveShow ? "SHOW" : "DON'T SHOW"}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
                >
                  {actionLoading ? "Creating..." : "Save Placement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ EDIT PLACEMENT MODAL                                                    */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Placement Slot Specs</h3>
                <p className="text-xs text-slate-500 font-mono">{editPlacementId}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlacement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              {/* Show / Don't Show Toggle Button */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Display on Website & App</span>
                  <span className="text-[10px] text-slate-500">
                    {editActive ? "Currently set to SHOW (Active & visible to visitors)" : "Currently set to DON'T SHOW (Hidden from visitors)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    editActive ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                  }`}
                >
                  {editActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{editActive ? "SHOW" : "DON'T SHOW"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Page Surface</label>
                  <input
                    type="text"
                    value={editPageLocation}
                    onChange={(e) => setEditPageLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Path</label>
                  <input
                    type="text"
                    value={editRoutePath}
                    onChange={(e) => setEditRoutePath(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Position on Page</label>
                <input
                  type="text"
                  value={editPositionDesc}
                  onChange={(e) => setEditPositionDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              {/* Google Ad Network Settings */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Ad Network & Partner Settings</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-blue-950 mb-1">Provider Mode</label>
                    <select
                      value={editNetworkProvider}
                      onChange={(e) => setEditNetworkProvider(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl border border-blue-200 font-bold bg-white text-xs"
                    >
                      <option value="GOOGLE_ADSENSE">Google AdSense</option>
                      <option value="DIRECT_ADVERTISER">Direct Advertiser</option>
                      <option value="HYBRID">Hybrid (Direct + Fallback)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-blue-950 mb-1">Google Slot ID</label>
                    <input
                      type="text"
                      value={editGoogleSlotId}
                      onChange={(e) => setEditGoogleSlotId(e.target.value)}
                      placeholder="e.g. 4455667795"
                      className="w-full px-2.5 py-2 rounded-xl border border-blue-200 font-mono font-bold bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-blue-950 mb-1">Ad Format</label>
                    <select
                      value={editAdFormat}
                      onChange={(e) => setEditAdFormat(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-blue-200 font-bold bg-white text-xs"
                    >
                      <option value="horizontal">Horizontal (728×90)</option>
                      <option value="rectangle">Medium Rectangle (300×250)</option>
                      <option value="vertical">Skyscraper (300×600)</option>
                      <option value="in-feed">In-Feed Native Card</option>
                      <option value="auto">Auto Responsive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aspect Ratio</label>
                  <input
                    type="text"
                    value={editAspectRatio}
                    onChange={(e) => setEditAspectRatio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Width</label>
                  <input
                    type="number"
                    value={editMinimumWidth}
                    onChange={(e) => setEditMinimumWidth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Height</label>
                  <input
                    type="number"
                    value={editMinimumHeight}
                    onChange={(e) => setEditMinimumHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
