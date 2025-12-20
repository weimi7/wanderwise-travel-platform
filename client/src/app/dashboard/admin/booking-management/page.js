'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Shield
} from 'lucide-react';
import AdminBookingsTable from '@/components/dashboard/admin/booking-management/AdminBookingsTable';

export default function AdminBookingsPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg"
              >
                <Calendar className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Booking Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Monitor, manage, and analyze all booking activities across the platform
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Booking Performance
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                  Real-time Updates
                </span>
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Booking Table Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Bookings</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Filter, search, and manage individual bookings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Advanced Filters</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <AdminBookingsTable />
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-1">Quick Tips</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Use filters to quickly find bookings by status, date, or customer</li>
                  <li>• Click on any booking to view detailed information and update status</li>
                  <li>• Export data for external reporting and analysis</li>
                </ul>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: Just now
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}