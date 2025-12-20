'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Key, Shield, Zap, Sparkles, Heart } from 'lucide-react';
import toast from 'react-hot-toast';


function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cooldown state (seconds remaining). Default 0 = no cooldown
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const cooldownRef = useRef(null);

  const COOLDOWN_SECONDS = 60; // 60s cooldown for resend

  // Start cooldown timer
  const startCooldown = (secs = COOLDOWN_SECONDS) => {
    setCooldownSecs(secs);

    // Clear any existing interval
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }

    cooldownRef.current = setInterval(() => {
      setCooldownSecs((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Helper to format seconds -> MM:SS
  const formatSecs = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Core submit function (used for initial send and resend)
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleaned = String(email || '').trim().toLowerCase();
    if (!isValidEmail(cleaned)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // If cooldown active, prevent sending
    if (cooldownSecs > 0) {
      toast('Please wait before requesting another reset email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleaned })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setIsSubmitted(true);
        startCooldown(); // start cooldown after a successful request
        toast.success(data?.message || 'If an account exists, we sent reset instructions.');
      } else {
        // If server responded with error, still start cooldown to avoid rapid retry
        startCooldown();
        const text = await res.text().catch(() => '');
        console.warn('Forgot password server responded:', res.status, text);
        setIsSubmitted(true);
        toast.success('If an account exists, we sent reset instructions.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend handler hooks into handleSubmit but respects cooldown
  const handleResend = async () => {
    if (cooldownSecs > 0) {
      toast('Please wait before requesting another email.');
      return;
    }
    await handleSubmit();
  };

  const handleResetUi = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5 }} 
          className="absolute top-20 left-10 w-32 h-32 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-40"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5, delay: 0.5 }} 
          className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl opacity-40" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5, delay: 1 }} 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-30"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          {/* Back */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5 }} 
            className="fixed top-6 left-6 z-20">
            <Link 
              href="/auth/login" 
              className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-purple-600 transition-all">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Login</span>
            </Link>
          </motion.div>

          {/* Header */}
          <div className="relative p-8 text-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
            <div className="absolute inset-0 bg-black/10" />
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} 
              className="relative z-10 w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Key className="w-10 h-10 text-white" />
            </motion.div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-3">{isSubmitted ? 'Check Your Email' : 'Reset Password'}</h1>
              <p className="text-blue-100/90 text-lg">
                {isSubmitted ? 'We sent you a reset link' : 'Enter your email to reset your password'}
              </p>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="relative">
                    <label htmlFor="forgot-email" className="sr-only">Email address</label>
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.25 }} 
                    className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <p>We will send a link to reset your password. The link will expire in 60 minutes for security reasons.</p>
                  </motion.div>

                  <motion.button 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    transition={{ delay: 0.35 }} type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer">
                    {isLoading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> <span>Sending...</span></>) : (<><Key className="w-5 h-5" /> <span>Send Reset Link</span></>)}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Check your inbox</h3>
                    <p className="text-gray-600 dark:text-gray-400">We sent a password reset link to <br /><span className="font-medium text-purple-600 dark:text-purple-400">{email}</span></p>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                    <p>Tip: Check your spam folder if you don&apos;t see the email within a few minutes.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleResend}
                      disabled={isLoading || cooldownSecs > 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md disabled:opacity-50"
                    >
                      {cooldownSecs > 0 ? `Resend Email (${formatSecs(cooldownSecs)})` : (isLoading ? 'Resending...' : 'Resend Email')}
                    </motion.button>

                    <Link href="/auth/login" className="w-full text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      Back to Login
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }} 
              className="relative flex items-center py-6"
            >
              <div className="flex-grow border-t border-gray-200/60 dark:border-gray-700/60" />
              <span className="mx-4 text-gray-400 text-sm font-medium">Need more help?</span>
              <div className="flex-grow border-t border-gray-200/60 dark:border-gray-700/60" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6 }} 
              className="text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Still having trouble? Contact support</p>
              <div className="flex justify-center gap-4">
                <a href="mailto:support@wanderwise.com" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm">Email Support</a>
                <a href="tel:+94112345678" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm">Call Support</a>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.9 }} 
          className="mt-8 bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center"><Shield className="w-6 h-6 text-green-500 mb-2" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure</span></div>
            <div className="flex flex-col items-center"><Zap className="w-6 h-6 text-yellow-500 mb-2" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instant</span></div>
            <div className="flex flex-col items-center"><Sparkles className="w-6 h-6 text-purple-500 mb-2" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reliable</span></div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 1.1 }} 
          className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>&copy; {currentYear} WanderWise. Made with <Heart size={14} fill="red" className="inline" /> in Sri Lanka. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}