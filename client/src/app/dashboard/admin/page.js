"use client";

import { 
  Users, Hotel, Calendar, DollarSign, TrendingUp, Sparkles, 
  BarChart3, Target, ChevronUp, ChevronDown, Download, Filter,
  Clock, Globe, CreditCard, Package, Eye, MoreVertical,
  AlertCircle, CheckCircle, XCircle, RefreshCw,
  TrendingDown, ArrowUpRight, ArrowDownRight,
  Zap, Shield, Database, Cpu, Layers, Activity,
  Settings, Bell, Search, Menu, Grid, List
} from "lucide-react";
import BookingsChart from "@/components/dashboard/admin/overview/BookingsChart";
import RevenueChart from "@/components/dashboard/admin/overview/RevenueChart";
import RecentBookings from "@/components/dashboard/admin/overview/RecentBookings";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import AdminReportsPanel from "@/components/dashboard/admin/overview/AdminReportsPanel";

// Animated section wrapper
const AnimatedSection = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity:  1, y: 0 }}
    transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
    className={className}
  >
    {children}
  </motion.div>
);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EnhancedAdminOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real data state
  const [totals, setTotals] = useState(null);
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState("");
  const [systemHealth, setSystemHealth] = useState({
    uptime: "99.9%",
    responseTime: "142ms",
    activeUsers: 247,
    serverLoad: 34
  });

  const base = API_BASE || "http://localhost:5000";

  const fetchStats = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
      setIsRefreshing(true);
    }
    setError("");
    
    try {
      // Use the base variable instead of hardcoded URL
      const url = `${base}/api/admin/stats`;
      console.log('🔍 Fetching admin stats from:', url);
      console.log('🔐 Auth headers:', getAuthHeaders());
      
      const res = await axios.get(url, { 
        headers: getAuthHeaders(),
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ Stats response received:', res.data);
      
      if (res.data && res.data.success) {
        const payload = res.data;
        setTotals(payload.totals || null);

        setBookingsTrend((payload.bookingsTrend || []).map(item => ({
          month: item.month,
          bookings: Number(item.bookings || 0),
          revenue: Number(item.revenue || 0)
        })));

        const colorMap = { 
          room: "#3b82f6", 
          activity: "#22c55e", 
          other: "#f59e0b",
          flight: "#8b5cf6",
          car: "#ec4899",
          cruise: "#06b6d4"
        };
        
        setRevenueBreakdown((payload.revenueBreakdown || []).map((r, i) => ({
          name: r.name || (r.booking_type || "Other"),
          value: Number(r.value || 0),
          color: colorMap[r.booking_type] || (["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"][i % 5]),
          icon: r.booking_type === 'room' ? Hotel : 
                r.booking_type === 'activity' ? Activity : 
                r.booking_type === 'flight' ? Globe : 
                r.booking_type === 'car' ? Package :  CreditCard
        })));

        setRecentBookings((payload. recentBookings || []).map(b => ({
          id: b. booking_id,
          user: b.user_name || b.contact_name || b.user_id || "Guest",
          email: b.contact_email || "",
          item: b.booking_type === "room" ? `Room #${b.reference_id}` : 
                b.booking_type === "activity" ?  `Activity #${b.reference_id}` : 
                b.booking_type === "flight" ? `Flight #${b.reference_id}` : 
                b.booking_type === "car" ? `Car Rental #${b.reference_id}` : 
                `${b.booking_type} #${b.reference_id}`,
          status: b.status || "pending",
          date: b.created_at || b.start_date || null,
          amount: `$${Number(b.total_amount || 0).toFixed(2)}`,
          nights: b.start_date && b.end_date ? Math.max(1, Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / (1000*60*60*24))) : (b.quantity || b.guests || 1),
          type: b.booking_type || "other"
        })));
        
        console.log('✅ All stats data processed successfully');
      } else {
        throw new Error("Invalid stats response - missing success flag");
      }
    } catch (err) {
      // Enhanced error logging
      console.error("❌ Failed to load /api/admin/stats");
      console.error("Error type:", err.name);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      console.error("Response headers:", err.response?.headers);
      console.error("Request URL:", err.config?.url);
      console.error("Request method:", err. config?.method);
      console.error("Request headers:", err. config?.headers);
      
      // More descriptive error message
      let errorMessage = "Unable to fetch live data.  ";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += "Request timed out. Server may be slow or unresponsive.";
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage += `Cannot connect to server at ${base}. Please check if the backend is running on port 5000.`;
      } else if (err.response?. status === 401) {
        errorMessage += "Authentication failed. Your session may have expired.  Please log in again.";
      } else if (err.response?. status === 403) {
        errorMessage += "Access denied. Admin privileges are required to view this page.";
      } else if (err.response?.status === 404) {
        errorMessage += `API endpoint not found at ${base}/api/admin/stats. Check route configuration.`;
      } else if (err.response?.status >= 500) {
        errorMessage += `Server error (${err.response. status}). ${err.response?.data?.message || 'Please contact support.'}`;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Unknown error occurred. Check console for details.";
      }
      
      setError(errorMessage);
      
      // Set demo data
      console.log('⚠️ Loading demo data as fallback');
      setTotals({ users: 1245, bookings: 342, revenue: 48750, accommodations: 89 });
      setBookingsTrend([
        { month:  "Jan", bookings: 65, revenue: 9500 },
        { month: "Feb", bookings: 78, revenue: 11200 },
        { month: "Mar", bookings: 92, revenue: 13500 },
        { month: "Apr", bookings: 107, revenue: 14500 }
      ]);
      setRevenueBreakdown([
        { name: "Rooms", value: 28750, color: "#3b82f6", icon: Hotel },
        { name: "Activities", value: 12500, color: "#22c55e", icon: Activity },
        { name: "Flights", value: 6500, color: "#8b5cf6", icon: Globe },
        { name: "Car Rentals", value: 1000, color: "#ec4899", icon: Package }
      ]);
      setRecentBookings([
        {
          id: 1,
          user: "John Doe",
          email: "john@example.com",
          item: "Room #101",
          status: "confirmed",
          date: new Date().toISOString(),
          amount: "$250. 00",
          nights: 3,
          type: "room"
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [base]);

  useEffect(() => {
    console.log('🚀 Admin Overview Page mounted');
    console.log('🌐 API Base URL:', base);
    console.log('🔑 Token available:', !!localStorage.getItem("token"));
    
    fetchStats();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing stats...');
      fetchStats(false);
    }, 60000);
    
    return () => {
      console.log('🛑 Cleaning up admin overview');
      clearInterval(interval);
    };
  }, [base, fetchStats]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchStats();
  };

  const getStatusColor = (status) => {
    switch (status?. toLowerCase()) {
      case 'confirmed':  return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredBookings = useMemo(() => {
    if (!searchQuery) return recentBookings;
    return recentBookings.filter(booking =>
      booking.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery. toLowerCase()) ||
      booking.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentBookings, searchQuery]);

  const stats = [
    {
      title: "Total Users",
      value: isLoading ? "…" : (totals ?  totals.users. toLocaleString() : "—"),
      icon: Users,
      trend: "up",
      change: "+12. 5%",
      description: "Active registered users",
      color: "from-blue-500 to-cyan-500",
      trendValue: 12.5
    },
    {
      title: "Total Bookings",
      value:  isLoading ? "…" :  (totals ? totals.bookings.toLocaleString() : "—"),
      icon: Calendar,
      trend: "up",
      change: "+24.3%",
      description: "Bookings this month",
      color:  "from-purple-500 to-pink-500",
      trendValue: 24.3
    },
    {
      title: "Total Revenue",
      value: isLoading ? "…" : (totals ? `$${(totals.revenue || 0).toLocaleString()}` : "—"),
      icon: DollarSign,
      trend: "up",
      change: "+18.7%",
      description: "Revenue YTD",
      color: "from-green-500 to-emerald-500",
      trendValue: 18.7
    },
    {
      title: "Active Properties",
      value: isLoading ? "…" : (totals ? totals.accommodations.toLocaleString() : "—"),
      icon: Hotel,
      trend: "up",
      change: "+8.2%",
      description: "Listed accommodations",
      color: "from-amber-500 to-orange-500",
      trendValue: 8.2
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity:  1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 dark:from-gray-200 dark:via-gray-400 dark:to-gray-200 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLoading ? "Loading live data..." : error ? "Using demo data" : "Live data synced"}
              </p>
              <motion.button
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </motion. div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">{error}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Showing demo data.  Please check the console for detailed error information.
            </p>
          </div>
        </motion. div>
      )}

      {/* Stats Cards */}
      <AnimatedSection delay={0.2} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity:  1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 shadow-xl text-white relative overflow-hidden`}
            >
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-4 translate-y-4" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                    {stat.trend === 'up' ? 
                      <ArrowUpRight className="w-4 h-4" /> : 
                      <ArrowDownRight className="w-4 h-4" />
                    }
                    <span className="text-sm font-semibold">{stat.change}</span>
                  </div>
                </div>
                
                <div className="mb-1">
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.title}</div>
                </div>
                
                <div className="text-sm opacity-80 mt-2">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Charts Section - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bookings Chart */}
          <AnimatedSection delay={0.3}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Booking Trends</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly performance</p>
                  </div>
                </div>
              </div>
              <BookingsChart data={bookingsTrend. length ?  bookingsTrend : [{ month: "—", bookings: 0 }]} />
            </div>
          </AnimatedSection>

          {/* Revenue Breakdown */}
          <AnimatedSection delay={0.4}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Revenue Breakdown</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">By booking type</p>
                  </div>
                </div>
              </div>
              <RevenueChart data={revenueBreakdown. length ? revenueBreakdown : [{ name: "Other", value: 0, color: "#3b82f6" }]} />
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Reports Panel */}
        {/* <div className="">
          <AnimatedSection delay={0.5}>
            <AdminReportsPanel apiBase={base} />
          </AnimatedSection>
        </div> */}

        {/* Performance Insights */}
        <AnimatedSection delay={0.55}>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Performance Insights</h3>
                <p className="text-blue-100 text-sm">Weekly analysis</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Conversion Rate</span>
                <span className="text-xl font-bold">4.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Avg. Booking Value</span>
                <span className="text-xl font-bold">$142.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">User Satisfaction</span>
                <span className="text-xl font-bold">94%</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Recent Bookings */}
      <AnimatedSection delay={0.6} className="mt-8">
        <RecentBookings bookings={filteredBookings} />
      </AnimatedSection>

      {/* Footer */}
      <AnimatedSection delay={0.7} className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Data updates every 60 seconds • Last updated: Just now
        </p>
      </AnimatedSection>
    </div>
  );
}