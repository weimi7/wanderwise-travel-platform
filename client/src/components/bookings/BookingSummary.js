'use client';
import { Calendar, Users, Package, CreditCard, Shield, Tag, Star } from 'lucide-react';

export default function BookingSummary({ context, form, totalAmount }) {
  const nights = (() => {
    if (!form.start_date || !form.end_date) return 1;
    const s = new Date(form.start_date);
    const e = new Date(form.end_date);
    if (e <= s) return 1;
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  })();

  const subtotal = Number(totalAmount) || 0;
  const taxes = subtotal * 0.07;
  const total = subtotal + taxes;

  // Calculate per night price for rooms
  const perNightPrice = context.booking_type === 'room' && nights > 0 ? subtotal / nights : 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Booking Summary</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review your order details</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Item Details Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              {context.reference.name || context.reference.title || 'Premium Booking'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                context.booking_type === 'room' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }`}>
                {context.booking_type === 'room' ? '⭐ Premium Room' : '🎯 Featured Activity'}
              </span>
              {context.reference.rating && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ★ {context.reference.rating}/5
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Duration</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {context.booking_type === 'room' ? `${nights} night${nights !== 1 ? 's' : ''}` : 'One-time'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">Guests</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {form.guests || 1} {form.guests === 1 ? 'guest' : 'guests'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4" />
            <span className="text-sm">Quantity</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {form.quantity || 1} unit{form.quantity !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Dates Card - Only for Rooms */}
      {context.booking_type === 'room' && (form.start_date || form.end_date) && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check-in</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                {form.start_date ? new Date(form.start_date).getDate() : '--'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {form.start_date ? new Date(form.start_date).toLocaleDateString('en-US', { month: 'short' }) : '---'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check-out</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                {form.end_date ? new Date(form.end_date).getDate() : '--'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {form.end_date ? new Date(form.end_date).toLocaleDateString('en-US', { month: 'short' }) : '---'}
              </div>
            </div>
          </div>
          <div className="text-center mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              {nights} night{nights !== 1 ? 's' : ''} stay
            </span>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Price Breakdown</h4>
        
        {context.booking_type === 'room' && perNightPrice > 0 && (
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Per night</span>
              <span className="font-medium">${perNightPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">× {nights} night{nights !== 1 ? 's' : ''}</span>
              <span className="font-medium">× {nights}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Taxes & Fees</span>
              <Tag className="w-3 h-3 text-gray-400" />
            </div>
            <span className="font-medium">${taxes.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Total</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="p-2 bg-white dark:bg-gray-700 rounded">
          <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-white">Secure Payment</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Encrypted & protected</p>
        </div>
        <Shield className="w-5 h-5 text-green-500" />
      </div>

      {/* Bottom Note */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can modify your booking up to 24 hours before check-in. 
            Full refund available for cancellations made at least 48 hours in advance.
          </p>
        </div>
      </div>
    </div>
  );
}