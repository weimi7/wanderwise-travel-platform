'use client';
import { useEffect, useMemo, useState, forwardRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X, CreditCard, Calendar, User, CheckCircle, Download, Copy, Shield, Lock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BookingSummary from './BookingSummary';
import toast from 'react-hot-toast';
import ResendBookingButton from './ResendBookingButton';

function validateCard({ card_type, card_number, expiry, cvc }) {
  const cn = card_number?.replace(/[\s-]/g, '');
  const okNum = /^\d{13,19}$/.test(cn);
  const okExpiry = /^\d{2}\/\d{2}$/.test(expiry);
  const okCvc = /^\d{3,4}$/.test(cvc);
  const okCardType = /^(Visa|Master|Amex|Discover|JCB|Diners)$/i.test(card_type);
  return okNum && okExpiry && okCvc && okCardType;
}

const paymentIcons = {
  Visa: '/icons/visa.svg',
  Master: '/icons/mastercard.svg',
  Amex: '/icons/amex.svg',
  Discover: '/icons/discover.svg',
  JCB: '/icons/jcb.svg',
  Diners: '/icons/diners.svg',
};

// Use configured API base (frontend fallback to localhost if not set)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function BookingModal({ open, onClose, bookingContext, prefill = {} }) {
  const [step, setStep] = useState(1); // 1 details, 2 payment, 3 review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    quantity: 1,
    guests: 1,
    contact_name: prefill.full_name || '',
    contact_email: prefill.email || '',
    contact_phone: '',
    payment_method: 'card',
    payment: {
      card_type: 'Visa',
      card_number: '',
      expiry: '',
      cvc: '',
      card_holder: prefill.full_name || ''
    }
  });

  // Saved cards state
  const [savedCards, setSavedCards] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState(null);

  // Save card option (checkbox)
  const [saveCard, setSaveCard] = useState(false);
  // Is user authenticated? we use this to decide whether saving card is permitted
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Local state for react-datepicker range selection (Date or null)
  const [dateRange, setDateRange] = useState([null, null]); // [start, end]
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    // Check auth token presence (simple check). You may want to use your AuthContext instead.
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    }
  }, []);

  // Fetch saved cards when modal opens and user is authenticated
  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        setSavedLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setSavedCards([]);
          return;
        }
        const res = await axios.get(`${API_BASE}/api/users/cards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const list = res?.data?.cards || [];
        setSavedCards(list);
      } catch (err) {
        console.error('Failed to fetch saved cards', err);
        setSavedCards([]);
      } finally {
        setSavedLoading(false);
      }
    };

    if (open && isAuthenticated) {
      fetchSavedCards();
    } else {
      setSavedCards([]);
    }
  }, [open, isAuthenticated]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setError('');
      setLoading(false);
      setSuccess(null);
      setDateRange([null, null]);
      setSaveCard(false);
      setUseSavedCard(false);
      setSelectedSavedCardId(null);
      // Clear sensitive payment inputs when modal closes
      setForm(prev => ({
        ...prev,
        payment: { card_type: 'Visa', card_number: '', expiry: '', cvc: '', card_holder: prev.payment.card_holder || '' }
      }));
    } else {
      // Initialize dateRange from form values if present (only when modal opens)
      const s = form.start_date ? new Date(form.start_date) : null;
      const e = form.end_date ? new Date(form.end_date) : null;
      setDateRange([s, e]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep dateRange -> form sync
  useEffect(() => {
    const [s, e] = dateRange;
    const startISO = s ? s.toISOString().split('T')[0] : '';
    const endISO = e ? e.toISOString().split('T')[0] : '';
    setForm(prev => ({ ...prev, start_date: startISO, end_date: endISO }));
  }, [dateRange]);

  const pricePerUnit = bookingContext?.pricePerUnit || bookingContext?.reference?.price_per_night || bookingContext?.reference?.min_price || 0;
  
  const totalAmount = useMemo(() => {
    const start = form.start_date ? new Date(form.start_date) : null;
    const end = form.end_date ? new Date(form.end_date) : null;
    let nights = 1;
    if (start && end && end > start) {
      nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    return (pricePerUnit * nights * (form.quantity || 1)).toFixed(2);
  }, [form.start_date, form.end_date, form.quantity, pricePerUnit]);

  if (!open) return null;

  const update = (patch) => setForm(prev => ({ ...prev, ...patch }));

  // Helpers to handle credit card input behavior and avoid browser autofill
  const handleCardNumberChange = (e) => {
    // accept digits only, limit to 19
    const digits = e.target.value.replace(/\D/g, '').slice(0, 19);
    setForm(prev => ({ ...prev, payment: { ...prev.payment, card_number: digits } }));
  };

  const handleExpiryChange = (e) => {
    // allow typing like 0225 -> 02/25
    let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      digits = digits.slice(0,2) + '/' + digits.slice(2);
    }
    setForm(prev => ({ ...prev, payment: { ...prev.payment, expiry: digits } }));
  };

  const handleCvcChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setForm(prev => ({ ...prev, payment: { ...prev.payment, cvc: digits } }));
  };

  // Save card to server for authenticated users
  // NOTE: For production you MUST use a PCI-compliant tokenization flow.
  const saveCardToAccount = async (paymentData) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Please sign in to save a card to your account.');
        return;
      }

      // Prepare payload — send only what's necessary. Backend should handle tokenization.
      const payload = {
        card_type: paymentData.card_type,
        card_holder: paymentData.card_holder,
        expiry: paymentData.expiry,
        card_number: paymentData.card_number, // backend should handle securely; in production prefer tokenization client-side
        last4: (paymentData.card_number || '').slice(-4)
      };

      const res = await axios.post(`${API_BASE}/api/users/cards`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res?.data?.success) {
        toast.success('Card saved to your account');
        // refresh saved cards
        const refreshed = res?.data?.cards || null;
        if (refreshed) setSavedCards(refreshed);
        return true;
      } else {
        toast.error(res?.data?.message || 'Failed to save card');
        return false;
      }
    } catch (err) {
      console.error('Save card error', err);
      const msg = err?.response?.data?.message || 'Error saving card';
      toast.error(msg);
      return false;
    }
  };

  // Fetch saved cards helper (exposed for retry)
  const fetchSavedCards = async () => {
    try {
      setSavedLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setSavedCards([]);
        return;
      }
      const res = await axios.get(`${API_BASE}/api/users/cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res?.data?.cards || [];
      setSavedCards(list);
    } catch (err) {
      console.error('Failed to fetch saved cards', err);
      setSavedCards([]);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1) {
      if (bookingContext.booking_type === 'room') {
        if (!form.start_date || !form.end_date) {
          setError('Please select check-in and check-out dates');
          return;
        }
        if (new Date(form.end_date) <= new Date(form.start_date)) {
          setError('Check-out must be after check-in');
          return;
        }
      }
      if (!form.contact_name || !form.contact_email) {
        setError('Please provide contact name and email');
        return;
      }
    }

    if (step === 2 && form.payment_method === 'card') {
      if (useSavedCard) {
        if (!selectedSavedCardId) {
          setError('Please select a saved card or choose to enter a new card.');
          return;
        }
        if (!/^\d{3,4}$/.test(form.payment.cvc || '')) {
          setError('Please enter the CVC for the saved card.');
          return;
        }
      } else {
        if (!validateCard(form.payment)) {
          setError('Card details are invalid. Please check card type, number, expiry and CVC.');
          return;
        }
      }
    }

    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

