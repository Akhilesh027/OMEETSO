import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROLE_DEFINITIONS, computePermissionsForRoles } from "@/permissions/roles";
import {
  fetchAdminStaffListApi,
  createAdminStaffApi,
  updateAdminStaffApi,
  deleteAdminStaffApi,
  type AdminStaffMember
} from "@/api/adminStaff.api";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Edit2,
  Trash2,
  Layers,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from "lucide-react";

export default function AdminUsersPage() {
  const { admin: currentAdmin } = useAdminAuth();
  const { showSuccess, showError } = useToast();

  const [staffList, setStaffList] = useState<AdminStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [createRoles, setCreateRoles] = useState<string[]>(["Listing Moderator"]);
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<AdminStaffMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<AdminStaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Inspector Modal
  const [inspectPermissions, setInspectPermissions] = useState<{ name: string; perms: string[] } | null>(null);

  const availableRoles = Object.values(ROLE_DEFINITIONS);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminStaffListApi();
    setLoading(false);
    if (res.success && res.data) {
      setStaffList(res.data);
    } else {
      showError("Load Error", res.error || "Failed to load staff list");
    }
  }, [showError]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Helper to generate a random secure password
  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreatePassword(pass);
    setShowPassword(true);
  };

  const handleToggleCreateRole = (roleName: string) => {
    if (roleName === "Super Admin") {
      setCreateRoles((prev) =>
        prev.includes("Super Admin") ? prev.filter((r) => r !== "Super Admin") : ["Super Admin"]
      );
      return;
    }

    setCreateRoles((prev) => {
      const filtered = prev.filter((r) => r !== "Super Admin");
      if (filtered.includes(roleName)) {
        const next = filtered.filter((r) => r !== roleName);
        return next.length > 0 ? next : ["Listing Moderator"];
      } else {
        return [...filtered, roleName];
      }
    });
  };

  const handleToggleEditRole = (roleName: string) => {
    if (roleName === "Super Admin") {
      setEditRoles((prev) =>
        prev.includes("Super Admin") ? prev.filter((r) => r !== "Super Admin") : ["Super Admin"]
      );
      return;
    }

    setEditRoles((prev) => {
      const filtered = prev.filter((r) => r !== "Super Admin");
      if (filtered.includes(roleName)) {
        const next = filtered.filter((r) => r !== roleName);
        return next.length > 0 ? next : ["Listing Moderator"];
      } else {
        return [...filtered, roleName];
      }
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      showError("Validation Error", "Please fill all required fields.");
      return;
    }
    if (createRoles.length === 0) {
      showError("Validation Error", "Please assign at least one role.");
      return;
    }

    setCreating(true);
    const res = await createAdminStaffApi({
      name: createName.trim(),
      email: createEmail.trim(),
      password: createPassword.trim(),
      roles: createRoles
    });
    setCreating(false);

    if (res.success) {
      showSuccess("Admin Staff Created", res.message || "New staff member added successfully.");
      setIsCreateModalOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRoles(["Listing Moderator"]);
      loadStaff();
    } else {
      showError("Creation Failed", res.error || "Could not create staff member");
    }
  };

  const openEditModal = (staff: AdminStaffMember) => {
    setEditStaff(staff);
    setEditName(staff.name);
    setEditRoles(staff.roles && staff.roles.length > 0 ? staff.roles : [staff.role]);
    setEditStatus(staff.status === "suspended" ? "suspended" : "active");
    setEditNewPassword("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaff) return;
    if (editRoles.length === 0) {
      showError("Validation Error", "Please assign at least one role.");
      return;
    }

    setUpdating(true);
    const res = await updateAdminStaffApi(editStaff.id, {
      name: editName.trim(),
      roles: editRoles,
      status: editStatus,
      password: editNewPassword.trim() ? editNewPassword.trim() : undefined
    });
    setUpdating(false);

    if (res.success) {
      showSuccess("Staff Updated", res.message || "Staff member updated successfully.");
      setIsEditModalOpen(false);
      setEditStaff(null);
      loadStaff();
    } else {
      showError("Update Failed", res.error || "Could not update staff member");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;
    setDeleting(true);
    const res = await deleteAdminStaffApi(staffToDelete.id);
    setDeleting(false);

    if (res.success) {
      showSuccess("Staff Removed", res.message || "Admin staff member removed.");
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
      loadStaff();
    } else {
      showError("Deletion Failed", res.error || "Could not delete staff member");
    }
  };

  // Filtered staff
  const filteredStaff = staffList.filter((s) => {
    if (roleFilter !== "ALL" && !s.roles?.includes(roleFilter) && s.role !== roleFilter) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter((s) => s.status === "active").length;
  const multiRoleCount = staffList.filter((s) => s.roles && s.roles.length > 1).length;

  return (
    <PageContainer>
      <PageHeader
        title="Admin Staff, Personnel & Role Governance"
        description="Create and govern admin team members. Assign single or multiple specialized roles with strict RBAC boundary enforcement."
        badge={`${totalStaffCount} Operators`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => {
              generatePassword();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-[#3547D4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Create Admin Staff
          </button>
        }
        secondaryActions={
          <button
            onClick={loadStaff}
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
            title="Refresh Staff List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Staff Accounts</span>
            <Users className="w-4 h-4 text-[#3547D4]" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{totalStaffCount}</div>
          <div className="text-[10px] text-indigo-600 font-bold">Registered Personnel</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Operators</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{activeStaffCount}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Authorized Logins</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Multi-Role Staff</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{multiRoleCount}</div>
          <div className="text-[10px] text-amber-600 font-bold">Combined Department Permissions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>System Roles Available</span>
            <Shield className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{availableRoles.length} Roles</div>
          <div className="text-[10px] text-slate-500 font-bold">Standard Role Matrix</div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff by name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4] font-medium"
            >
              <option value="ALL">All Roles ({staffList.length})</option>
              {availableRoles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredStaff.length}</strong> of {totalStaffCount} staff
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F7FC] border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-3 font-bold">Staff Member</th>
                <th className="p-3 font-bold">Assigned Role(s)</th>
                <th className="p-3 font-bold text-center">Perms Granted</th>
                <th className="p-3 font-bold text-center">Status</th>
                <th className="p-3 font-bold">Last Login</th>
                <th className="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3547D4]" />
                    Loading admin personnel...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-sm font-bold text-slate-700">0 Staff Members Found</div>
                      <p className="text-xs text-slate-400">
                        No admin accounts match your search filter. Click "+ Create Admin Staff" to add a new person.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const rolesList = member.roles && member.roles.length > 0 ? member.roles : [member.role];
                  const isCurrent = currentAdmin?.id === member.id;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-[#111827]">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-[#111E4D] text-[#FFB800] flex items-center justify-center font-bold text-xs shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{member.name}</span>
                              {member.isRootAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                  Root Admin
                                </span>
                              )}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-100 text-indigo-800">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-normal">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rolesList.map((r) => {
                            const isSuper = r === "Super Admin";
                            return (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isSuper
                                    ? "bg-purple-100 text-purple-900 border border-purple-200"
                                    : "bg-blue-50 text-[#3547D4] border border-blue-200"
                                }`}
                              >
                                {r}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => setInspectPermissions({ name: member.name, perms: member.permissions })}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          {member.permissions?.includes("*") ? "ALL (*)" : `${member.permissions?.length || 0} perms`}
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        {member.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Never logged in"}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Roles & Status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!member.isRootAdmin && !isCurrent && (
                            <button
                              onClick={() => {
                                setStaffToDelete(member);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Staff Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL (MULTI-ROLE ASSIGNMENT) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3547D4] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Create Admin Staff Member</h3>
                  <p className="text-[11px] text-slate-500">Create an operator account and assign single or multiple roles</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="e.g. ramesh@omeetso.in"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
                  />
                </div>
              </div>

              {/* Password with generator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Initial Login Password *</label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 pr-10 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Multi-Role Selector */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-900 block">Assign Roles (Multi-Role Allowed)</label>
                    <span className="text-[11px] text-slate-500">
                      Check one or multiple roles. The operator receives the union of all selected permissions.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {createRoles.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {availableRoles.map((role) => {
                    const isSelected = createRoles.includes(role.name);
                    return (
                      <div
                        key={role.name}
                        onClick={() => handleToggleCreateRole(role.name)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-indigo-50/70 border-[#3547D4] shadow-xs"
                            : "bg-[#F5F7FC] border-[#E2E8F0] hover:bg-slate-100"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-[#3547D4] border-[#3547D4] text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#111827] text-xs leading-tight">{role.name}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{role.description}</div>
                          <div className="text-[9px] font-mono text-indigo-600 mt-1">
                            {role.permissions.length} perms
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Combined Permissions Summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Combined Total Permissions:</span>
                  </div>
                  <strong className="text-indigo-700 font-mono">
                    {createRoles.includes("Super Admin")
                      ? "ALL PLATFORM (*)"
                      : `${computePermissionsForRoles(createRoles as any).length} granted`}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#3547D4] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditModalOpen && editStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3547D4] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Edit Staff: {editStaff.name}</h3>
                  <p className="text-[11px] text-slate-500">{editStaff.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Account Access Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    disabled={editStaff.isRootAdmin}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4] font-medium"
                  >
                    <option value="active">Active (Access Allowed)</option>
                    <option value="suspended">Suspended (Blocked from Login)</option>
                  </select>
                </div>
              </div>

              {/* Optional Password Reset */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Reset Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Enter new password (optional)"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
                />
              </div>

              {/* Multi-Role Selector */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 block">Assigned Roles (Multi-Role Allowed)</label>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {editRoles.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {availableRoles.map((role) => {
                    const isSelected = editRoles.includes(role.name);
                    const disabled = editStaff.isRootAdmin && role.name === "Super Admin";
                    return (
                      <div
                        key={role.name}
                        onClick={() => !disabled && handleToggleEditRole(role.name)}
                        className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                          disabled
                            ? "bg-slate-100 border-slate-300 opacity-80 cursor-not-allowed"
                            : isSelected
                            ? "bg-indigo-50/70 border-[#3547D4] shadow-xs cursor-pointer"
                            : "bg-[#F5F7FC] border-[#E2E8F0] hover:bg-slate-100 cursor-pointer"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-[#3547D4] border-[#3547D4] text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#111827] text-xs leading-tight">{role.name}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{role.description}</div>
                          <div className="text-[9px] font-mono text-indigo-600 mt-1">
                            {role.permissions.length} perms
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Combined Permissions Summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Combined Total Permissions:</span>
                  </div>
                  <strong className="text-indigo-700 font-mono">
                    {editRoles.includes("Super Admin")
                      ? "ALL PLATFORM (*)"
                      : `${computePermissionsForRoles(editRoles as any).length} granted`}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-[#3547D4] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Remove Admin Staff Member
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove access for{" "}
              <strong className="text-slate-900">{staffToDelete.name}</strong> ({staffToDelete.email})? This operator will
              immediately lose console access.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm & Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION INSPECTOR MODAL */}
      {inspectPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">
                Granted Permissions — {inspectPermissions.name}
              </h3>
              <button
                onClick={() => setInspectPermissions(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-500 font-medium">
                Granted Capabilities ({inspectPermissions.perms.length}):
              </div>
              <div className="max-h-72 overflow-y-auto border border-[#E2E8F0] p-3 rounded-xl space-y-1 bg-slate-50">
                {inspectPermissions.perms.map((p) => (
                  <div key={p} className="flex items-center space-x-2 text-[11px] font-mono text-slate-800 bg-white p-1.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-[#E2E8F0]">
              <button
                onClick={() => setInspectPermissions(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-slate-700 hover:bg-slate-200"
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

