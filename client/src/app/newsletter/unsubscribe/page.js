'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  BellOff, 
  ArrowLeft, 
  Home, 
  Heart, 
  Sparkles, 
  Shield,
  Users,
  Calendar,
  Globe,
  TrendingDown
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (emailParam) {
      toast.success('Email detected from link. You can review before unsubscribing.');
    }
  }, [emailParam]);

  const unsubscribeReasons = [
    { id: 'too-frequent', label: 'Too many emails', icon: BellOff },
    { id: 'irrelevant', label: 'Content not relevant', icon: Heart },
    { id: 'privacy', label: 'Privacy concerns', icon: Shield },
    { id: 'other', label: 'Other reason', icon: AlertCircle }
  ];

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          reason: selectedReason,
          feedback 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Successfully unsubscribed');
        setIsUnsubscribed(true);
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubscribe = async () => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Successfully resubscribed!');
        router.push('/');
      } else {
        toast.error(data.message || 'Failed to resubscribe');
      }
    } catch (error) {
      console.error('Resubscribe error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-rose-900/20">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.1)',
          },
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: [0, 360],
              x: ['0%', '100%', '0%'],
              y: ['0%', '50%', '0%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-rose-200 to-pink-200 dark:from-rose-900/30 dark:to-pink-900/30 rounded-full blur-3xl opacity-40"
          />
        </div>

        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Decorative Header */}
          <div className="h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />

          <div className="p-8 md:p-12">
            {isUnsubscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
              >
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="relative"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"
                  />
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Successfully Unsubscribed
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    You&apos;ve been removed from our mailing list.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    We appreciate the time you spent with us.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Calendar, label: 'Last email', value: 'Today' },
                    { icon: TrendingDown, label: 'Status', value: 'Inactive' },
                    { icon: Users, label: 'Community', value: '25K+' },
                    { icon: Globe, label: 'Reach', value: 'Global' },
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <stat.icon className="w-4 h-4 text-rose-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/')}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all cursor-pointer group"
                  >
                    <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Return Home
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResubscribe}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Resubscribe
                      </>
                    )}
                  </motion.button>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  Redirecting to homepage in 3 seconds...
                </motion.p>
              </motion.div>
            ) : (
              <>
                {/* Back Button */}
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Go Back
                </button>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Form */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl">
                        <BellOff className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Manage Subscriptions
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Control your email preferences
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUnsubscribe} className="space-y-6">
                      {/* Email Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                            required
                          />
                        </div>
                        {emailParam && (
                          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Email auto-filled from your link
                          </p>
                        )}
                      </div>

                      {/* Reason Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Why are you unsubscribing? (Optional)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {unsubscribeReasons.map((reason) => {
                            const Icon = reason.icon;
                            return (
                              <motion.button
                                key={reason.id}
                                type="button"
                                onClick={() => setSelectedReason(reason.id)}
                                whileTap={{ scale: 0.95 }}
                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                  selectedReason === reason.id
                                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                              >
                                <Icon className={`w-5 h-5 ${
                                  selectedReason === reason.id ? 'text-rose-500' : 'text-gray-400'
                                }`} />
                                <span className={`text-sm font-medium ${
                                  selectedReason === reason.id 
                                    ? 'text-rose-700 dark:text-rose-400' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {reason.label}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Feedback */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Additional feedback (Optional)
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Help us improve our newsletter..."
                          rows="3"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <BellOff className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Unsubscribe from Newsletter
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>

                  {/* Right Column - Info */}
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                        <div>
                          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                            Before You Go...
                          </h3>
                          <p className="text-blue-700 dark:text-blue-400 text-sm">
                            Consider adjusting your preferences instead of unsubscribing completely.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/settings/notifications')}
                        className="w-full py-3 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all cursor-pointer"
                      >
                        Manage Email Preferences
                      </button>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3">What You&apos;ll Miss</h4>
                      <ul className="space-y-3">
                        {[
                          'Weekly travel inspiration & deals',
                          'Exclusive member discounts',
                          'Destination spotlights',
                          'Travel tips & guides',
                          'Community stories'
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            <strong>Note:</strong> Unsubscribing may take up to 48 hours to process. You might still receive emails already scheduled for delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                <p>Need help? <a href="mailto:support@wanderwise.com" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</a></p>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                <p>© {new Date().getFullYear()} WanderWise. Your privacy is important to us.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-900 dark:to-rose-900/20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-rose-200 dark:border-rose-700 border-t-rose-500 dark:border-t-rose-400 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading unsubscribe form...</p>
        </div>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  );
}