'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Mail, Lock, LogIn,
  ArrowLeft, Sparkles, Shield, Zap, Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import TurnstileWidget from '@/components/auth/TurnstileWidget';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Turnstile handlers
  const handleTurnstileVerify = (token) => {
    setTurnstileToken(token);
    setIsTurnstileVerified(true);
  };

  const handleTurnstileError = () => {
    setTurnstileToken('');
    setIsTurnstileVerified(false);
    toast.error('Verification failed. Please try again.');
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken('');
    setIsTurnstileVerified(false);
    toast.error('Verification expired. Please verify again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check Turnstile verification
    if (!isTurnstileVerified || !turnstileToken) {
      toast.error('Please complete the verification challenge.');
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ... formData,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (! res.ok || !data.success) {
        toast.error(data.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Save user + token into AuthContext (and localStorage inside it)
      if (typeof login === 'function') {
        login(data.user, data. token);
      } else {
        try { localStorage.setItem('token', data.token); } catch(e) {}
      }

      toast.success(`Welcome back, ${data.user.full_name}!  Redirecting...`);

      // Create slug from full_name (lowercase + dash)
      const nameSlug = data.user.full_name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

      // Redirect after small delay (so toast can be seen)
      setTimeout(() => {
        switch (data.user.role) {
          case 'traveler':
            router.push(`/dashboard/traveler/${nameSlug}`);
            break;
          case 'business':
            router.push(`/dashboard/business/${nameSlug}`);
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          default:
            router.push('/');
        }
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSuccess = (user, token) => {
    if (typeof login === 'function') {
      login(user, token);
    } else {
      try { localStorage.setItem('token', token); } catch(e) {}
    }
    toast.success(`Welcome back, ${user.full_name || user.name || 'Traveler'}`);
    const nameSlug = (user.full_name || user. name || 'user').trim().toLowerCase().replace(/\s+/g, '-');
    setTimeout(() => {
      switch (user.role) {
        case 'traveler':
          router. push(`/dashboard/traveler/${nameSlug}`);
          break;
        case 'business': 
          router.push(`/dashboard/business/${nameSlug}`);
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/');
      }
    }, 900);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 40 }}
      />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale:  0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5 }} 
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-40 animate-float-slow" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale:  1 }} 
          transition={{ duration: 1.5, delay: 0.5 }} 
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-40 animate-float-medium" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5, delay: 1 }} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl opacity-30 animate-float-fast" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="relative z-10 w-full max-w-md">

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">

          {/* Back to Home */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5 }} 
            className="fixed top-6 left-6 z-20"
          >
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Home</span>
            </Link>
          </motion.div>

          {/* Header */}
          <div className="relative p-8 text-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }} 
              className="relative z-10 w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <LogIn className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-3 relative z-10">Welcome Back</h1>
            <p className="text-blue-100/90 text-lg relative z-10">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email */}
            <motion. div 
              initial={{ opacity:  0, x: -20 }} 
              animate={{ opacity:  1, x: 0 }} 
              transition={{ delay: 0.3 }} 
              className="relative group"
            >
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                name="email" 
                placeholder="Email address" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </motion.div>

            {/* Password */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4 }} 
              className="relative group"
            >
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="w-full pl-12 pr-12 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            {/* Forgot password */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay:  0.5 }}
              className="text-right"
            >
              <Link href="/auth/forgot-password" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">
                Forgot password?
              </Link>
            </motion. div>

            {/* Turnstile Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity:  1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <TurnstileWidget
                onVerify={handleTurnstileVerify}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
              />
            </motion.div>

            {/* Submit */}
            <motion.button 
              type="submit" 
              disabled={isLoading || ! isTurnstileVerified} 
              initial={{ opacity: 0, y:  20 }} 
              animate={{ opacity: 1, y: 0 }} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              onHoverStart={() => setIsHovered(true)} 
              onHoverEnd={() => setIsHovered(false)} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg flex items-center justify-center gap-3 relative text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <AnimatePresence>
                {isHovered && 
                  <motion.div  
                    initial={{ opacity: 0, scale: 0 }} 
                    animate={{ opacity:  1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0 }} 
                    className="absolute inset-0 rounded-xl pointer-events-none" 
                  />
                }
              </AnimatePresence>
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center py-6">
              <div className="flex-grow border-t border-gray-200/60 dark:border-gray-700/60"></div>
              <span className="mx-4 text-gray-400 text-sm">or continue with</span>
              <div className="flex-grow border-t border-gray-200/60 dark:border-gray-700/60"></div>
            </div>

            {/* Social login */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.8 }} 
              className="flex justify-center"
            > 
              <GoogleSignInButton onSuccess={handleSocialSuccess} />
            </motion.div>

            {/* Signup link */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
              Don&#39;t have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 font-semibold underline underline-offset-4 hover:text-blue-700 transition">
                Create account
              </Link>
            </div>
          </form>
        </div>

        {/* Features Banner */} 
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 1 }} 
          className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30" 
        > 
          <div className="grid grid-cols-3 gap-4 text-center"> 
            <div className="flex flex-col items-center"> 
              <Shield className="w-6 h-6 text-green-500 mb-2" /> 
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure</span>
            </div> 
            <div className="flex flex-col items-center"> 
              <Zap className="w-6 h-6 text-yellow-500 mb-2" /> 
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fast</span> 
            </div> 
            <div className="flex flex-col items-center"> 
              <Sparkles className="w-6 h-6 text-purple-500 mb-2" /> 
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reliable</span> 
            </div> 
          </div> 
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity:  1 }} 
          transition={{ delay: 1.1 }} 
          className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>&copy; {currentYear} WanderWise. Made with <Heart size={14} fill="red" className="inline text-red-500" /> in Sri Lanka. </p>
        </motion.div>
      </motion.div>
    </div>
  );
}