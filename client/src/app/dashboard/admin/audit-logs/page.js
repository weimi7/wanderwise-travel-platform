'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import AdminAuditTable from '@/components/dashboard/admin/audit-logs/AdminAuditTable';

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg"
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Admin Audit Logs
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track and review all administrative actions across the platform
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Audit Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <AdminAuditTable searchQuery={searchQuery} filter={selectedFilter} />
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>Audit logs are automatically generated for all administrative actions. Records are retained for compliance purposes.</p>
          <p className="mt-1">Last updated: Just now</p>
        </motion.div>
      </div>
    </main>
  );
}