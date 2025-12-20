'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import EditReviewModal from './EditReviewModal';
import ReviewDetailsModal from './ReviewDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MessageSquare, Edit, Eye, Calendar, 
  ThumbsUp, AlertCircle, Filter, Search, ChevronLeft, 
  ChevronRight, MoreVertical, Globe, Lock, CheckCircle,
  TrendingUp, Award, Heart, User, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const statusConfig = {
  published: { 
    label: 'Published', 
    color: 'from-emerald-500 to-green-500',
    icon: Globe,
    bgColor: 'bg-black',
    textColor: 'text-emerald-700 dark:text-emerald-400'
  },
  pending: { 
    label: 'Pending', 
    color: 'from-amber-500 to-orange-500',
    icon: AlertCircle,
    bgColor: 'bg-black',
    textColor: 'text-amber-700 dark:text-amber-400'
  },
  draft: { 
    label: 'Draft', 
    color: 'from-blue-500 to-cyan-500',
    icon: Edit,
    bgColor: 'bg-black',
    textColor: 'text-blue-700 dark:text-blue-400'
  },
  hidden: { 
    label: 'Hidden', 
    color: 'from-gray-500 to-gray-500',
    icon: Lock,
    bgColor: 'bg-black',
    textColor: 'text-gray-700 dark:text-gray-400'
  },
  rejected: {
    label: 'Rejected',
    color: 'from-rose-500 to-red-500',
    icon: Shield,
    bgColor: 'bg-black',
    textColor: 'text-rose-700 dark:text-rose-400'
  }
};

const reviewTypeIcons = {
  hotel: '🏨',
  activity: '🎯',
  flight: '✈️',
  destination: '📍',
  restaurant: '🍽️',
  tour: '🗺️'
};

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchError, setFetchError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const fetchMyReviews = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (filter !== 'all') params.set('status', filter);
      params.set('sort', sortBy);

      const url = `${API_BASE.replace(/\/$/, '')}/api/reviews/mine?${params.toString()}`;
      const res = await axios.get(url, { headers: getAuthHeaders() });

      const data = res.data || {};
      const list = data.reviews || data.data?.reviews || data.data || [];
      setReviews(Array.isArray(list) ? list : []);
      
      if (data.pagination?.total_pages) {
        setTotalPages(data.pagination.total_pages);
      } else if (data.pagination?.total) {
        setTotalPages(Math.ceil(data.pagination.total / limit));
      } else {
        setTotalPages(1);
      }
      
      toast.success('Reviews loaded successfully');
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      
      const resp = err?.response;
      let serverMsg = resp?.data?.message || resp?.statusText || err?.message || 'Network error';
      
      toast.error(`Failed to load reviews: ${serverMsg}`);
      setFetchError({
        status: resp?.status,
        message: serverMsg,
        body: resp?.data
      });

      setReviews([]);
      setTotalPages(1);

      if (resp?.status === 401) {
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, filter, sortBy]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const openDetails = (review) => setSelectedReview(review);
  
  // Prevent editing for non-editable statuses (published, rejected, hidden)
  const nonEditableStatuses = new Set(['published', 'rejected', 'hidden']);
  const openEdit = (review) => {
    const status = String(review.status || '').toLowerCase();
    if (status === 'published') {
      toast.error('Published reviews cannot be edited');
      return;
    }
    if (nonEditableStatuses.has(status)) {
      toast.error('This review cannot be edited.');
      return;
    }
    setEditingReview(review);
  };

  const onSaved = (updatedReview) => {
    setReviews((prev) => prev.map((r) => (r.review_id === updatedReview.review_id ? updatedReview : r)));
    setEditingReview(null);
    toast.success('Review updated successfully');
  };

  const getStatusConfig = (status) => statusConfig[status] || statusConfig.draft;
  const getReviewIcon = (type) => reviewTypeIcons[type] || '📝';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'}`}
          />
        ))}
      </div>
    );
  };

  const filters = [
    { id: 'all', label: 'All Reviews', count: reviews.length },
    { id: 'published', label: 'Published', count: reviews.filter(r => r.status === 'published').length },
    { id: 'pending', label: 'Pending', count: reviews.filter(r => r.status === 'pending').length },
    { id: 'draft', label: 'Drafts', count: reviews.filter(r => r.status === 'draft').length },
    { id: 'hidden', label: 'Hidden', count: reviews.filter(r => r.status === 'hidden').length },
    { id: 'rejected', label: 'Rejected', count: reviews.filter(r => r.status === 'rejected').length },
  ];

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-40"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (fetchError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center"
      >
        <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Failed to Load Reviews
        </h3>
        <p className="text-red-700 dark:text-red-400 mb-4">
          {fetchError.message || 'Unable to load your reviews at this time.'}
        </p>
        <button
          onClick={fetchMyReviews}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // Empty State
  if (!reviews.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No reviews yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Share your experiences and help other travelers make informed decisions. Your reviews matter!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <MessageSquare className="w-5 h-5" />
          Write Your First Review
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filterItem) => (
              <motion.button
                key={filterItem.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterItem.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  filter === filterItem.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filterItem.label}
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === filterItem.id
                    ? 'bg-white/20'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  {filterItem.count}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">{filteredReviews.length}</span> of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredReviews.map((review, index) => {
            const status = getStatusConfig(review.status);
            const StatusIcon = status.icon;
            const reviewIcon = getReviewIcon(review.booking_type || review.context?.type);
            
            return (
              <motion.div
                key={review.review_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Review Header */}
                <div className={`p-6 bg-gradient-to-r ${status.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{reviewIcon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.bgColor} ${status.textColor}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white mt-2 line-clamp-1">
                          {review.title || review.subject || 'Untitled Review'}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating || 0)}
                      <span className="text-white font-medium ml-2">{review.rating || 0}.0</span>
                    </div>
                    <div className="text-white/80 text-sm flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{(review.up_count || 0) - (review.down_count || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm leading-relaxed">
                        {review.content || 'No review content available.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {review.context?.name || 'Anonymous'}
                      </div>
                    </div>

                    {/* Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {review.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDetails(review)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEdit(review)}
                      disabled={String(review.status || '').toLowerCase() === 'published' || nonEditableStatuses.has(String(review.status || '').toLowerCase())}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                        String(review.status || '').toLowerCase() === 'published' || nonEditableStatuses.has(String(review.status || '').toLowerCase())
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg'
                      }`}
                      title={String(review.status || '').toLowerCase() === 'published' ? 'Published reviews cannot be edited' : 'Edit review'}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">{filteredReviews.length}</span> reviews
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`p-2 rounded-xl flex items-center gap-2 cursor-pointer ${
              page === 1
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </motion.button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`p-2 rounded-xl flex items-center gap-2 cursor-pointer ${
              page >= totalPages
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Review Impact */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Your Reviews Make a Difference</h4>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                Thank you for sharing your experiences! Your honest feedback helps other travelers make better decisions.
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {reviews.filter(r => r.status === 'published').length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Published Reviews</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedReview && (
        <ReviewDetailsModal 
          review={selectedReview} 
          onClose={() => { setSelectedReview(null); fetchMyReviews(); }} 
        />
      )}
      {editingReview && (
        <EditReviewModal 
          review={editingReview} 
          onClose={() => setEditingReview(null)} 
          onSaved={onSaved}
        />
      )}
    </div>
  );
}