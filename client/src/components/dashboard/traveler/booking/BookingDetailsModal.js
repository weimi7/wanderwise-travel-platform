'use client';

import { useEffect } from 'react';
import { X, Download, Link as LinkIcon, Clipboard, Calendar, Users, CreditCard, MapPin, Clock, CheckCircle, AlertCircle, Building, Activity, Plane, Hotel, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced toast function with better styling
function showToast(message, type = 'success', duration = 3000) {
  if (typeof window === 'undefined') return;
  const existing = document.getElementById('booking-toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'booking-toast';
  el.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[99999] px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 transition-all duration-300 ${
    type === 'success' 
      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
  }`;
  el.innerHTML = `
    <div class="flex items-center gap-2">
      ${type === 'success' ? '✓' : '✗'}
      <span>${message}</span>
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

export default function BookingDetailsModal({ booking, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!booking) return null;

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
      icon: AlertCircle,
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
    room: Hotel,
    activity: Activity,
    flight: Plane,
    default: Calendar
  };

  const getStatusConfig = (status) => statusConfig[status] || statusConfig.confirmed;
  const getBookingIcon = (type) => bookingTypeIcon[type] || bookingTypeIcon.default;
  const BookingIcon = getBookingIcon(booking.booking_type);
  const StatusIcon = getStatusConfig(booking.status).icon;

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
      showToast('Booking details downloaded', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to download', 'error');
    }
  };

  const copyShareLink = async () => {
    try {
      const link = `${window.location.origin}/bookings/${booking.booking_id}`;
      await navigator.clipboard.writeText(link);
      showToast('Share link copied to clipboard', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to copy link', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
        >
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
            <div className="absolute top-4 right-4">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <BookingIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    #{booking.booking_id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusConfig(booking.status).bgColor} ${getStatusConfig(booking.status).textColor}`}>
                    <StatusIcon className="w-3 h-3" />
                    {getStatusConfig(booking.status).label}
                  </span>
                </div>
                <h3 className="text-2xl font-bold">
                  {booking.booking_type === 'room' ? 'Hotel Reservation' : 
                   booking.booking_type === 'flight' ? 'Flight Booking' :
                   booking.booking_type === 'activity' ? 'Activity Booking' : 'Booking'}
                </h3>
                <p className="text-blue-100 mt-1">Created {formatDateTime(booking.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {booking.currency || 'USD'} {parseFloat(booking.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                      <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Guests</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {booking.guests || booking.quantity || 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {booking.start_date && booking.end_date ? 
                          `${Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} days` : 
                          '1 day'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Dates Section */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Booking Dates
                    </h4>
                    <div className="space-y-4">
                      {booking.start_date && (
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-xl">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Check-in / Start</p>
                            <p className="font-medium">{formatDate(booking.start_date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                            <p className="font-medium">14:00</p>
                          </div>
                        </div>
                      )}
                      {booking.end_date && (
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-xl">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Check-out / End</p>
                            <p className="font-medium">{formatDate(booking.end_date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                            <p className="font-medium">11:00</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Contact Name</p>
                        <p className="font-medium">{booking.contact_name || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium">{booking.contact_email || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium">{booking.contact_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Payment Information */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                          <p className="font-medium">{booking.payment_status || 'Pending'}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Method</p>
                          <p className="font-medium">{booking.payment_method || 'Card'}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Reference</p>
                        <p className="font-medium font-mono text-sm">{booking.reference_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location / Property */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location Details
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Property / Activity</p>
                        <p className="font-medium">{booking.item || booking.name || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                        <p className="font-medium">{booking.location || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Room / Unit</p>
                        <p className="font-medium">{booking.room_type || booking.unit || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes / Metadata */}
              {(booking.notes || booking.meta) && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Additional Notes</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {booking.notes || JSON.stringify(booking.meta || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyShareLink}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <LinkIcon className="w-5 h-5" />
                  Share Booking
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadJson}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Download Details
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <QrCode className="w-5 h-5" />
                  View QR Code
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {formatDateTime(booking.updated_at || booking.created_at)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Need help? Contact support</span>
                <span className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">24/7 Help Desk</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}