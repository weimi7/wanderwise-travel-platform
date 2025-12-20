'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import BookingDetailsModal from './BookingDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Filter, Search, Download, Eye, 
  Clock, CheckCircle, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, MoreVertical,
  Hotel, Plane, Activity, MapPin, Users,
  FileText, Share2, ExternalLink, RefreshCw
} from 'lucide-react';

// Enhanced toast function
function showToast(message, type = 'success', duration = 3000) {
  if (typeof window === 'undefined') return;
  const existing = document.getElementById('booking-list-toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'booking-list-toast';
  el.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[99999] px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm flex items-center gap-3 transition-all duration-300 ${
    type === 'success' 
      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
      : type === 'error'
      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
  }`;
  el.innerHTML = `
    <div class="flex items-center gap-2">
      ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ⓘ'}
      <span class="font-medium">${message}</span>
    </div>
  `;
  
  el.style.opacity = '0';
  el.style.transform = 'translateX(-50%) translateY(20px)';
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const statusConfig = {
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-gradient-to-r from-emerald-500 to-green-500',
    icon: CheckCircle,
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-700 dark:text-emerald-400'
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
    icon: Clock,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700 dark:text-amber-400'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gradient-to-r from-red-500 to-rose-500',
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-400'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    icon: CheckCircle,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-400'
  }
};

const bookingTypeIcon = {
  room: { icon: Hotel, label: 'Hotel', color: 'from-blue-500 to-cyan-500' },
  flight: { icon: Plane, label: 'Flight', color: 'from-purple-500 to-pink-500' },
  activity: { icon: Activity, label: 'Activity', color: 'from-emerald-500 to-green-500' }
};

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sort', sortBy);

      const base = API_BASE || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/bookings?${params.toString()}`;

      const res = await axios.get(url, { headers: getAuthHeaders() });
      setBookings(res.data.bookings || []);
      if (res.data.pagination && res.data.pagination.totalPages) {
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
      showToast('Bookings loaded successfully', 'success');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Not authorized. Please log in.');
          showToast('Not authorized. Please log in.', 'error');
        } else if (err.response?.status === 404) {
          setError('Bookings API not found (404)');
          showToast('Bookings API not found', 'error');
        } else {
          setError(err.response?.data?.message || 'Failed to load bookings');
          showToast(err.response?.data?.message || 'Failed to load bookings', 'error');
        }
      } else {
        setError('Failed to load bookings');
        showToast('Failed to load bookings', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = () => {
    fetchBookings();
    showToast('Refreshing bookings...', 'info');
  };

  const openDetails = (booking) => {
    setSelected(booking);
  };

  const onCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const base = API_BASE || 'http://localhost:5000';
      await axios.put(`${base}/api/bookings/${bookingId}/cancel`, {}, { headers: getAuthHeaders() });
      
      setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b));
      showToast('Booking cancelled successfully', 'success');
    } catch (err) {
      showToast('Failed to cancel booking', 'error');
    }
  };

  const downloadBooking = (booking) => {
    try {
      const dataStr = JSON.stringify(booking, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking_${booking.booking_id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Booking downloaded', 'success');
    } catch (err) {
      showToast('Failed to download', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => statusConfig[status] || statusConfig.pending;
  const getBookingType = (type) => bookingTypeIcon[type] || { icon: Calendar, label: 'Booking', color: 'from-gray-500 to-gray-700' };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">All Bookings</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage and review all your travel bookings
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchBookings()}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Most Recent</option>
                <option value="start_date">Check-in Date</option>
                <option value="total_amount:desc">Price: High to Low</option>
                <option value="total_amount:asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-48"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">{error}</h3>
          <p className="text-red-700 dark:text-red-400 mb-4">
            Please check your connection or try again later.
          </p>
          <button
            onClick={fetchBookings}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No bookings found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            {statusFilter === 'all'
              ? "You haven't made any bookings yet. Start planning your next adventure!"
              : `No ${statusFilter} bookings match your current filters.`}
          </p>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              View All Bookings
            </button>
          )}
        </motion.div>
      )}

      {/* Bookings Grid */}
      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking, index) => {
              const status = getStatusConfig(booking.status);
              const bookingType = getBookingType(booking.booking_type);
              const TypeIcon = bookingType.icon;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={booking.booking_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 cursor-pointer"
                  onClick={() => openDetails(booking)}
                >
                  {/* Booking Header */}
                  <div className={`p-6 bg-gradient-to-r ${bookingType.color}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white/90">
                          {bookingType.label}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.bgColor} ${status.textColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-2">Booking #{booking.booking_id}</h4>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(booking.created_at)}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                          <p className="font-medium text-gray-800 dark:text-white">{booking.reference_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {booking.currency || 'USD'} {parseFloat(booking.total_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {booking.start_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(booking.start_date)}
                            {booking.end_date && ` → ${formatDate(booking.end_date)}`}
                          </span>
                        </div>
                      )}

                      {booking.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 truncate">{booking.location}</span>
                        </div>
                      )}

                      {booking.guests && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{booking.guests} guests</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetails(booking);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadBooking(booking);
                        }}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>

                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelBooking(booking.booking_id);
                          }}
                          className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-gray-700 dark:text-gray-300">{bookings.length}</span> of many bookings
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
        </>
      )}

      {/* Booking Details Modal */}
      {selected && (
        <BookingDetailsModal 
          booking={selected} 
          onClose={() => setSelected(null)} 
          onBookingUpdated={fetchBookings}
        />
      )}
    </div>
  );
}