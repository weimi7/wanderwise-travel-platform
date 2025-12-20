'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RefreshCw,
  X,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Hash,
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuditDetailsModal from './AuditDetailsModal';
import { buildUrl, getAuthHeaders } from '@/lib/api';

export default function AdminAuditTable() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('');
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedLog, setSelectedLog] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    console.log('🔍 Fetching audit logs...');
    
    try {
      const params = new URLSearchParams();
      if (actionFilter && actionFilter !== 'all') params.set('action', actionFilter);
      if (typeFilter && typeFilter !== 'all') params.set('reviewable_type', typeFilter);
      if (actorFilter) params.set('actor_name', actorFilter);
      if (q) params.set('q', q);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);

      const url = buildUrl(`/api/admin/audit-logs? ${params. toString()}`);
      console.log('📡 Request URL:', url);
      console.log('🔐 Auth headers:', getAuthHeaders());
      
      const res = await axios.get(url, { 
        headers: getAuthHeaders(),
        timeout: 10000
      });
      
      console.log('✅ Response received:', res.data);
      
      const data = res.data || {};
      const list = data.logs || data.rows || data. data?. logs || [];
      
      console. log(`📋 Loaded ${list.length} audit logs`);
      
      setLogs(list);
      setTotalPages(data.pagination?.totalPages || data.meta?.totalPages || 1);
    } catch (err) {
      console.error('❌ Failed to fetch audit logs');
      console.error('Error type:', err.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err. response?.status);
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.status === 404) {
        setError('Audit logs endpoint not found (404). Verify API configuration.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load audit logs');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('🚀 AdminAuditTable mounted');
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, typeFilter, actorFilter, q, dateFrom, dateTo, sortBy, sortOrder]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setIsRefreshing(true);
    fetchLogs();
  };

  const downloadCsv = async () => {
    console.log('📥 Starting CSV download...');
    
    try {
      const params = new URLSearchParams();
      if (actionFilter && actionFilter !== 'all') params.set('action', actionFilter);
      if (typeFilter && typeFilter !== 'all') params.set('reviewable_type', typeFilter);
      if (actorFilter) params.set('actor_name', actorFilter);
      if (q) params.set('q', q);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);

      const url = buildUrl(`/api/admin/audit-logs/export?${params.toString()}`);
      console.log('📡 Export URL:', url);
      
      const res = await axios.get(url, {
        headers: getAuthHeaders(),
        responseType: 'blob',
        timeout: 30000 // 30 seconds for export
      });

      console.log('✅ CSV data received');

      // Create Blob and trigger download
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document. createElement('a');
      a.href = urlBlob;
      const filename = `audit_logs_${Date.now()}.csv`;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      
      console.log(`✅ CSV downloaded:  ${filename}`);
    } catch (err) {
      console.error('❌ Failed to download CSV:', err);
      alert(err?. response?.data?.message || err.message || 'Failed to download CSV');
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'publish':
      case 'bulk_publish':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
      case 'reject':
      case 'bulk_reject': 
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
      default:
        return { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    }
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      destination: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      activity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      accommodation: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    };
    return typeColors[type?. toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setActionFilter('all');
    setTypeFilter('all');
    setActorFilter('');
    setQ('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Audit Logs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {logs.length} records • Page {page} of {totalPages}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCsv}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Actor Filter */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={actorFilter}
              onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
              placeholder="Filter by actor..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target. value); setPage(1); }}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="publish">Publish</option>
            <option value="reject">Reject</option>
            <option value="bulk_publish">Bulk Publish</option>
            <option value="bulk_reject">Bulk Reject</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target. value); setPage(1); }}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="destination">Destination</option>
            <option value="activity">Activity</option>
            <option value="accommodation">Accommodation</option>
          </select>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target. value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="From date"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="To date"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading audit logs...</p>
        </div>
      )}

      {/* Error State */}
      {error && ! loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity:  1, scale: 1 }}
          className="p-6 text-center"
        >
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Check the browser console for detailed error information. 
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Table */}
      {! loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Review IDs</th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log, index) => {
                  const { icon: ActionIcon, color, bg } = getActionIcon(log.action);
                  return (
                    <motion.tr
                      key={log.audit_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 ${bg} rounded-lg`}>
                            <ActionIcon className={`w-4 h-4 ${color}`} />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white capitalize">
                            {log.action?. replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {log.actor_name || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(log.reviewable_type)}`}>
                          {log.reviewable_type || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {Array.isArray(log.review_ids) ? log.review_ids.length : 0} items
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {log.created_at ?  new Date(log.created_at).toLocaleString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-2 px-3 py-1. 5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {logs.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No audit logs found</h4>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {q || actorFilter || dateFrom || dateTo || actionFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No audit logs have been recorded yet. '}
              </p>
            </div>
          )}

          {/* Pagination */}
          {logs.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing page {page} of {totalPages} • {logs.length} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
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
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors cursor-pointer ${
                            page === pageNum
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
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <AuditDetailsModal 
            log={selectedLog} 
            onClose={() => setSelectedLog(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}