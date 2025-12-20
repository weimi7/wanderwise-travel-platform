'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Clock, CheckCircle, XCircle, Search, Filter, RefreshCw, 
  Download, Eye, ChevronLeft, ChevronRight, Users, Star, 
  FileText, AlertCircle, CheckSquare, Square, MoreVertical,
  MessageSquare, Hash, Calendar, TrendingUp, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ReviewDetailsModal from './ReviewDetailsModal';
import { buildUrl, getAuthHeaders } from '@/lib/api';

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminReviewsTable({ token, activeFilter = 'pending' }) {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState(activeFilter);
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Search term (client-side)
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounced(searchTerm, 300);

  // Sync with parent filter
  useEffect(() => {
    setStatusFilter(activeFilter);
    setPage(1);
  }, [activeFilter]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = getAuthHeaders(token);
      if (!headers.Authorization) {
        setError('Authentication token not found. Please login as an admin.');
        setReviews([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter && typeFilter !== 'all') params.set('reviewable_type', typeFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const url = buildUrl(`/api/admin/reviews?${params.toString()}`);

      if (!url || typeof url !== 'string') {
        setError('API URL could not be constructed. Check API base configuration.');
        setLoading(false);
        return;
      }

      const res = await axios.get(url, { headers, timeout: 10000 });
      const data = res.data || {};

      const list = data.reviews || data.rows || (data.data && data.data.reviews) || [];
      setReviews(Array.isArray(list) ? list : []);

      const pages =
        data.pagination?.totalPages ||
        data.meta?.totalPages ||
        data.pagination?.total_pages ||
        data.meta?.total_pages ||
        1;
      setTotalPages(Number(pages) || 1);

      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to fetch admin reviews', err);
      const status = err?.response?.status;
      const respData = err?.response?.data;

      if (status === 401 || status === 403) {
        setError('Authentication error. Please login as admin.');
      } else if (status === 404) {
        setError('Reviews endpoint not found (404). Verify API base URL and server routes.');
      } else if (status === 500) {
        const serverMsg = (respData && (respData.message || respData.error)) || (typeof respData === 'string' ? respData : null);
        setError(serverMsg ? `Server error: ${serverMsg}` : 'Internal server error (500). Check server logs for details.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Try again later.');
      } else {
        setError((respData && (respData.message || respData.error)) || err.message || 'Failed to load reviews');
      }

      setReviews([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, typeFilter, page, limit, token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReviews();
  };

  const filteredReviews = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.trim() === '') return reviews;
    const q = debouncedSearch.trim().toLowerCase();
    return reviews.filter((r) => {
      const title = (r.title || '').toLowerCase();
      const body = (r.body || '').toLowerCase();
      const author = (r.author_name || '').toLowerCase();
      return title.includes(q) || body.includes(q) || author.includes(q);
    });
  }, [reviews, debouncedSearch]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = (checked) => {
    if (checked) {
      const ids = filteredReviews.map((r) => r.review_id);
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  };

  const doAction = async (reviewId, action) => {
    const confirmed = window.confirm(`Are you sure you want to ${action} this review?`);
    if (!confirmed) return;

    try {
      const endpoint = buildUrl(`/api/admin/reviews/${reviewId}/${action}`);
      await axios.post(endpoint, {}, { headers: getAuthHeaders(token), timeout: 10000 });
      fetchReviews();
    } catch (err) {
      console.error(`Failed to ${action} review`, err);
      const message = err?.response?.data?.message || err?.message || `Failed to ${action} review`;
      alert(message);
    }
  };

  const doBulkAction = async (action) => {
    if (selectedIds.size === 0) return alert('No reviews selected.');
    const confirmed = window.confirm(`${action === 'publish' ? 'Publish' : 'Reject'} ${selectedIds.size} review(s)? This cannot be easily undone.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const ids = Array.from(selectedIds);
      const promises = ids.map((id) =>
        axios
          .post(buildUrl(`/api/admin/reviews/${id}/${action}`), {}, { headers: getAuthHeaders(token), timeout: 10000 })
          .then(() => ({ id, status: 'fulfilled' }))
          .catch((err) => ({ id, status: 'rejected', error: err?.response?.data?.message || err.message }))
      );

      const results = await Promise.all(promises);
      const failed = results.filter((r) => r.status === 'rejected');
      
      if (failed.length) {
        const msg = `Some operations failed:\n${failed.map((f) => `#${f.id}: ${f.error}`).join('\n')}`;
        alert(msg);
      } else {
        alert(`Successfully ${action === 'publish' ? 'published' : 'rejected'} ${ids.length} review(s).`);
      }

      fetchReviews();
    } catch (err) {
      console.error('Bulk action failed', err);
      alert('Bulk action failed. See console for details.');
    } finally {
      setLoading(false);
      setSelectedIds(new Set());
    }
  };

  const allVisibleSelected = filteredReviews.length > 0 && filteredReviews.every((r) => selectedIds.has(r.review_id));

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock, label: 'Pending' };
      case 'published':
        return { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle, label: 'Published' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle, label: 'Rejected' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', icon: AlertCircle, label: status };
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'destination':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'activity':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'accommodation':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Review Submissions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredReviews.length} reviews • Page {page} of {totalPages}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Type Filter */}
          <select
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="destination">Destination</option>
            <option value="activity">Activity</option>
            <option value="accommodation">Accommodation</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 flex items-center gap-1 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-800 dark:text-white">
                {selectedIds.size} review{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => doBulkAction('publish')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Publish Selected
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => doBulkAction('reject')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Reject Selected
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center"
        >
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Table */}
      {!loading && !error && filteredReviews.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(e) => selectAllVisible(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3">Review</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReviews.map((review, index) => {
                const statusConfig = getStatusConfig(review.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <motion.tr
                    key={review.review_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(review.review_id)}
                        onChange={() => toggleSelect(review.review_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-800 dark:text-white truncate">
                          {review.title || 'No Title'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {review.body || 'No content'}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">#{review.review_id}</span>
                          <span className="mx-1">•</span>
                          <span>Item: {review.reviewable_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(review.reviewable_type)}`}>
                        {review.reviewable_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {review.author_name || 'Anonymous'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {review.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${statusConfig.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`text-sm font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedReview(review)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </motion.button>
                        
                        {review.status !== 'published' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => doAction(review.review_id, 'publish')}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-xs"
                            title="Publish Review"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        {review.status !== 'rejected' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => doAction(review.review_id, 'reject')}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-xs"
                            title="Reject Review"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredReviews.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No reviews found</h4>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'No reviews have been submitted yet.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredReviews.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {page} of {totalPages} • {filteredReviews.length} reviews
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

      {/* Details Modal */}
      <AnimatePresence>
        {selectedReview && (
          <ReviewDetailsModal
            review={selectedReview}
            onClose={() => setSelectedReview(null)}
            onPublish={() => {
              doAction(selectedReview.review_id, 'publish');
              setSelectedReview(null);
            }}
            onReject={() => {
              doAction(selectedReview.review_id, 'reject');
              setSelectedReview(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}