'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  User,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminBookingDetailsModal from './AdminBookingDetailsModal';

// Toast component
const Toast = ({ message, type = 'info', duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration - 250);
    return () => clearTimeout(timer);
  }, [duration]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white'
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 ${typeStyles[type]}`}
        >
          <div className="flex items-center gap-2">
            {type === 'success' && <CheckCircle className="w-5 h-5" />}
            {type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminBookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [q, setQ] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('payment_status', paymentFilter);
      if (typeFilter !== 'all') params.set('booking_type', typeFilter);
      if (q.trim()) params.set('q', q.trim());

      const url = `${API_BASE.replace(/\/$/, '')}/api/admin/bookings?${params.toString()}`;
      const res = await axios.get(url, { headers: getAuthHeaders() });
      setBookings(res.data.bookings || []);
      if (res.data.pagination && res.data.pagination.totalPages) {
        setTotalPages(res.data.pagination.totalPages);
      } else {
        if (res.data.pagination && res.data.pagination.total) {
          const t = Math.ceil(res.data.pagination.total / limit);
          setTotalPages(t || 1);
        } else {
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error('Failed to load admin bookings', err?.response || err);
      showToast(err?.response?.data?.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, paymentFilter, typeFilter, q]);

  const refresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchBookings();
  };

  const updateBooking = async (id, payload) => {
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/admin/bookings/${id}/status`;
      await axios.post(url, payload, { headers: getAuthHeaders() });
      showToast('Booking updated successfully', 'success');
      fetchBookings();
    } catch (err) {
      console.error('Update booking failed', err?.response || err);
      showToast(err?.response?.data?.message || 'Failed to update booking', 'error');
    }
  };

  const exportBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('payment_status', paymentFilter);
      if (typeFilter !== 'all') params.set('booking_type', typeFilter);
      if (q.trim()) params.set('q', q.trim());

      const url = `${API_BASE.replace(/\/$/, '')}/api/admin/bookings/export?${params.toString()}`;
      const res = await axios.get(url, {
        headers: getAuthHeaders(),
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast('Export completed successfully', 'success');
    } catch (err) {
      console.error('Export failed', err);
      showToast('Failed to export bookings', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setTypeFilter('all');
    setQ('');
    setPage(1);
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Booking Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {bookings.length} bookings • Page {page} of {totalPages}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={refresh}
                disabled={loading || isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportBookings}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </motion.button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="room">Room</option>
              <option value="activity">Activity</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {bookings.length} of {totalPages * limit} bookings
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading bookings...</p>
          </div>
        )}

        {/* Table */}
        {!loading && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Booking</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking, index) => (
                  <motion.tr
                    key={booking.booking_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          #{booking.booking_id}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Ref: {booking.reference_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {booking.actor_name || booking.user_id || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {booking.booking_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-gray-800 dark:text-white">
                          ${booking.total_amount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(booking.payment_status)}`}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedBooking(booking)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </motion.button>
                        
                        {booking.status !== 'confirmed' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateBooking(booking.booking_id, { status: 'confirmed' })}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-xs"
                            title="Confirm Booking"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        {booking.payment_status !== 'paid' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateBooking(booking.booking_id, { payment_status: 'paid' })}
                            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-xs"
                            title="Mark as Paid"
                          >
                            <CreditCard className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        {booking.status !== 'cancelled' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateBooking(booking.booking_id, { status: 'cancelled' })}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-xs"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No bookings found</h4>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {q || statusFilter !== 'all' || paymentFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No bookings have been made yet.'}
            </p>
            {(q || statusFilter !== 'all' || paymentFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {bookings.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing page {page} of {totalPages} • {bookings.length} records
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
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <AdminBookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onUpdated={() => { setSelectedBooking(null); fetchBookings(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}