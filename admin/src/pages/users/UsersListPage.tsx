import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDataService } from "@/services/mockDataService";
import type { PlatformUser } from "@/types";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Building2,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function UsersListPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "buyer" | "seller" | "business" | "suspended" | "banned">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<PlatformUser>>({});
  const [statusReason, setStatusReason] = useState("");
  const [targetStatus, setTargetStatus] = useState<PlatformUser["status"]>("temporarily_suspended");

  const { showSuccess } = useToast();

  const loadUsers = async () => {
    try {
      const res = await fetch("https://api.omeetso.in/api/v1/users/admin/all");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
        return;
      }
    } catch (err) {
      console.warn("MongoDB users fetch warning:", err);
    }
    setUsers(MockDataService.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile.includes(searchTerm) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.city.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "buyer") return u.accountType === "individual" && u.storesCount === 0;
    if (activeTab === "seller") return u.storesCount > 0 || u.listingsCount > 0;
    if (activeTab === "business") return u.accountType === "business";
    if (activeTab === "suspended") return (u.status as string) === "suspended" || u.status === "temporarily_suspended" || u.status === "under_investigation";
    if (activeTab === "banned") return (u.status as string) === "banned" || u.status === "permanently_suspended";

    return true;
  });

  const handleToggleVerification = (userId: string, field: "verifiedIdentity" | "verifiedMobile" | "verifiedEmail") => {
    const updated = MockDataService.toggleUserVerification(userId, field);
    setUsers(updated);
    showSuccess("Verification Status Updated", `Updated ${field} status for user.`);
  };

  const handleStatusChange = () => {
    if (!selectedUser) return;
    const updated = MockDataService.updateUserStatus(selectedUser.id, targetStatus, statusReason);
    setUsers(updated);
    setIsStatusOpen(false);
    setStatusReason("");
    showSuccess("User Status Updated", `User status changed to ${targetStatus}.`);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddOpen) {
      const updated = MockDataService.addUser(formData);
      setUsers(updated);
      setIsAddOpen(false);
      showSuccess("User Created", "New user account successfully added.");
    } else if (isEditOpen && selectedUser) {
      const updated = MockDataService.updateUser(selectedUser.id, formData);
      setUsers(updated);
      setIsEditOpen(false);
      showSuccess("User Updated", "User details saved successfully.");
    }
    setFormData({});
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user record permanently?")) {
      const updated = MockDataService.deleteUser(userId);
      setUsers(updated);
      showSuccess("User Deleted", "User record permanently removed.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Managed Users & Sellers Directory"
        description="Full CRUD directory of buyers, verified seller stores, account status, and identity checks."
        badge={`${users.length} Registered Accounts`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => {
              setFormData({ accountType: "individual", city: "Hyderabad", pincode: "500081" });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User Account</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Users (${users.length})` },
              { id: "buyer", label: "Buyers" },
              { id: "seller", label: "Sellers" },
              { id: "business", label: "Business Accounts" },
              { id: "suspended", label: "Suspended / Flagged" },
              { id: "banned", label: "Banned" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${activeTab === tab.id
                  ? "bg-[#3547D4] text-white shadow-sm"
                  : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, mobile, city..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">User & Contact</th>
                <th className="p-3">Account Type</th>
                <th className="p-3">Location</th>
                <th className="p-3">Verifications</th>
                <th className="p-3">Activity</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No matching users found for current filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#111E4D] text-[#FFB800] flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827]">{u.name}</div>
                          <div className="text-[11px] text-[#64748B]">{u.mobile}</div>
                          {u.email && <div className="text-[10px] text-slate-400">{u.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md font-semibold text-[10px] ${u.accountType === "business"
                          ? "bg-purple-100 text-purple-900"
                          : "bg-blue-50 text-[#2563EB]"
                          }`}
                      >
                        {u.accountType === "business" ? <Building2 className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                        <span className="capitalize">{u.accountType}</span>
                      </span>
                    </td>
                    <td className="p-3 text-[#111827]">
                      <div>{u.city}</div>
                      <div className="text-[10px] text-slate-400">PIN: {u.pincode}</div>
                    </td>
                    <td className="p-3 space-y-1">
                      <button
                        onClick={() => handleToggleVerification(u.id, "verifiedIdentity")}
                        className={`px-2 py-0.5 text-[9px] rounded font-bold transition-colors ${u.verifiedIdentity
                          ? "bg-emerald-100 text-[#16A36A]"
                          : "bg-slate-100 text-slate-400 hover:bg-emerald-50"
                          }`}
                      >
                        ID: {u.verifiedIdentity ? "Verified ✓" : "Unverified"}
                      </button>
                    </td>
                    <td className="p-3 text-[#64748B]">
                      <div>Listings: <span className="font-bold text-[#111827]">{u.listingsCount}</span></div>
                      <div>Stores: <span className="font-bold text-[#111827]">{u.storesCount}</span></div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${u.riskScore > 50
                          ? "bg-red-100 text-[#DC3545]"
                          : u.riskScore > 20
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-50 text-[#16A36A]"
                          }`}
                      >
                        Risk: {u.riskScore}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${u.status === "active"
                          ? "bg-emerald-100 text-[#16A36A]"
                          : (u.status as string) === "suspended" || u.status === "temporarily_suspended"
                            ? "bg-amber-100 text-amber-900"
                            : (u.status as string) === "banned" || u.status === "permanently_suspended"
                              ? "bg-red-100 text-[#DC3545]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setFormData(u);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setTargetStatus(u.status === "active" ? "temporarily_suspended" : "active");
                            setIsStatusOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#FFB800] hover:bg-amber-50 rounded-lg"
                          title="Change Account Status"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-[#DC3545] hover:bg-red-50 rounded-lg"
                          title="Delete Record"
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

      {/* VIEW DETAILS MODAL */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">User Account Inspection ({selectedUser.id})</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FC] rounded-xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#111E4D] text-[#FFB800] flex items-center justify-center font-bold text-sm">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#111827]">{selectedUser.name}</div>
                  <div className="text-[#64748B]">{selectedUser.mobile} — {selectedUser.email || "No email"}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl">
                <div>Account Type: <span className="font-bold text-[#111827] capitalize">{selectedUser.accountType}</span></div>
                <div>City / PIN: <span className="font-bold text-[#111827]">{selectedUser.city} ({selectedUser.pincode})</span></div>
                <div>Active Listings: <span className="font-bold text-[#111827]">{selectedUser.listingsCount}</span></div>
                <div>Registered Stores: <span className="font-bold text-[#111827]">{selectedUser.storesCount}</span></div>
                <div>Reports Received: <span className="font-bold text-[#DC3545]">{selectedUser.reportsReceived}</span></div>
                <div>System Risk Score: <span className="font-bold text-[#3547D4]">{selectedUser.riskScore}/100</span></div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <p className="font-bold text-[#111827]">Identity & Verification Badges:</p>
                <div className="flex items-center space-x-3 pt-1">
                  <span>Mobile: {selectedUser.verifiedMobile ? "✓ Verified" : "✗ Pending"}</span>
                  <span>Email: {selectedUser.verifiedEmail ? "✓ Verified" : "✗ Pending"}</span>
                  <span>GSTIN/ID: {selectedUser.verifiedIdentity ? "✓ Verified" : "✗ Unverified"}</span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827] hover:bg-slate-200">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSaveUser} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">{isAddOpen ? "Add New Platform User" : "Edit User Profile"}</h3>
              <button type="button" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile || ""}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Account Type</label>
                  <select
                    value={formData.accountType || "individual"}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  >
                    <option value="individual">Individual Buyer/Seller</option>
                    <option value="business">Business Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || "Hyderabad"}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]"
              >
                Save User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHANGE STATUS MODAL */}
      {isStatusOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Change Account Status</h3>
              <button onClick={() => setIsStatusOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Updating account status for <strong className="text-[#111827]">{selectedUser.name}</strong> ({selectedUser.id}):
              </p>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                >
                  <option value="active">Active / Normal</option>
                  <option value="under_investigation">Under Investigation</option>
                  <option value="suspended">Suspended (Temporary)</option>
                  <option value="banned">Permanently Banned</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Reason / Moderation Notes</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Specify policy violation or moderation reason..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={() => setIsStatusOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Cancel
              </button>
              <button onClick={handleStatusChange} className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]">
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