const handleSubmit = async () => {
  setError('');
  setLoading(true);

  try {
    // Validate step 3 again before submission
    if (bookingContext.booking_type === 'room') {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (!form.start_date || !form.end_date || end <= start) {
        setError('Check-in and check-out dates are invalid.');
        setStep(1);
        return;
      }
    }
    if (!form.contact_name || !form.contact_email) {
      setError('Please provide contact name and email.');
      setStep(1);
      return;
    }

    // Prepare payment payload
    const paymentPayload = form.payment_method === 'card'
      ? (useSavedCard
          ? { saved_card_id: selectedSavedCardId, cvc: form.payment.cvc }
          : {
              card_type: form.payment.card_type,
              card_holder: form.payment.card_holder,
              expiry: form.payment.expiry,
              last4: form.payment.card_number.slice(-4),
            })
      : {};

    // Calculate nights
    const nights = form.start_date && form.end_date
      ? Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000*60*60*24))
      : 1;

    const payload = {
      user_id: isAuthenticated ? localStorage.getItem('user_id') : null,
      booking_type: bookingContext.booking_type,
      reference_id: bookingContext.reference?.id,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      quantity: form.quantity || 1,
      guests: form.guests || 1,
      total_amount: Number(totalAmount),
      currency: 'USD',
      payment_method: form.payment_method,
      payment: paymentPayload,
      status: 'pending', // default status
      nights,
      unit_price: pricePerUnit,
      meta: {
        context: bookingContext,
        save_card: saveCard,
      },
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axios.post(`${API_BASE}/api/bookings`, payload, { headers });

    if (res.data?.success) {
      setSuccess(res.data.booking);
      setStep(4);
      toast.success('Booking completed successfully!');
      // Optionally save card
      if (saveCard && !useSavedCard && isAuthenticated) {
        await saveCardToAccount(form.payment);
        fetchSavedCards();
      }
      // Clear sensitive fields
      setForm(prev => ({ ...prev, payment: { ...prev.payment, card_number: '', cvc: '' } }));
    } else {
      setError(res.data?.message || 'Booking failed');
      toast.error(res.data?.message || 'Booking failed');
    }

  } catch (err) {
    console.error('Booking submit error', err);
    setError(err?.response?.data?.message || 'Booking failed');
    toast.error(err?.response?.data?.message || 'Booking failed');
  } finally {
    setLoading(false);
  }
};


  const downloadConfirmation = () => {
    if (!success) return;
    const content = `
Booking Confirmation
====================
Booking ID: ${success.booking_id}
Date: ${new Date().toLocaleDateString()}
Type: ${bookingContext.booking_type}
Reference: ${bookingContext.reference.name}

Total Amount: $${totalAmount}
Payment Method: ${form.payment_method}

Contact Details:
- Name: ${form.contact_name}
- Email: ${form.contact_email}
- Phone: ${form.contact_phone}

Thank you for your booking!
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking_${success.booking_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = () => {
    if (!success) return;
    const link = `${window.location.origin}/bookings/${success.booking_id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Booking link copied to clipboard!');
    }).catch(() => {
      toast('Copied to clipboard');
    });
  };

  // Format card number for display (group by 4)
  const formatCardNumber = (num) => {
    return String(num || '').replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  // Masked number for saved cards
  const maskedSavedNumber = (last4) => {
    return `•••• •••• •••• ${last4 || '----'}`;
  };

  // Custom input for the datepicker to match UI (shows range or placeholder)
  const DateRangeButton = forwardRef(({ value, onClick }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          onClick?.(e);
          setCalendarOpen(true);
        }}
        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <Calendar className="absolute left-3 w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-200">{value && value !== '' ? value : 'Select dates'}</span>
      </button>
    );
  });
  DateRangeButton.displayName = 'DateRangeButton';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container - increased max width */}
      <div className="relative z-10 w-full max-w-7xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl">
        {/* Use a 5-column grid on md+: left becomes span-3, summary span-2 (summary wider) */}
        <div className="grid grid-cols-1 md:grid-cols-5 bg-white dark:bg-gray-900">
          {/* Left: Form Section (wider: md:col-span-3) */}
          <div className="md:col-span-3 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Complete Your Booking
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {bookingContext.reference?.name || 'Booking'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= s 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : step === s
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Step Labels */}
            <div className="grid grid-cols-4 mb-8 text-center text-sm">
              <div className={`font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Details</div>
              <div className={`font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Payment</div>
              <div className={`font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Review</div>
              <div className={`font-medium ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>Confirmation</div>
            </div>

            {/* Step 1: Booking Details */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-6">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Booking Details</span>
                </div>

                {bookingContext.booking_type === 'room' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Replaced old native date inputs with a modern range picker (react-datepicker) */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Dates
                      </label>
                      <div className="relative">
                        <DatePicker
                          selectsRange
                          startDate={dateRange[0]}
                          endDate={dateRange[1]}
                          onChange={(update) => {
                            // update is [start, end] or a single Date while selecting
                            setDateRange(update);
                          }}
                          monthsShown={2}
                          minDate={new Date()}
                          dateFormat="MM/dd/yyyy"
                          className="hidden" // hide built-in input, we use customInput for look & feel
                          customInput={<DateRangeButton />}
                          onCalendarOpen={() => setCalendarOpen(true)}
                          onCalendarClose={() => setCalendarOpen(false)}
                          required
                          wrapperClassName="w-full"
                        />
                        {/* Small helper shown below the button for clarity */}
                        <div className="text-xs text-gray-500 mt-2">Tip: drag to select a range or click start and end dates. You can also use the keyboard.</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quantity
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => update({ quantity: Math.max(1, form.quantity - 1) })}
                        className="px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={form.quantity}
                        onChange={(e) => update({ quantity: Number(e.target.value) })}
                        className="w-full px-4 py-3 text-center bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => update({ quantity: form.quantity + 1 })}
                        className="px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.guests}
                      onChange={(e) => update({ guests: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.contact_phone}
                      onChange={(e) => update({ contact_phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <User className="w-5 h-5" />
                    <span className="font-medium">Contact Information</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={form.contact_name}
                        onChange={(e) => update({ contact_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => update({ contact_email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-6">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Payment Method</span>
                </div>

                {/* Hidden dummy autofill fields - placed early to capture browser autofill */}
                <div aria-hidden="true" style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
                  <input name="cc-number" autoComplete="cc-number" defaultValue="" />
                  <input name="cc-exp" autoComplete="cc-exp" defaultValue="" />
                  <input name="cc-csc" autoComplete="cc-csc" defaultValue="" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => { update({ payment_method: 'card' }); }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${form.payment_method === 'card' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'}`}
                    >
                      <CreditCard className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">Card</span>
                    </button>
                    <button
                      onClick={() => { update({ payment_method: 'bank' }); setUseSavedCard(false); }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${form.payment_method === 'bank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'}`}
                    >
                      <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">🏦</div>
                      <span className="text-sm">Bank</span>
                    </button>
                    <button
                      onClick={() => { update({ payment_method: 'cash' }); setUseSavedCard(false); }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${form.payment_method === 'cash' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'}`}
                    >
                      <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">💰</div>
                      <span className="text-sm">Cash</span>
                    </button>
                  </div>
                </div>

                {/* Saved cards selector */}
                {form.payment_method === 'card' && isAuthenticated && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Saved cards</label>

                    {savedLoading ? (
                      <div className="text-sm text-gray-500">Loading saved cards...</div>
                    ) : savedCards && savedCards.length > 0 ? (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {savedCards.map((card) => {
                          const isSelected = selectedSavedCardId === card.id && useSavedCard;
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => {
                                setUseSavedCard(true);
                                setSelectedSavedCardId(card.id);
                                // fill display fields (do not store PAN)
                                setForm(prev => ({ ...prev, payment: { ...prev.payment, card_holder: card.card_holder || prev.payment.card_holder } }));
                              }}
                              className={`min-w-[220px] p-4 rounded-xl shadow-md border transition-all text-left flex flex-col justify-between ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200 dark:border-gray-700'} bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-900`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-xs text-gray-500">Card</div>
                                  <div className="mt-2 font-semibold text-gray-800 dark:text-white">{card.card_type || 'Card'}</div>
                                </div>
                                <div className="text-sm text-gray-500">{card.brand || ''}</div>
                              </div>

                              <div className="mt-4">
                                <div className="font-mono tracking-wider text-lg">{maskedSavedNumber(card.last4)}</div>
                                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                  <div>{card.card_holder || ''}</div>
                                  <div>{card.expiry || ''}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {/* "Use new card" action */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setUseSavedCard(false);
                              setSelectedSavedCardId(null);
                              setForm(prev => ({ ...prev, payment: { ...prev.payment, card_number: '', expiry: '', cvc: '' } }));
                            }}
                            className="min-w-[120px] px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            Use new card
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No saved cards — you can add one after booking.</div>
                    )}
                  </div>
                )}

                {form.payment_method === 'card' && (
                  <>
                    {/* Card form - only required when not using a saved card */}
                    {!useSavedCard && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Card Holder Name
                            </label>
                            <input
                              type="text"
                              autoComplete="cc-name"
                              value={form.payment.card_holder}
                              onChange={(e) => setForm(prev => ({ ...prev, payment: { ...prev.payment, card_holder: e.target.value } }))}
                              placeholder="John Doe"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Card Type
                            </label>
                            <select
                              value={form.payment.card_type}
                              onChange={(e) => setForm(prev => ({ ...prev, payment: { ...prev.payment, card_type: e.target.value } }))}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                            >
                              <option>Visa</option>
                              <option>Master</option>
                              <option>Amex</option>
                              <option>Discover</option>
                              <option>JCB</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Card Number
                          </label>
                          <input
                            name="card-number-visible"
                            autoComplete="off"
                            inputMode="numeric"
                            placeholder="1234 5678 9012 3456"
                            value={formatCardNumber(form.payment.card_number)}
                            onChange={handleCardNumberChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                            maxLength="23"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Expiry Date (MM/YY)
                            </label>
                            <input
                              name="card-expiry-visible"
                              autoComplete="off"
                              inputMode="numeric"
                              placeholder="MM/YY"
                              value={form.payment.expiry}
                              onChange={handleExpiryChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              maxLength="5"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Security Code (CVC)
                            </label>
                            <div className="relative">
                              <input
                                name="card-cvc-visible"
                                autoComplete="off"
                                inputMode="numeric"
                                placeholder="123"
                                type="password"
                                value={form.payment.cvc}
                                onChange={handleCvcChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                maxLength="4"
                              />
                              <Shield className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        {/* Save card option */}
                        <div className="flex items-start gap-3">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              className="form-checkbox h-5 w-5 text-blue-600 rounded"
                              disabled={!isAuthenticated}
                            />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                              Save card to my account for future bookings
                            </span>
                          </label>
                          {!isAuthenticated && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Sign in to save cards to your account.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* If user selected a saved card, still require CVC */}
                    {useSavedCard && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enter CVC for selected card
                        </label>
                        <input
                          name="saved-card-cvc"
                          autoComplete="off"
                          inputMode="numeric"
                          placeholder="123"
                          type="password"
                          value={form.payment.cvc}
                          onChange={handleCvcChange}
                          className="w-40 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          maxLength="4"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Lock className="w-4 h-4" />
                      <span>Your payment is secured with 256-bit SSL encryption</span>
                    </div>
                  </>
                )}

                {form.payment_method !== 'card' && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      {form.payment_method === 'bank' ? 'Bank Transfer Instructions' : 'Pay at Property'}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      {form.payment_method === 'bank' 
                        ? 'After booking, you will receive detailed bank transfer instructions via email. Your booking will be confirmed once payment is received.'
                        : 'Please bring your booking confirmation and pay directly at the property upon arrival. Your booking will be held for 24 hours.'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Ready to Confirm
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please review all details before finalizing your booking
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">${totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="font-medium text-gray-800 dark:text-white capitalize">{form.payment_method}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Contact Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="text-sm">
                        <p className="text-gray-500 dark:text-gray-400">Name</p>
                        <p className="font-medium">{form.contact_name}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium">{form.contact_email}</p>
                      </div>
                    </div>
                  </div>

                  {bookingContext.booking_type === 'room' && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Stay Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-sm">
                          <p className="text-gray-500 dark:text-gray-400">Check-in</p>
                          <p className="font-medium">{form.start_date}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-500 dark:text-gray-400">Check-out</p>
                          <p className="font-medium">{form.end_date}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Your booking has been successfully processed
                </p>
                <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg mb-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                  <p className="font-mono font-bold text-gray-800 dark:text-white">{success.booking_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <button
                    onClick={downloadConfirmation}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                  A confirmation email has been sent to {form.contact_email}
                </p>
              </motion.div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            {step <= 3 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleBack}
                  className={`px-6 py-3 rounded-lg border transition-all cursor-pointer ${
                    step === 1 
                      ? 'invisible'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Back
                </button>
                
                <button
                  onClick={step === 3 ? handleSubmit : handleNext}
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                  } text-white`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : step === 3 ? (
                    'Confirm & Pay'
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            )}
            <ResendBookingButton bookingId={bookingContext.bookingId} className="mt-4" />
          </div>

          {/* Right: Booking Summary (wider: md:col-span-2) */}
          <div className="md:col-span-2 bg-gradient-to-b from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 border-l border-gray-200 dark:border-gray-800">
            <div className="sticky top-8">
              <BookingSummary
                context={bookingContext}
                form={form}
                totalAmount={totalAmount}
              />
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}