"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Lock,
  Palette,
  Save,
  Shield,
  Mail,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  Download,
  Trash2,
  Smartphone,
  Database,
  CreditCard,
  ArrowRight,
  Settings,
  Key,
  Moon,
  Sun,
  Volume2,
  ShieldCheck,
  UserCheck,
  Zap,
  BarChart3,
  FileText,
  ChevronRight,
  LogOut,
  RefreshCw,
  HelpCircle,
  ShieldOff,
  UserX,
  AlertTriangle,
  Wifi,
  WifiOff
} from "lucide-react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    language: "english",
    currency: "USD",
    notifications: true,
    marketingEmails: false,
    darkMode: true,
    autoSave: true,
    twoFactor: true,
    location: true,
    sound: false,
    vibration: true,
    dataSaver: false,
    password: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState("dark");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    console.log("Settings saved:", formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setFormData({ ...formData, darkMode: newTheme === "dark" });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User, color: "from-blue-500 to-cyan-500" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "from-amber-500 to-orange-500" },
    { id: "security", label: "Security", icon: Shield, color: "from-emerald-500 to-green-500" },
    { id: "appearance", label: "Appearance", icon: Palette, color: "from-purple-500 to-pink-500" },
    { id: "privacy", label: "Privacy", icon: Lock, color: "from-indigo-500 to-violet-500" },
    { id: "data", label: "Data", icon: Database, color: "from-gray-600 to-gray-800" },
  ];

  const notificationTypes = [
    { name: "notifications", label: "Push Notifications", description: "App alerts and updates", icon: Smartphone },
    { name: "emailUpdates", label: "Email Updates", description: "Important account notifications", icon: Mail },
    { name: "marketingEmails", label: "Marketing Emails", description: "Promotional content and offers", icon: Volume2 },
    { name: "bookingAlerts", label: "Booking Alerts", description: "Real-time booking confirmations", icon: Bell },
    { name: "securityAlerts", label: "Security Alerts", description: "Login and security notifications", icon: ShieldCheck },
    { name: "priceAlerts", label: "Price Alerts", description: "Price drop notifications", icon: Zap },
  ];

  const securityFeatures = [
    { label: "Two-Factor Authentication", description: "Add an extra layer of security", enabled: formData.twoFactor, icon: Key },
    { label: "Biometric Login", description: "Use fingerprint or face ID", enabled: true, icon: UserCheck },
    { label: "Session Management", description: "Manage active sessions", enabled: true, icon: BarChart3 },
    { label: "Password Manager", description: "Auto-save and generate passwords", enabled: formData.autoSave, icon: Lock },
  ];

  const privacyOptions = [
    { label: "Location Services", description: "Allow access to your location", icon: Globe, enabled: formData.location },
    { label: "Data Collection", description: "Share usage data for improvement", icon: Database, enabled: true },
    { label: "Personalized Ads", description: "Show relevant advertisements", icon: User, enabled: false },
    { label: "Activity Tracking", description: "Track app usage patterns", icon: BarChart3, enabled: formData.marketingEmails },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Customize your experience and manage account preferences
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium">Settings updated successfully!</p>
                <p className="text-green-600 dark:text-green-400 text-sm">Your preferences have been saved</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AJ</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{formData.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                    </motion.button>
                  );
                })}
              </nav>
            </div>

            {/* Account Status */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Member Since</span>
                  <span className="font-medium">Jan 2023</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Last Login</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Account Type</span>
                  <span className="font-medium bg-blue-500/20 px-2 py-1 rounded text-sm">Premium</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Storage Used</span>
                  <span className="font-medium">1.2 GB / 5 GB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
                      <p className="text-gray-600 dark:text-gray-400">Update your personal details</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notification Preferences</h2>
                      <p className="text-gray-600 dark:text-gray-400">Choose what notifications you receive</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {notificationTypes.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                            <item.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={formData[item.name] !== undefined ? formData[item.name] : true}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Security Settings</h2>
                      <p className="text-gray-600 dark:text-gray-400">Protect your account with advanced security</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-8">
                    {securityFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg">
                            <feature.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{feature.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={feature.enabled}
                            onChange={() => {}}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl">
                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-500"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                          <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3.5 text-gray-500"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Appearance</h2>
                      <p className="text-gray-600 dark:text-gray-400">Customize your app&apos;s look and feel</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800 dark:text-white">Theme</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setTheme("light")}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            theme === "light"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Sun className="w-6 h-6" />
                            <span>Light</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            theme === "dark"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Moon className="w-6 h-6" />
                            <span>Dark</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800 dark:text-white">Accent Color</h4>
                      <div className="flex flex-wrap gap-3">
                        {["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"].map((color) => (
                          <button
                            key={color}
                            className={`w-10 h-10 rounded-full ${color} hover:scale-110 transition-transform`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Privacy Settings</h2>
                      <p className="text-gray-600 dark:text-gray-400">Control your data and privacy preferences</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-8">
                    {privacyOptions.map((option, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-lg">
                            <option.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{option.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={option.enabled}
                            onChange={() => {}}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-violet-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm">Permanently delete your account and all data</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Download Data</p>
                          <p className="text-sm">Export a copy of your personal data</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === "data" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Data Management</h2>
                      <p className="text-gray-600 dark:text-gray-400">Manage your stored data and cache</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Storage Usage</h4>
                        <span className="text-sm text-blue-700 dark:text-blue-400">1.2 GB / 5 GB</span>
                      </div>
                      <div className="w-full bg-blue-100 dark:bg-blue-900/40 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-1/4"></div>
                      </div>
                      <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-2">
                        <span>App Data: 850 MB</span>
                        <span>Cache: 350 MB</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                        <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <p className="font-medium text-gray-800 dark:text-white">Clear Cache</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Free up 350 MB</p>
                      </button>
                      <button className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                        <WifiOff className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <p className="font-medium text-gray-800 dark:text-white">Data Saver</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Reduce data usage</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}