"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  User, 
  Package, 
  TrendingUp, 
  MoreHorizontal, 
  Eye, 
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";

// Status badge component (case-insensitive)
const StatusBadge = ({ status }) => {
  const normalized = (status || "").toString().trim().toLowerCase();
  const statusConfig = {
    confirmed: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800"
    },
    completed: {
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    }
  };

  const config = statusConfig[normalized] || statusConfig.pending;
  const Icon = config.icon;

  // Capitalize display
  const display = normalized ? (normalized.charAt(0).toUpperCase() + normalized.slice(1)) : "Pending";

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
    >
      <Icon className="w-3 h-3" />
      {display}
    </motion.span>
  );
};

// User avatar component (safe fallback)
const UserAvatar = ({ name, email }) => {
  const safeName = (name || "").toString().trim();
  const initials = safeName
    ? safeName.split(' ').filter(Boolean).slice(0,2).map(n => n[0]).join('').toUpperCase()
    : (email ? email[0].toUpperCase() : '?');

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
        {initials}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-white">{safeName || email || 'Guest'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{email || '—'}</p>
      </div>
    </div>
  );
};

export default function RecentBookings({ bookings }) {
  const [isMounted, setIsMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Sample data if none provided
  const sampleBookings = [
    {
      id: 1,
      user: "John Doe",
      email: "john@example.com",
      item: "Luxury Beach Villa",
      status: "Confirmed",
      date: "2024-01-15",
      amount: "$1,299",
      nights: 7
    },
    {
      id: 2,
      user: "Sarah Wilson",
      email: "sarah@example.com",
      item: "Mountain Retreat",
      status: "Pending",
      date: "2024-01-14",
      amount: "$899",
      nights: 5
    },
    {
      id: 3,
      user: "Mike Johnson",
      email: "mike@example.com",
      item: "City Apartment",
      status: "Cancelled",
      date: "2024-01-13",
      amount: "$459",
      nights: 3
    },
    {
      id: 4,
      user: "Emily Davis",
      email: "emily@example.com",
      item: "Lakeside Cabin",
      status: "Completed",
      date: "2024-01-12",
      amount: "$1,099",
      nights: 6
    },
    {
      id: 5,
      user: "Alex Chen",
      email: "alex@example.com",
      item: "Desert Oasis",
      status: "Confirmed",
      date: "2024-01-11",
      amount: "$1,599",
      nights: 8
    }
  ];

  const displayBookings = bookings || sampleBookings;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredBookings = displayBookings
    .filter(booking => 
      filterStatus === "All" || ((booking.status || "").toString().trim().toLowerCase() === filterStatus.toString().trim().toLowerCase())
    )
    .filter(booking =>
      (booking.user || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.item || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.email || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc" 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (sortBy === "amount") {
        return sortOrder === "asc"
          ? parseFloat((a.amount || '').toString().replace('$', '').replace(',', '')) - parseFloat((b.amount || '').toString().replace('$', '').replace(',', ''))
          : parseFloat((b.amount || '').toString().replace('$', '').replace(',', '')) - parseFloat((a.amount || '').toString().replace('$', '').replace(',', ''));
      }
      return 0;
    });

  const statusCounts = {
    All: displayBookings.length,
    Confirmed: displayBookings.filter(b => (b.status || "").toString().trim().toLowerCase() === "confirmed").length,
    Pending: displayBookings.filter(b => (b.status || "").toString().trim().toLowerCase() === "pending").length,
    Cancelled: displayBookings.filter(b => (b.status || "").toString().trim().toLowerCase() === "cancelled").length,
    Completed: displayBookings.filter(b => (b.status || "").toString().trim().toLowerCase() === "completed").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Bookings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayBookings.length} total bookings
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(statusCounts).map(([status, count]) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                {status} ({count})
              </motion.button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Accommodation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id || `${booking.item}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserAvatar name={booking.user} email={booking.email} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {booking.item}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.nights} nights
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {booking.amount}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {booking.date ? new Date(booking.date).toLocaleDateString() : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Empty state */}
            {filteredBookings.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredBookings.length} of {displayBookings.length} bookings
            </p>
            <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              View all bookings
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}