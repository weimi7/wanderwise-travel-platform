'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Mail, 
  Key, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [requirements, setRequirements] = useState({
    length:  false,
    uppercase: false,
    lowercase: false,
    number: false,
    special:  false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (! token || !email) {
      toast.error('Invalid or expired reset link');
      router.push('/auth/forgot-password');
    }
  }, [token, email, router]);

  useEffect(() => {
    // Check password requirements
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    setRequirements(checks);

    // Calculate password strength (0-100)
    let strength = 0;
    if (checks.length) strength += 20;
    if (checks.uppercase) strength += 20;
    if (checks.lowercase) strength += 20;
    if (checks. number) strength += 20;
    if (checks.special) strength += 20;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength >= 80) return 'bg-emerald-500';
    if (passwordStrength >= 60) return 'bg-amber-500';
    if (passwordStrength >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    if (passwordStrength >= 80) return 'Strong';
    if (passwordStrength >= 60) return 'Good';
    if (passwordStrength >= 40) return 'Fair';
    if (passwordStrength > 0) return 'Weak';
    return 'Very Weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    // Check if password meets all requirements
    if (!Object.values(requirements).every(Boolean)) {
      toast.error('Please meet all password requirements');
      return;
    }

    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:  JSON.stringify({ token, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(data.message || 'Password updated successfully!');
        
        // Show success animation before redirect
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to reset password. Link may have expired.');
      }
    } catch (err) {
      console.error('Reset error', err);
      toast.error('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (! token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md text-center">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This password reset link is invalid or has expired. 
            </p>
            <button
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity:  1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale:  1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-lg"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion. div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a new secure password for your account
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Account Info */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">Resetting password for</p>
                <p className="font-semibold text-blue-800 dark:text-blue-300 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Key className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Password strength</span>
                      <span className={`text-sm font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                        className={`h-full ${getStrengthColor()} transition-all duration-500`}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Requirements */}
                <AnimatePresence>
                  {password && (
                    <motion. div
                      initial={{ opacity:  0, height: 0 }}
                      animate={{ opacity:  1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements: </p>
                      <div className="space-y-1">
                        {Object.entries(requirements).map(([key, met]) => (
                          <div key={key} className="flex items-center gap-2">
                            {met ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                            )}
                            <span className={`text-xs ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {key === 'length' && 'At least 8 characters'}
                              {key === 'uppercase' && 'One uppercase letter'}
                              {key === 'lowercase' && 'One lowercase letter'}
                              {key === 'number' && 'One number'}
                              {key === 'special' && 'One special character'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity:  1 }}
                    className="mt-2 flex items-center gap-2"
                  >
                    {password === confirm ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Security Tips */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Security Tips</p>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                      <li>• Use a unique password not used elsewhere</li>
                      <li>• Avoid personal information like birthdays</li>
                      <li>• Consider using a password manager</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion. button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !password || !confirm || password !== confirm || ! Object.values(requirements).every(Boolean)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating Password... 
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion. button>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password? {' '}
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Assurance */}
        <motion. div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Secure Password Reset</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Your new password will be encrypted and stored securely.  This link expires after use.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}