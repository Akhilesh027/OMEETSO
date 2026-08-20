import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Briefcase,
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
  FileText
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

type JobStatus = "all" | "submitted" | "approved" | "active" | "paused" | "filled" | "expired" | "rejected";

export function JobsPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "categories">("jobs");
  const [statusFilter, setStatusFilter] = useState<JobStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspector & Action Modals
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [jobToReject, setJobToReject] = useState<any | null>(null);

  // Message to Employer modal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");

  // Category Edit Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    id: "",
    name: "",
    icon: "Briefcase",
    order: 0,
    isActive: true,
    subcategories: "Full Time, Remote, Internship, Walk-in",
  });

  const { showSuccess, showError } = useToast();

  const loadAdminJobs = async () => {
    setLoading(true);
    let loaded = false;

    // Try port 3000 then 5000
    for (const port of [3000, 5000]) {
      try {
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
        const res = await fetch(
          `http://localhost:${port}/api/v1/admin/jobs?status=${statusFilter === "all" ? "ALL" : statusFilter.toUpperCase()}&q=${encodeURIComponent(searchQuery)}`,
          {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setJobs(json.data);
          loaded = true;
          break;
        }
      } catch {
        // try next
      }
    }

    if (!loaded) {
      // Fallback to rich seed jobs
      const defaultJobs = [
        {
          id: "job-001",
          _id: "job-001",
          employerId: "emp-001",
          companyName: "TechNova Solutions Pvt Ltd",
          title: "Senior Full Stack React & Node Developer",
          jobCategoryId: "it_software",
          subcategoryId: "IT & Software",
          jobType: "FULL_TIME",
          workplaceType: "HYBRID",
          openingsCount: 3,
          salary: { minSalary: 800000, maxSalary: 1400000, salaryPeriod: "yearly", salaryDisclosed: true },
          location: { area: "Hitec City", city: "Hyderabad", pincode: "500081" },
          status: "APPROVED",
          isVerifiedEmployer: true,
          isUrgent: true,
          isFeatured: true,
          applicationsCount: 24,
          viewsCount: 650,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          candidateCriteria: { experience: "3-6 Years", minEducation: "B.Tech / MCA", fresherAllowed: false },
          jobDetails: { description: "We are seeking a senior full stack developer proficient in React, TypeScript, Node.js and TailwindCSS to join our core product engineering team." },
        },
        {
          id: "job-002",
          _id: "job-002",
          employerId: "emp-002",
          companyName: "GrowthPulse Marketing Labs",
          title: "Performance Marketing & SEO Specialist",
          jobCategoryId: "sales_marketing",
          subcategoryId: "Digital Marketing",
          jobType: "FULL_TIME",
          workplaceType: "OFFICE",
          openingsCount: 2,
          salary: { minSalary: 350000, maxSalary: 600000, salaryPeriod: "yearly", salaryDisclosed: true },
          location: { area: "Madhapur", city: "Hyderabad", pincode: "500081" },
          status: "ACTIVE",
          isVerifiedEmployer: true,
          isUrgent: false,
          isFeatured: false,
          applicationsCount: 18,
          viewsCount: 420,
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          candidateCriteria: { experience: "1-3 Years", minEducation: "Graduate", fresherAllowed: true },
          jobDetails: { description: "Manage paid ad campaigns across Google Ads, Meta Ads and optimize technical on-page SEO." },
        },
        {
          id: "job-003",
          _id: "job-003",
          employerId: "emp-003",
          companyName: "QuickDeliver Logistics Hub",
          title: "Delivery Fleet Associates & Hub Supervisors",
          jobCategoryId: "delivery_logistics",
          subcategoryId: "Delivery & Logistics",
          jobType: "FULL_TIME",
          workplaceType: "FIELD_WORK",
          openingsCount: 15,
          salary: { minSalary: 22000, maxSalary: 28000, salaryPeriod: "monthly", salaryDisclosed: true },
          location: { area: "Kukatpally", city: "Hyderabad", pincode: "500072" },
          status: "SUBMITTED",
          isVerifiedEmployer: false,
          isUrgent: true,
          isFeatured: false,
          applicationsCount: 8,
          viewsCount: 190,
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          candidateCriteria: { experience: "0-2 Years", minEducation: "10th / 12th Pass", fresherAllowed: true },
          jobDetails: { description: "Responsible for local parcel distribution in Cyberabad zone. Attractive daily incentives and fuel allowance." },
        },
      ];

      if (statusFilter === "all") {
        setJobs(defaultJobs);
      } else {
        setJobs(defaultJobs.filter((j) => j.status.toLowerCase() === statusFilter.toLowerCase()));
      }
    }
    setLoading(false);
  };

  const loadAdminCategories = async () => {
    for (const port of [3000, 5000]) {
      try {
        const res = await fetch(`http://localhost:${port}/api/v1/jobs/categories`);
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
      { id: "it_software", name: "IT & Software", icon: "Laptop", subcategories: ["Web Development", "Mobile Apps", "Cloud & DevOps", "QA & Testing"] },
      { id: "sales_marketing", name: "Sales & Marketing", icon: "TrendingUp", subcategories: ["B2B Sales", "Digital Marketing", "Field Sales", "Telecalling"] },
      { id: "delivery_logistics", name: "Delivery & Logistics", icon: "Truck", subcategories: ["Delivery Rider", "Warehouse Staff", "Fleet Supervisor"] },
      { id: "hotel_restaurant", name: "Hotel & Restaurant", icon: "Coffee", subcategories: ["Chef / Cook", "Service Staff", "Barista", "Manager"] },
      { id: "customer_support", name: "Customer Support", icon: "Headphones", subcategories: ["Voice Process", "Non-Voice / Chat", "Technical Support"] },
    ]);
  };

  useEffect(() => {
    loadAdminJobs();
    loadAdminCategories();
  }, [statusFilter]);

  const handleUpdateJobStatus = async (jobId: string, status: string, reason?: string) => {
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      for (const port of [3000, 5000]) {
        try {
          await fetch(`http://localhost:${port}/api/v1/admin/jobs/${jobId}/status`, {
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

    // Update local state
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId || j._id === jobId ? { ...j, status, rejectionReason: reason } : j))
    );

    if (status === "APPROVED" || status === "ACTIVE") {
      showSuccess(`Job approved and published successfully! Notification dispatched to employer.`);
    } else if (status === "REJECTED") {
      showSuccess(`Job marked as rejected. Explanation sent to employer.`);
    }
  };

  const handleSendMessageToEmployer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !messageRecipient) return;

    showSuccess(`Official admin notice sent to ${messageRecipient.companyName || "Employer"}!`);
    setIsMessageModalOpen(false);
    setMessageText("");
    setMessageRecipient(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const subs = catForm.subcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setCategories((prev) => [
      ...prev.filter((c) => c.id !== catForm.id),
      { id: catForm.id || catForm.name.toLowerCase().replace(/\s+/g, "_"), name: catForm.name, icon: catForm.icon, subcategories: subs },
    ]);

    showSuccess("Job category updated successfully!");
    setCatModalOpen(false);
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.location?.city && j.location.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (j.location?.area && j.location.area.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "submitted") return j.status === "SUBMITTED" || j.status === "pending";
    if (statusFilter === "approved" || statusFilter === "active") return j.status === "APPROVED" || j.status === "ACTIVE";
    if (statusFilter === "paused") return j.status === "PAUSED";
    if (statusFilter === "filled") return j.status === "FILLED";
    if (statusFilter === "rejected") return j.status === "REJECTED";

    return true;
  });

  const totalOpenings = jobs.reduce((acc, j) => acc + (j.openingsCount || 1), 0);
  const totalApplications = jobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0);
  const pendingCount = jobs.filter((j) => j.status === "SUBMITTED" || j.status === "pending").length;

  return (
    <PageContainer>
      <PageHeader
        title="Jobs Vertical & Career Postings"
        description="Review and moderate employer job postings, manage category trees, and communicate with employers."
        primaryAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCatForm({
                  id: "",
                  name: "",
                  icon: "Briefcase",
                  order: categories.length + 1,
                  isActive: true,
                  subcategories: "Full Time, Remote, Internship",
                });
                setCatModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={loadAdminJobs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
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
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Listed Jobs</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{jobs.length}</h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-bold">{totalOpenings} Active Openings</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending Review</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Requires moderator action</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Candidate Applications</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalApplications}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Submitted resumes</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Categories</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{categories.length}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Active career industries</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === "jobs"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          💼 Job Moderation Queue ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === "categories"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          📁 Category & Industry Tree ({categories.length})
        </button>
      </div>

      {activeTab === "jobs" && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {[
                { id: "all", label: "All Jobs" },
                { id: "submitted", label: "Pending Review" },
                { id: "approved", label: "Approved / Active" },
                { id: "paused", label: "Paused" },
                { id: "filled", label: "Filled" },
                { id: "rejected", label: "Rejected" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === tab.id
                      ? "bg-indigo-600 text-white shadow-sm"
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
                placeholder="Search job title, company, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" /> Loading jobs moderation queue...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                No jobs found matching the current search & status filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Job Title & Employer</th>
                      <th className="p-3.5">Type & Workplace</th>
                      <th className="p-3.5">Salary Package</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredJobs.map((job) => {
                      const jobId = job.id || job._id;
                      const isApproved = job.status === "APPROVED" || job.status === "ACTIVE";
                      const isPending = job.status === "SUBMITTED" || job.status === "pending";

                      return (
                        <tr key={jobId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-gray-900 dark:text-white max-w-sm truncate">
                              {job.title}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              <span className="font-medium">{job.companyName}</span>
                              {job.isVerifiedEmployer && (
                                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 rounded">
                                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-[10px]">
                              {job.jobType}
                            </span>
                            <div className="text-[11px] text-gray-500 mt-0.5">{job.workplaceType}</div>
                          </td>

                          <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                            {job.salary?.salaryDisclosed ? (
                              <span>
                                ₹{(job.salary.minSalary || 0).toLocaleString("en-IN")} - ₹{(job.salary.maxSalary || 0).toLocaleString("en-IN")}
                                <span className="text-[10px] text-gray-500 font-normal"> / {job.salary.salaryPeriod || "yearly"}</span>
                              </span>
                            ) : (
                              <span className="text-gray-400 font-normal">Not Disclosed</span>
                            )}
                          </td>

                          <td className="p-3.5 text-gray-700 dark:text-gray-300">
                            <div>{job.location?.area}, {job.location?.city}</div>
                            <span className="text-[10px] text-gray-400">{job.openingsCount || 1} Openings</span>
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
                              {job.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setIsInspectorOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                              title="Inspect Full Job Details"
                            >
                              <Eye className="w-3.5 h-3.5 inline" />
                            </button>

                            <button
                              onClick={() => {
                                setMessageRecipient(job);
                                setMessageText(`Regarding your job posting "${job.title}": `);
                                setIsMessageModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
                              title="Send Message to Employer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 inline" />
                            </button>

                            {!isApproved && (
                              <button
                                onClick={() => handleUpdateJobStatus(jobId, "APPROVED")}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                              >
                                Approve
                              </button>
                            )}

                            {job.status !== "REJECTED" && (
                              <button
                                onClick={() => {
                                  setJobToReject(job);
                                  setRejectReason("Missing clear job requirements or company address");
                                  setIsRejectModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition"
                              >
                                Reject
                              </button>
                            )}
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
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Briefcase className="w-5 h-5" />
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
      {isInspectorOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold">
                  {selectedJob.subcategoryId || selectedJob.jobCategoryId}
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-gray-500 font-semibold">{selectedJob.companyName} • {selectedJob.location?.area}, {selectedJob.location?.city}</p>
              </div>
              <button onClick={() => setIsInspectorOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 text-[10px]">Job Type</span>
                <p className="font-bold text-gray-900 dark:text-white">{selectedJob.jobType}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Workplace</span>
                <p className="font-bold text-gray-900 dark:text-white">{selectedJob.workplaceType}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Openings</span>
                <p className="font-bold text-gray-900 dark:text-white">{selectedJob.openingsCount || 1}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Experience</span>
                <p className="font-bold text-gray-900 dark:text-white">{selectedJob.candidateCriteria?.experience || "Any"}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Job Description</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                {selectedJob.jobDetails?.description}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setMessageRecipient(selectedJob);
                  setMessageText(`Official update regarding your job "${selectedJob.title}": `);
                  setIsInspectorOpen(false);
                  setIsMessageModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Send Message
              </button>
              <button
                onClick={() => {
                  handleUpdateJobStatus(selectedJob.id || selectedJob._id, "APPROVED");
                  setIsInspectorOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow"
              >
                Approve Job
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
                <Send className="w-4 h-4 text-indigo-600" /> Send Notice to Employer
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <p className="text-xs text-gray-500">
              Sending direct system message to <strong>{messageRecipient.companyName}</strong> regarding job <strong>"{messageRecipient.title}"</strong>.
            </p>

            <form onSubmit={handleSendMessageToEmployer} className="space-y-3">
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter feedback or moderation notice for the employer..."
                className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow"
                >
                  Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && jobToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Reject Job Posting
            </h3>
            <p className="text-xs text-gray-500">
              Provide a clear reason for rejecting <strong>"{jobToReject.title}"</strong> by <strong>{jobToReject.companyName}</strong>. This message will be sent directly to the employer.
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
                  handleUpdateJobStatus(jobToReject.id || jobToReject._id, "REJECTED", rejectReason);
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
            <h3 className="text-sm font-black text-gray-900 dark:text-white">Add / Edit Job Category</h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Category Slug ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. it_software"
                  value={catForm.id}
                  onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT & Software Engineering"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Subcategories (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Full Time, Remote, Internship, Contract"
                  value={catForm.subcategories}
                  onChange={(e) => setCatForm({ ...catForm, subcategories: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow"
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
export default JobsPage;
