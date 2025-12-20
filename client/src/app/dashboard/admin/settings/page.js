"use client";

import { useState } from "react";
import {
  Save,
  Globe,
  Mail,
  Shield,
  Palette,
  Users,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Database,
  Cloud,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings as SettingsIcon,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion } from "framer-motion";

export default function EnhancedSettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      siteName: "WanderWise",
      siteUrl: "https://wanderwise.com",
      timezone: "UTC",
      language: "en-US",
      maintenanceMode: false,
    },
    appearance: {
      primaryColor: "#3b82f6",
      theme: "system",
      darkMode: true,
      accentColor: "#8b5cf6",
      fontFamily: "Inter",
      borderRadius: "md",
    },
    email: {
      senderEmail: "noreply@wanderwise.com",
      senderName: "WanderWise",
      smtpHost: "smtp.sendgrid.net",
      smtpPort: "587",
      smtpSecure: true,
    },
    security: {
      allowUserRegistration: true,
      enable2FA: true,
      passwordPolicy: "medium",
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableRateLimiting: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: true,
      securityAlerts: true,
      digestFrequency: "weekly",
    },
    integrations: {
      googleAnalytics: "",
      stripeLiveMode: false,
      cloudflareCDN: true,
      recaptchaEnabled: true,
    },
  });

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("saving");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Settings saved:", settings);
    setSaveStatus("success");
    setIsSaving(false);
    
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleReset = () => {
    setSettings({
      general: {
        siteName: "WanderWise",
        siteUrl: "https://wanderwise.com",
        timezone: "UTC",
        language: "en-US",
        maintenanceMode: false,
      },
      appearance: {
        primaryColor: "#3b82f6",
        theme: "system",
        darkMode: true,
        accentColor: "#8b5cf6",
        fontFamily: "Inter",
        borderRadius: "md",
      },
      email: {
        senderEmail: "noreply@wanderwise.com",
        senderName: "WanderWise",
        smtpHost: "smtp.sendgrid.net",
        smtpPort: "587",
        smtpSecure: true,
      },
      security: {
        allowUserRegistration: true,
        enable2FA: true,
        passwordPolicy: "medium",
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        enableRateLimiting: true,
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: true,
        securityAlerts: true,
        digestFrequency: "weekly",
      },
      integrations: {
        googleAnalytics: "",
        stripeLiveMode: false,
        cloudflareCDN: true,
        recaptchaEnabled: true,
      },
    });
    setShowResetModal(false);
    setSaveStatus("reset");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "email", label: "Email", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Cloud },
  ];

  const renderSaveStatus = () => {
    if (!saveStatus) return null;
    
    const config = {
      saving: { 
        text: "Saving changes...", 
        color: "text-blue-500", 
        bg: "bg-blue-50 dark:bg-blue-900/20", 
        border: "border-blue-200 dark:border-blue-800",
        icon: RefreshCw 
      },
      success: { 
        text: "Settings saved successfully!", 
        color: "text-green-500", 
        bg: "bg-green-50 dark:bg-green-900/20", 
        border: "border-green-200 dark:border-green-800",
        icon: CheckCircle 
      },
      reset: { 
        text: "Settings reset to defaults", 
        color: "text-amber-500", 
        bg: "bg-amber-50 dark:bg-amber-900/20", 
        border: "border-amber-200 dark:border-amber-800",
        icon: RefreshCw 
      },
    };

    const { text, color, bg, border, icon: Icon } = config[saveStatus];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 ${bg} ${border} border rounded-xl mb-4 flex items-center gap-3`}
      >
        <Icon className={`w-5 h-5 animate-spin ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
        <span className={`font-medium ${color}`}>{text}</span>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your application settings and preferences
          </p>
        </motion.div>

        {renderSaveStatus()}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      General Settings
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => handleChange("general", "siteName", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                        Site URL
                      </label>
                      <input
                        type="url"
                        value={settings.general.siteUrl}
                        onChange={(e) => handleChange("general", "siteUrl", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => handleChange("general", "timezone", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                        Language
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => handleChange("general", "language", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="es-ES">Spanish</option>
                        <option value="fr-FR">French</option>
                        <option value="de-DE">German</option>
                        <option value="ja-JP">Japanese</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Temporarily disable public access to the site
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleChange("general", "maintenanceMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Appearance
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={settings.appearance.primaryColor}
                          onChange={(e) => handleChange("appearance", "primaryColor", e.target.value)}
                          className="w-12 h-12 cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                        />
                        <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500"></div>
                            <div className="w-8 h-8 rounded-lg bg-purple-500"></div>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500"></div>
                            <div className="w-8 h-8 rounded-lg bg-rose-500"></div>
                          </div>
                          <input
                            type="text"
                            value={settings.appearance.primaryColor}
                            onChange={(e) => handleChange("appearance", "primaryColor", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                        Theme
                      </label>
                      <div className="flex gap-2">
                        {["light", "dark", "system"].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => handleChange("appearance", "theme", theme)}
                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                              settings.appearance.theme === theme
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                            }`}
                          >
                            <span className="font-medium capitalize text-gray-800 dark:text-white">
                              {theme}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Security Settings
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { 
                        key: "allowUserRegistration", 
                        label: "Allow User Registration", 
                        description: "Allow new users to create accounts",
                        icon: Users 
                      },
                      { 
                        key: "enable2FA", 
                        label: "Enable Two-Factor Authentication", 
                        description: "Require 2FA for all user accounts",
                        icon: Lock 
                      },
                      { 
                        key: "enableRateLimiting", 
                        label: "Enable Rate Limiting", 
                        description: "Prevent brute force attacks",
                        icon: Zap 
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                            <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {item.label}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.security[item.key]}
                            onChange={(e) => handleChange("security", item.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    ))}

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                        Password Policy
                      </h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          { value: "low", label: "Low", desc: "Min 6 characters" },
                          { value: "medium", label: "Medium", desc: "Min 8 chars + number" },
                          { value: "high", label: "High", desc: "Min 12 chars, special chars" },
                        ].map((policy) => (
                          <button
                            key={policy.value}
                            onClick={() => handleChange("security", "passwordPolicy", policy.value)}
                            className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                              settings.security.passwordPolicy === policy.value
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                            }`}
                          >
                            <div className="font-semibold text-gray-800 dark:text-white mb-1">
                              {policy.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {policy.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Reset Settings?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This will reset all settings to their default values. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors font-medium cursor-pointer"
              >
                Reset Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}