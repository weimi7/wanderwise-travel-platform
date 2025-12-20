// Note: path/name matches your earlier AdminUsersPage file (replace accordingly)
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, User, Eye, Edit, Trash, Loader2, Users,
  Filter, Download, RefreshCw, Shield, Mail, Phone,
  Calendar, ChevronLeft, ChevronRight, TrendingUp,
  CheckCircle, XCircle, MoreVertical, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserDetailsModal from "@/components/dashboard/admin/user-management/UserDetailsModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { buildUrl, getAuthHeaders, safeJsonResponse } from "@/lib/api";
import toast from "react-hot-toast";

/**
 * Admin User Management page
 *
 * - Fetches users from the admin API (supports pagination & search)
 * - View user details in modal
 * - Edit and Delete users (calls backend)
 *
 * Notes:
 * - Server endpoints expected:
 *    GET  /api/admin/users?search=&page=&perPage=
 *    PUT  /api/admin/users/:id
 *    DELETE /api/admin/users/:id
 * - Auth: this page reads token from AuthContext (preferred) or localStorage fallback
 */

export default function AdminUsersPage() {
  const { token: authToken } = useAuth() || {};
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // confirm dialog state for table delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter states
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    newToday: 0
  });

  // build auth header
  const getAuthHeader = useCallback(
    () => getAuthHeaders(authToken),
    [authToken]
  );

  // Helper: normalize server response shapes for user listing
  const normalizeUserListResponse = (data) => {
    const usersList = data?.users || data?.rows || data?.data?.users || [];
    const meta = data?.meta || data?.pagination || data?.data?.meta || {};
    return { users: usersList, meta };
  };

  // Calculate stats from users data
  const calculateStats = (userList) => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: userList.length,
      active: userList.filter(u =>
        u.status !== "suspended" &&
        u.status !== "inactive" &&
        u.status !== false &&
        u.status !== "false"
      ).length,
      admins: userList.filter(u => u.role === "admin").length,
      newToday: userList.filter(u => {
        // guard missing created_at
        if (!u.created_at) return false;
        const userDate = new Date(u.created_at).toISOString().split('T')[0];
        return userDate === today;
      }).length
    };
  };

  // Fetch users (with search + pagination)
  const fetchUsers = useCallback(
    async (pageToLoad = 1, q = search) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(pageToLoad),
          perPage: String(perPage)
        });
        if (q) params.set("search", q);
        if (roleFilter !== "all") params.set("role", roleFilter);
        if (statusFilter !== "all") params.set("status", statusFilter);

        const url = buildUrl(`/api/admin/users?${params.toString()}`);

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        const data = await safeJsonResponse(res);

        if (!res.ok) {
          console.error("Failed to fetch users:", data);
          toast.error(data?.message || data?.error || `Failed to fetch users (status ${res.status}). Ensure you are logged in as admin.`);
          setUsers([]);
          setTotalPages(1);
          setStats({ total: 0, active: 0, admins: 0, newToday: 0 });
          return;
        }

        const normalized = normalizeUserListResponse(data);
        const userList = normalized.users || [];

        setUsers(userList);
        setPage(normalized.meta.page || pageToLoad);
        setTotalPages(normalized.meta.totalPages || normalized.meta.total_pages || 1);
        setStats(calculateStats(userList));
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Error fetching users. Check console for details.");
        setUsers([]);
        setTotalPages(1);
        setStats({ total: 0, active: 0, admins: 0, newToday: 0 });
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [perPage, getAuthHeader, search, roleFilter, statusFilter]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(1, search), 300);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers(page);
  };

  // open confirm dialog for delete
  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // perform delete after confirmation
  const performDelete = async () => {
    if (!userToDelete) {
      setShowDeleteConfirm(false);
      return;
    }
    setDeleteLoading(true);
    try {
      const url = buildUrl(`/api/admin/users/${userToDelete.id}`);
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      const data = await safeJsonResponse(res);
      if (!res.ok) {
        console.error("Delete failed:", data);
        toast.error(data?.message || data?.error || `Delete failed (status ${res.status})`);
        return;
      }
      toast.success("User deleted successfully");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      // Refresh current page
      fetchUsers(page);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting user");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Save updates from the modal (partial update)
  const handleSave = async (updatedFields) => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const url = buildUrl(`/api/admin/users/${selectedUser.id}`);
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(updatedFields),
      });
      const data = await safeJsonResponse(res);
      if (!res.ok) {
        console.error("Update failed:", data);
        toast.error(data?.message || data?.error || `Update failed (status ${res.status})`);
        return;
      }

      // If backend returned updated user, update list in-place for instant feedback
      if (data && data.user && data.user.id) {
        setUsers(prev => prev.map(u => (u.id === data.user.id ? data.user : u)));
      } else {
        // fallback: refresh list
        fetchUsers(page);
      }

      toast.success("User updated successfully");
      setSelectedUser(null);
      // Refresh list, keep current page (already handled)
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    fetchUsers(1);
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white";
    }
    return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white";
  };

  const getStatusBadge = (status) => {
    if (status === "suspended" || status === "inactive" || status === false || status === "false") {
      return "bg-gradient-to-r from-red-500 to-pink-600 text-white";
    }
    return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'US';
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 5 }}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"
          >
            <Users className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              User Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage platform users, roles, and permissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "Active Users", value: stats.active, icon: CheckCircle, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
          { label: "Admin Users", value: stats.admins, icon: Shield, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
          { label: "New Today", value: stats.newToday, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 ${stat.bg} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Filter className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Filter Users</h3>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {users.length} users found
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="traveler">Traveler</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Users List</h3>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        )}

        {/* Users Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {/* Render avatar image when available, fallback to initials */}
                          {user.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.avatar_url}
                              alt={`${user.full_name || user.name} avatar`}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.parentElement.querySelector(".avatar-initials");
                                if (fallback) fallback.classList.remove("hidden");
                              }}
                            />
                          ) : null}

                          <div className={`avatar-initials ${user.avatar_url ? "hidden" : ""}`}>
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(user.full_name || user.name)}
                            </div>
                          </div>

                          {user.role === "admin" && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <Shield className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {user.full_name || user.name || 'Unnamed User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                        {user.status === "suspended" || user.status === "inactive" || user.status === false || user.status === "false"
                          ? "Suspended"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => confirmDeleteUser(user)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm cursor-pointer"
                          title="Delete User"
                        >
                          <Trash className="w-4 h-4" />
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {users.length === 0 && !loading && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No users found</h4>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {search || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No users have been registered yet.'}
                </p>
                {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing page {page} of {totalPages} • {users.length} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchUsers(Math.max(1, page - 1))}
                  disabled={page <= 1 || loading}
                  className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchUsers(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${page === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => fetchUsers(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || loading}
                  className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSave={handleSave}
        onDeleted={() => {
          setSelectedUser(null);
          fetchUsers(page);
        }}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Confirm User Deletion"
        message={`Permanently delete ${userToDelete?.full_name || userToDelete?.email || "this user"}? This action cannot be undone.`}
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onCancel={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
        onConfirm={performDelete}
      />
    </section>
  );
}