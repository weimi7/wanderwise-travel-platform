'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Users, 
  Filter, 
  Download,
  RefreshCw,
  Shield,
  TrendingUp,
  AlertCircle,
  Calendar,
  TrendingDown
} from 'lucide-react';

import AdminReviewsTable from '@/components/dashboard/admin/review/AdminReviewsTable';

// Read token from any known localStorage key used across the app
function getStoredToken() {
  if (typeof window === 'undefined') return null;
  const keys = ['token', 'authToken', 'accessToken'];
  for (const k of keys) {
    const t = localStorage.getItem(k);
    if (t) return t;
  }
  return null;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [token, setToken] = useState(() => getStoredToken());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('pending');

  useEffect(() => {
    // Keep token in sync across tabs (if changed elsewhere)
    const onStorage = (e) => {
      if (!e.key) return;
      if (['token', 'authToken', 'accessToken'].includes(e.key)) {
        setToken(getStoredToken());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // Simple guard: if no token present, redirect to login
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting reviews...');
  };

  const stats = [
    { label: 'Avg. Rating', value: '4.7', change: '+0.2', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Today', value: '18', change: '+3', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Response Rate', value: '92%', change: '+5%', icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Pending', value: '24', change: '-8', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

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
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg"
              >
                <MessageSquare className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Review Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Moderate, approve, and manage user reviews across all platforms
                </p>
              </div>
            </div>
          </div>

          {/* Performance Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800/30"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Moderation Performance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-green-600">Avg. 2.4 hours</span> response time • 
                    <span className="font-semibold text-blue-600 ml-3">98% accuracy</span> rate • 
                    <span className="font-semibold text-purple-600 ml-3">24/7</span> moderation
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: Just now
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Reviews Table Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Review Submissions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review, approve, or reject user submissions with detailed moderation controls
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time Updates
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <AdminReviewsTable token={token} activeFilter={activeFilter} />
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
                <h4 className="font-medium text-gray-800 dark:text-white mb-1">Moderation Guidelines</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Check for inappropriate content, spam, and fake reviews</li>
                  <li>• Ensure reviews comply with community guidelines</li>
                  <li>• Use bulk actions for efficient moderation of multiple reviews</li>
                  <li>• Provide clear rejection reasons when applicable</li>
                </ul>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Need help? Contact support
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}