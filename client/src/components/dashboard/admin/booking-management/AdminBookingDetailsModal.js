'use client';

import { useEffect, useState } from 'react';
import { 
  X, Download, Clipboard, CheckCircle, XCircle, Clock, 
  User, Calendar, DollarSign, FileText, CreditCard, 
  TrendingUp, Building, Users, Hash, Globe, Mail,
  Phone, MapPin, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Enhanced Toast Component
const Toast = ({ message, type = 'info', duration = 2500, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: { bg: 'bg-green-500', icon: CheckCircle },
    error: { bg: 'bg-red-500', icon: XCircle },
    info: { bg: 'bg-blue-500', icon: AlertCircle },
    warning: { bg: 'bg-yellow-500', icon: AlertCircle }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 ${config.bg} text-white flex items-center gap-3`}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{message}</span>
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

export default function AdminBookingDetailsModal({ booking, onClose, onUpdated }) {
  const [status, setStatus] = useState(booking.status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(booking.payment_status || 'pending');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setStatus(booking.status || 'pending');
    setPaymentStatus(booking.payment_status || 'pending');
  }, [booking]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const downloadJson = () => {
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
      showToast('Booking data downloaded successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to download booking data', 'error');
    }
  };

  const copyBookingLink = async () => {
    try {
      const link = `${window.location.origin}/bookings/${booking.booking_id}`;
      await navigator.clipboard.writeText(link);
      showToast('Booking link copied to clipboard', 'success');
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(booking.booking_id);
      showToast('Booking ID copied to clipboard', 'success');
    } catch (err) {
      showToast('Failed to copy ID', 'error');
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/admin/bookings/${booking.booking_id}/status`;
      await axios.post(url, { status, payment_status: paymentStatus }, { headers: getAuthHeaders() });
      showToast('Booking updated successfully', 'success');
      onUpdated && onUpdated();
    } catch (err) {
      console.error('Admin update failed', err?.response || err);
      showToast(err?.response?.data?.message || 'Failed to update booking', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!booking) return null;

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const bookingDate = formatDate(booking.created_at);
  const startDate = formatDate(booking.start_date);
  const endDate = formatDate(booking.end_date);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="mt-15 relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Booking #{booking.booking_id}
                      </h3>
                      <button
                        onClick={copyBookingId}
                        className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Copy Booking ID"
                      >
                        <Clipboard className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created on {bookingDate.date} at {bookingDate.time}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Booking Details */}
                <div className="space-y-6">
                  {/* Booking Info Card */}
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-500" />
                      Booking Information
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Booking Type</p>
                          <p className="font-medium text-gray-800 dark:text-white capitalize">
                            {booking.booking_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference ID</p>
                          <p className="font-medium text-gray-800 dark:text-white font-mono">
                            {booking.reference_id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-xl font-bold text-gray-800 dark:text-white">
                              {booking.total_amount}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {booking.currency || 'USD'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Guests / Quantity</p>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-800 dark:text-white">
                              {booking.guests || booking.quantity || 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Info Card */}
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-500" />
                      User Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {booking.actor_name || booking.user_id || 'Guest User'}
                        </p>
                      </div>
                      {booking.user_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {booking.user_email}
                          </span>
                        </div>
                      )}
                      {booking.user_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {booking.user_phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates Card */}
                  {(booking.start_date || booking.end_date) && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        Booking Dates
                      </h4>
                      <div className="space-y-3">
                        {booking.start_date && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800 dark:text-white">
                                {startDate.date} at {startDate.time}
                              </span>
                            </div>
                          </div>
                        )}
                        {booking.end_date && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800 dark:text-white">
                                {endDate.date} at {endDate.time}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Status & Actions */}
                <div className="space-y-6">
                  {/* Status Management Card */}
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Status Management
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Booking Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            Current: {status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Payment Status
                        </label>
                        <select
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(paymentStatus)}`}>
                            Current: {paymentStatus}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={saveChanges}
                        disabled={saving}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {saving ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving Changes...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Payment Details Card */}
                  {booking.payment_details && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-500" />
                        Payment Details
                      </h4>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-60">
                        <pre className="text-sm text-gray-300">
                          {typeof booking.payment_details === 'string' 
                            ? booking.payment_details 
                            : JSON.stringify(booking.payment_details, null, 2)
                          }
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions Card */}
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-purple-500" />
                      Quick Actions
                    </h4>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={copyBookingLink}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                      >
                        <Clipboard className="w-4 h-4" />
                        Copy Booking Link
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadJson}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Export as JSON
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {booking.updated_at ? formatDate(booking.updated_at).date : 'Never'}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}