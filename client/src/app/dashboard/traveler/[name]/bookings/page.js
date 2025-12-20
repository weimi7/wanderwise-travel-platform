"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Plus,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import BookingsList from "@/components/dashboard/traveler/booking/BookingsList";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/toast";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function DashboardBookingsPage() {
  const { name } = useParams();
  const { user, isLoading: authLoading } = useAuth() || {};
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/bookings`, {
        headers: getAuthHeaders(),
      });
      if (res?.data?.success) {
        setBookings(res.data.bookings || []);
      } else {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to load bookings", err?.response?.data || err.message || err);
      setError("Failed to load bookings. See console for details.");
      showToast("Failed to load bookings", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      // if not logged in, do nothing here - other auth flows redirect elsewhere
      return;
    }
    fetchBookings();
  }, [user, authLoading]);

  // Derived stats
  const stats = useMemo(() => {
    const now = new Date();
    const total = bookings.length;
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;
    let active = 0;
    let totalSpent = 0;

    bookings.forEach((b) => {
      const start = b.start_date ? new Date(b.start_date) : null;
      if (start && start >= now && (b.status === "confirmed" || b.status === "pending")) upcoming++;
      if (b.status === "completed") completed++;
      if (b.status === "cancelled") cancelled++;
      if (b.status === "active") active++;
      totalSpent += Number(b.total_amount || 0);
    });

    return { total, upcoming, completed, cancelled, active, totalSpent };
  }, [bookings]);

  // Build filters dynamically with counts
  const filters = useMemo(() => {
    return [
      { id: "all", label: "All Bookings", count: stats.total },
      { id: "upcoming", label: "Upcoming", count: stats.upcoming },
      { id: "active", label: "Active", count: stats.active },
      { id: "completed", label: "Completed", count: stats.completed },
      { id: "cancelled", label: "Cancelled", count: stats.cancelled },
    ];
  }, [stats]);

  // Filtered bookings for list view
  const filteredBookings = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return bookings.filter((b) => {
      // filter by status
      if (activeFilter !== "all") {
        if (activeFilter === "upcoming") {
          const start = b.start_date ? new Date(b.start_date) : null;
          const now = new Date();
          if (!(start && start >= now && (b.status === "confirmed" || b.status === "pending"))) return false;
        } else if (activeFilter === "active") {
          if (b.status !== "active") return false;
        } else {
          if (b.status !== activeFilter) return false;
        }
      }

      // search across reference name/id/email
      if (!q) return true;
      const hay = [
        b.booking_id,
        b.reference_id,
        b.booking_type,
        b.contact_name,
        b.contact_email,
        b.meta && typeof b.meta === "string" ? b.meta : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, activeFilter, searchQuery]);

  // Cards data
  const statsCards = [
    {
      title: "Total Bookings",
      value: stats.total.toString(),
      change: stats.total ? `${stats.total}` : "0",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    },
    {
      title: "Upcoming",
      value: stats.upcoming.toString(),
      change: stats.upcoming ? `+${stats.upcoming}` : "0",
      icon: Clock,
      color: "from-emerald-500 to-green-500",
      bgColor:
        "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
    },
    {
      title: "Total Spent",
      value: `$${(stats.totalSpent || 0).toFixed(2)}`,
      change: "+0%",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor:
        "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    },
    {
      title: "Active Now",
      value: stats.active.toString(),
      change: "Current",
      icon: Eye,
      color: "from-amber-500 to-orange-500",
      bgColor:
        "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    },
  ];

  const statusIcons = {
    confirmed: CheckCircle,
    pending: Clock,
    cancelled: XCircle,
    completed: CheckCircle,
    active: AlertCircle,
  };

  const statusColors = {
    confirmed: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    pending: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    cancelled: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    completed: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    active: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  My Bookings
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                Manage all your travel bookings in one place. View details, download confirmations, or share booking links with others.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${stat.bgColor} p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">{stat.change}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">from last month</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">

          {/* Bookings List */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* List Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Bookings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeFilter === "all" ? "All bookings" : `${filters.find(f => f.id === activeFilter)?.label} bookings`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Sorted by:</span>
                    <select className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                      <option>Most Recent</option>
                      <option>Check-in Date</option>
                      <option>Price: High to Low</option>
                      <option>Price: Low to High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bookings List Content */}
              <div className="p-6">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading bookings…</p>
                ) : error ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">{error}</div>
                ) : (
                  <BookingsList bookings={filteredBookings} onRefresh={fetchBookings} />
                )}

                <AnimatePresence>
                  {(!loading && bookings.length === 0) && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No bookings found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {"You haven't made any bookings yet. Start planning your next adventure!"}
                      </p>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
                        <Plus className="w-5 h-5" /> Book Now
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => {}} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">Previous</button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">1</button>
                  <button className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800">2</button>
                  <button onClick={() => {}} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">Next</button>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Need Help with a Booking?</h4>
                  <p className="text-blue-700 dark:text-blue-400 text-sm mb-3">
                    If you have questions about an existing booking or need to make changes, our support team is here to help.
                  </p>
                  <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Contact Support →</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}