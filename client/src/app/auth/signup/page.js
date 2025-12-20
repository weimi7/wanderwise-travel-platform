'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check, Briefcase, MapPin, Phone,
  Globe, FileText, Sparkles, Shield, Zap, Crown, Heart, ChevronDown, Search
} from 'lucide-react';
import { countryCodes, popularCountryCodes } from '../../../utils/countryCodes';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import { useAuth } from '@/contexts/AuthContext';

// Signup API function
async function signupUser(submitData) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
    });
    return await res.json();
  } catch (error) {
    return { error: error.message || 'Network error' };
  }
}

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Traveler specific
    country: '',
    phone: '',
    countryCode: '+94', // Default to Sri Lanka
    
    // Business Partner specific
    businessType: '',
    businessName: '',
    businessAddress: '',
    licenseNo: '',
    
    agreeToTerms: false
  });
  
  // Country code selector state
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);

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

  // Helper to combine country code + phone before sending to server
  const buildPhoneWithCountryCode = (countryCode = '+94', phone = '') => {
    if (!phone) return '';
    let cleaned = phone.trim().replace(/\s+/g, '').replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    const ccDigits = (countryCode || '').replace(/^\+/, '');
    if (cleaned.startsWith('0')) {
      return `+${ccDigits}${cleaned.slice(1)}`;
    }
    if (cleaned.startsWith(ccDigits)) {
      return `+${cleaned}`;
    }
    return `+${ccDigits}${cleaned}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check Turnstile verification
    if (!isTurnstileVerified || !turnstileToken) {
      toast.error('Please complete the verification challenge.');
      return;
    }

    setIsLoading(true);

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Password requirements check
    const passReqs = [
      formData.password.length >= 6,
      /\d/.test(formData.password),
      /[!@#$%^&*]/.test(formData.password),
    ];
    if (passReqs.includes(false)) {
      toast.error('Password does not meet requirements.');
      setIsLoading(false);
      return;
    }

    // Prepare submit data based on role
    const submitData = {
      role: selectedRole,
      fullName: formData.fullName,
      email: formData.email,
      password: formData. password,
      turnstileToken, // Add Turnstile token
    };

    if (selectedRole === 'traveler') {
      submitData.country = formData.country;
      submitData.phone = buildPhoneWithCountryCode(formData.countryCode, formData.phone);
      submitData.countryCode = formData.countryCode;
    }
    else if (selectedRole === 'business') {
      submitData.businessType = formData.businessType;
      submitData.businessName = formData.businessName;
      submitData.businessAddress = formData.businessAddress;
      submitData.licenseNo = formData. licenseNo;
    }

    // Call signup API
    const result = await signupUser(submitData);

    setIsLoading(false);
    if (result?. error) {
      toast.error(result.error);
    } else {
      toast.success('Account created Successfully!  Redirecting to Login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e. target.checked : e.target. value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      phone: '',
      countryCode: '+94',
      businessType: '',
      businessName: '',
      businessAddress: '',
      licenseNo: '',
      agreeToTerms: false
    });
  };

  // Helper functions for country code selector
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.code.includes(countrySearchTerm)
  );

  const getSelectedCountry = () => {
    return countryCodes.find(country => country.code === formData.countryCode) || 
           countryCodes. find(country => country.code === '+94');
  };

  const handleCountrySelect = (countryCode) => {
    setFormData({ ...formData, countryCode });
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
  };

  const passwordRequirements = [
    { id: 1, text: 'At least 6 characters', met: formData.password.length >= 6 },
    { id: 2, text: 'Contains a number', met: /\d/. test(formData.password) },
    { id: 3, text: 'Contains a special character', met: /[!@#$%^&*]/.test(formData.password) },
  ];

  const businessTypes = [
    'Hotel/Accommodation',
    'Tour/Activity Provider'
  ];

  const currentYear = new Date().getFullYear();

  // Handle social sign-in success (Google)
  const handleSocialSuccess = (user, token) => {
    if (typeof login === 'function') {
      login(user, token);
    } else {
      try { localStorage.setItem('token', token); } catch(e) {}
    }

    toast.success(`Welcome, ${user.full_name || user.name || 'Traveler'}`);
    const nameSlug = (user.full_name || user. name || 'user').trim().toLowerCase().replace(/\s+/g, '-');
    setTimeout(() => {
      switch (user.role) {
        case 'traveler':
          router.push(`/dashboard/traveler/${nameSlug}`);
          break;
        case 'business':
          router.push(`/dashboard/business/${nameSlug}`);
          break;
        case 'admin':
          router. push('/dashboard/admin');
          break;
        default:
          router.push('/');
      }
    }, 900);
  };

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 40 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
            padding: '18px 22px',
            fontSize: '15px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
            style: {
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            },
          },
          error:  {
            iconTheme: { primary: '#f87171', secondary: '#fff' },
            style: {
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
            },
          },
          loading: {
            iconTheme: { primary: '#60a5fa', secondary: '#fff' },
            style: {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            },
          },
        }}
      />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-20 left-10 w-32 h-32 bg-green-200 dark:bg-green-900 rounded-full blur-3xl opacity-40 animate-float-slow"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration:  1.5, delay: 0.5 }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-teal-200 dark:bg-teal-900 rounded-full blur-3xl opacity-40 animate-float-medium"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration:  1.5, delay: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-200 dark:bg-emerald-900 rounded-full blur-3xl opacity-30 animate-float-fast"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Sign Up Card */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          {/* Back to Home Button */}
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
          <div className="relative p-8 text-center bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale:  1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness:  200 }}
              className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <User className="w-10 h-10 text-white" />
            </motion.div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-3">Join WanderWise</h1>
              <p className="text-green-100/90 text-lg">Start your adventure today</p>
            </div>
          </div>

          {/* Role Selection */}
          {! selectedRole && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-8 space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-6">
                Choose your account type
              </h3>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('traveler')}
                  className="w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-lg">I&apos;m a Traveler</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Discover amazing experiences and book your next adventure</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Back to Login Button */}
              <motion. div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60"
              >
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* Registration Form */}
          {selectedRole && (
            <form onSubmit={handleSubmit} className="p-8 space-y-6" autoComplete="off">
              {/* Invisible inputs to trap browser autofill */}
              <div aria-hidden="true" style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
                <input type="text" name="username" autoComplete="username" defaultValue="" />
                <input type="password" name="current-password" autoComplete="current-password" defaultValue="" />
              </div>

              {/* Back to role selection */}
              <motion. button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="button"
                onClick={() => setSelectedRole('')}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-2 group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Change account type
              </motion.button>

              {/* Role-specific header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 text-xl font-semibold text-gray-800 dark:text-white">
                  <User className="w-6 h-6 text-blue-500" />
                  Traveler Account
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Join our community of adventure seekers
                </p>
              </div>

              {/* Common Fields - Full Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x:  0 }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </motion.div>

              {/* Common Fields - Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity:  1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </motion.div>

              {/* Traveler Specific Fields */}
              {selectedRole === 'traveler' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative group"
                  >
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                    <input
                      type="text"
                      name="country"
                      autoComplete="country-name"
                      placeholder="Country *"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative group"
                  >
                    <div className="flex">
                      {/* Country Code Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="h-full pl-4 pr-3 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 border-r-0 rounded-l-xl transition-all duration-300 flex items-center gap-1 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <span className="text-xl">{getSelectedCountry().flag}</span>
                          <span className="text-gray-700 dark:text-gray-200 font-medium text-sm ml-2">
                            {getSelectedCountry().code}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-2 ${showCountryDropdown ?  'rotate-180' : ''}`} />
                        </button>

                        {/* Country Dropdown */}
                        <AnimatePresence>
                          {showCountryDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale:  1 }}
                              exit={{ opacity: 0, y:  -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl backdrop-blur-xl z-50 max-h-72 overflow-hidden w-80"
                            >
                              {/* Search Input */}
                              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    placeholder="Search countries..."
                                    value={countrySearchTerm}
                                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-all text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                              </div>

                              {/* Popular Countries */}
                              {countrySearchTerm === '' && (
                                <div className="p-2">
                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">Popular</div>
                                  {popularCountryCodes.map((country) => (
                                    <button
                                      key={`popular-${country. country}`}
                                      type="button"
                                      onClick={() => handleCountrySelect(country. code)}
                                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                    >
                                      <span className="text-lg">{country.flag}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                          {country.name}
                                        </div>
                                      </div>
                                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                        {country. code}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* All Countries */}
                              <div className="max-h-40 overflow-y-auto p-2 custom-scrollbar">
                                {countrySearchTerm !== '' && (
                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">All Countries</div>
                                )}
                                {filteredCountries.map((country) => (
                                  <button
                                    key={`all-${country.country}`}
                                    type="button"
                                    onClick={() => handleCountrySelect(country. code)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                  >
                                    <span className="text-lg">{country.flag}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {country.name}
                                      </div>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                      {country.code}
                                    </span>
                                  </button>
                                ))}
                                {filteredCountries.length === 0 && (
                                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                    No countries found
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Click outside to close */}
                        {showCountryDropdown && (
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowCountryDropdown(false)}
                          />
                        )}
                      </div>

                      {/* Phone Number Input */}
                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        placeholder="Phone Number *"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="flex-1 pl-4 pr-4 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 border-l-0 rounded-r-xl transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </motion.div>
                </>
              )}

              {/* Common Fields - Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity:  1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <input
                  type={showPassword ? 'text' :  'password'}
                  name="password"
                  autoComplete="new-password"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus: ring-blue-500/20 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>

              {/* Password Requirements */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-50/80 dark:bg-gray-700/80 p-4 rounded-xl space-y-2 backdrop-blur-sm"
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password requirements:</p>
                  {passwordRequirements.map((req) => (
                    <div key={req.id} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        {req.met && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative group"
              >
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/80 dark:bg-gray-700/80 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-xl transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg"
                >
                  {showConfirmPassword ?  <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>

              {/* Turnstile Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay:  0.65 }}
              >
                <TurnstileWidget
                  onVerify={handleTurnstileVerify}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileExpire}
                />
              </motion.div>

              {/* Terms Agreement */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-start gap-3 text-sm"
              >
                <label className="relative flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-0.5 ${
                    formData.agreeToTerms 
                      ? 'bg-green-500 border-green-500' 
                      : 'bg-white/80 dark:bg-gray-700/80 border-gray-300 dark:border-gray-600'
                  }`}>
                    {formData.agreeToTerms && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 flex-1">
                    I agree to the{' '}
                    <a href="/legal/terms-of-service" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/legal/privacy-policy" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion. button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y:  0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                transition={{ delay: 0.8 }}
                type="submit"
                disabled={isLoading || !formData.agreeToTerms || ! isTurnstileVerified}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity:  1, scale: 1 }}
                      exit={{ opacity:  0, scale: 0 }}
                      className="absolute inset-0 rounded-xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>
                {isLoading ?  (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span>Create Traveler Account</span>
                  </>
                )}
              </motion.button>

              {/* Social Sign Up */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="relative flex items-center py-6"
              >
                <div className="flex-grow border-t border-gray-200/60 dark:border-gray-700/60"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">or sign up with</span>
                <div className="flex-grow border-t border-gray-200/60 dark:border-gray-700/60"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity:  1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="flex justify-center"
              >
                <GoogleSignInButton onSuccess={handleSocialSuccess} />
              </motion.div>

              {/* Login Link */}
              <motion. div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4"
              >
                Already have an account? {' '}
                <a href="/auth/login" className="text-green-600 font-semibold hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors underline underline-offset-4">
                  Sign in
                </a>
              </motion. div>
            </form>
          )}
        </div>

        {/* Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
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
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
        >
          <p className="flex items-center justify-center gap-1">
            &copy; {currentYear} WanderWise. Made with <Heart size={14} fill='red' className="text-red-500" /> in Sri Lanka.  All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
}