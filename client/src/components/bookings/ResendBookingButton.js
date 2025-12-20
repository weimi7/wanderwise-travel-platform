'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * ResendBookingButton
 *
 * Props:
 * - bookingId (string) - required
 * - className (string) - optional additional class names for the button
 * - onSuccess (fn) - optional callback invoked when resend succeeds
 *
 * Example:
 * <ResendBookingButton bookingId={booking.booking_id} onSuccess={() => refetchBookings()} />
 */
export default function ResendBookingButton({ bookingId, className = '', onSuccess } = {}) {
  const [isLoading, setIsLoading] = useState(false);

  if (!bookingId) {
    return null;
  }

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const url = `${apiBase.replace(/\/$/, '')}/api/email/resend-booking`;

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const message = data?.message || 'Failed to resend booking confirmation';
        toast.error(message);
        setIsLoading(false);
        return;
      }

      toast.success(data.message || 'Booking confirmation resent');
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      console.error('Resend booking error', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:opacity-95 disabled:opacity-60 ${className}`}
      aria-label="Resend booking confirmation"
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
          <span className="text-sm">Resending...</span>
        </>
      ) : (
        <span className="text-sm">Resend confirmation</span>
      )}
    </button>
  );
}