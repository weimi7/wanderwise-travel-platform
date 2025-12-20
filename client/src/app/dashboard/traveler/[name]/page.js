"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  DollarSign,
  Heart,
  MapPin,
  Clock,
  TrendingUp,
  ArrowRight,
  Star,
  Plane,
  Hotel,
  Activity,
  Settings,
  Bell,
  Search,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/toast";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function UserDashboardHome() {
  const { name } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth() || {};
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({ totalSpent: 0, upcomingTrips: 0, favoriteCount: 0 });
  const [error, setError] = useState("");

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  // Fetch user-specific data
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [bookingsRes, favRes] = await Promise.all([
          axios.get(`${API_BASE}/api/bookings`, { headers: getAuthHeaders() }),
          axios.get(`${API_BASE}/api/users/favorites`, { headers: getAuthHeaders(), params: { limit: 50 } }),
        ]);

        if (!mounted) return;

        const bookingsData = bookingsRes.data?.bookings || [];
        const favData = favRes.data?.favorites || [];

        setBookings(bookingsData);
        setFavorites(favData);

        // Calculate stats
        const now = new Date();
        const upcoming = bookingsData.filter(b => {
          const start = b.start_date ? new Date(b.start_date) : b.created_at ? new Date(b.created_at) : null;
          return start && start >= now && (b.status === "confirmed" || b.status === "pending");
        });

        const totalSpent = bookingsData.reduce((acc, b) => acc + Number(b.total_amount || 0), 0);

        setStats({
          totalSpent,
          upcomingTrips: upcoming.length,
          favoriteCount: favData.length
        });

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please try refreshing.");
        showToast("Failed to load dashboard data", { type: "error" });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (user) loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Convert slug back to normal format
  const displayName = name
    ? name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : (user && user.full_name) || "Traveler";

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  // Stats cards data
  const statCards = [
    {
      title: "Upcoming Trips",
      value: stats.upcomingTrips,
      description: `${stats.upcomingTrips} active bookings`,
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      description: "All-time travel expenses",
      icon: DollarSign,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
    },
    {
      title: "Favorites",
      value: stats.favoriteCount,
      description: "Saved destinations & activities",
      icon: Heart,
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: Hotel, label: "Book Hotels", color: "bg-gradient-to-r from-emerald-500 to-teal-500", href: "/accommodations" },
    { icon: Activity, label: "Activities", color: "bg-gradient-to-r from-orange-500 to-amber-500", href: "/activities" },
    { icon: Calendar, label: "Plan Trip", color: "bg-gradient-to-r from-purple-500 to-pink-500", href: "/itinerary-planner" },
    { icon: MapPin, label: "Destinations", color: "bg-gradient-to-r from-rose-500 to-red-500", href: "/destinations" },
  ];

  // Filter upcoming trips
  const upcomingTrips = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => {
        const start = b.start_date ? new Date(b.start_date) : null;
        return start && start >= now && (b.status === "confirmed" || b.status === "pending");
      })
      .slice(0, 3)
      .map((b) => ({
        id: b.booking_id,
        title: b.booking_type === "room" ? `Hotel Booking` : `${b.booking_type?.charAt(0).toUpperCase() + b.booking_type?.slice(1)}`,
        description: b.item || `Booking #${b.reference_id}`,
        date: b.start_date ? new Date(b.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Soon",
        location: b.location || b.contact_city || "Multiple locations",
        price: b.currency ? `${b.currency} ${Number(b.total_amount || 0).toFixed(2)}` : `$${Number(b.total_amount || 0).toFixed(2)}`,
        type: b.booking_type || "booking",
        status: b.status || "confirmed"
      }));
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Welcome back, {displayName}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Show avatar if available */}
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={`${displayName} avatar`} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`${stat.bgColor} p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  {isLoading ? "..." : stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            {stat.trend && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> {stat.trend}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trips */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Trips</h2>
              <Link 
                href={`/dashboard/traveler/${name}/bookings`}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ x: 4 }}
                    className="flex items-center p-4 bg-gray-50 dark:bg-gray-750 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group cursor-pointer"
                    onClick={() => router.push(`/dashboard/traveler/${name}/bookings/${trip.id}`)}
                  >
                    <div className={`p-3 rounded-lg ${trip.type === 'flight' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'} mr-4`}>
                      {trip.type === 'flight' ? 
                        <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : 
                        <Hotel className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{trip.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{trip.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${trip.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                          {trip.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {trip.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {trip.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-800 dark:text-white">{trip.price}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No upcoming trips</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">Start planning your next adventure!</p>
                <Link
                  href="/itinerary-planner"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plane className="w-4 h-4" />
                  Plan a Trip
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href={action.href}
                    className={`${action.color} p-4 rounded-xl text-white flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-all duration-300`}
                  >
                    <action.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Favorites Preview */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Favorites</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {favorites.length} saved items • Last updated today
              </p>
            </div>
            <Link
              href={`/dashboard/traveler/${name}/favorites`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Heart className="w-4 h-4" />
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favorites.slice(0, 3).map((fav, index) => (
              <motion.div
                key={fav.favorite_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-750 dark:to-gray-800 border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {fav.favorite_type?.charAt(0).toUpperCase() + fav.favorite_type?.slice(1) || "Item"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {fav.reference_id}</p>
                  </div>
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Added {fav.created_at ? new Date(fav.created_at).toLocaleDateString() : "recently"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}