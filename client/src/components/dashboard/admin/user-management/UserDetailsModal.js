"use client";

import { X, Mail, Phone, Calendar, User, Edit3, Shield, Activity, MapPin, Globe, BadgeCheck, Trash2, CheckCircle, AlertTriangle, CreditCard, Star, TrendingUp, Lock, Eye, EyeOff, Key, Award, Heart, MessageSquare, Bell, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function MessageBanner({ type = "info", message }) {
  if (!message) return null;
  const base = "flex items-start gap-3 p-3 rounded-xl text-sm backdrop-blur-sm";
  const variants = {
    success: `${base} bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50`,
    error: `${base} bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50`,
    info: `${base} bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50`,
  };
  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertTriangle : BadgeCheck;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={variants[type] || variants.info}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="font-medium">{message}</div>
    </motion.div>
  );
}

export default function UserDetailsModal({ user, onClose, onSave, onDeleted }) {
  const { token: authToken } = useAuth() || {};
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inlineMessage, setInlineMessage] = useState(null);

  // New states for Fix Email UI
  const [showFixInput, setShowFixInput] = useState(false);
  const [fixEmailValue, setFixEmailValue] = useState("");
  const [fixingEmail, setFixingEmail] = useState(false);

  // Form state for editing
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    role: "traveler",
    password: "",
    active: true,
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    setIsEditing(false);
    setActiveTab("details");
    setInlineMessage(null);
    setShowFixInput(false);
    setFixingEmail(false);

    const fullName =
      user.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
      user.name ||
      "";

    setForm({
      full_name: fullName,
      email: user.email || "",
      phone: user.phone || "",
      country: user.country || "",
      role: user.role || "traveler",
      password: "",
      active: user.active !== undefined ? Boolean(user.active) : (user.status !== "suspended"),
      avatar_url: user.avatar_url || "",
    });

    setFixEmailValue(user.email || "");
  }, [user]);

  const getAuthHeader = useCallback(() => {
    const token = authToken || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [authToken]);

  // Show react-hot-toast notifications whenever inlineMessage changes.
  // We still keep the inline banner (MessageBanner) for visual context in the modal,
  // but centralize toast notifications here so behavior is consistent.
  useEffect(() => {
    if (!inlineMessage || !inlineMessage.message) return;
    const { type, message } = inlineMessage;
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast(message);
  }, [inlineMessage]);

  if (!user) return null;

  const userId = user.id || user.user_id || user.userId;

  const performDelete = async () => {
    if (!userId) {
      setInlineMessage({ type: "error", message: "User id is missing." });
      setShowConfirm(false);
      return;
    }

    setDeleting(true);
    setInlineMessage(null);
    try {
      if (typeof onDeleted === "function") {
        await onDeleted(userId);
        setInlineMessage({ type: "success", message: "User deleted successfully." });
        setShowConfirm(false);
        onClose && onClose();
        return;
      }

      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || `Delete failed (${res.status})`;
        setInlineMessage({ type: "error", message: msg });
        console.error("Delete failed:", data);
        setShowConfirm(false);
        return;
      }

      const successMessage = data?.message || "User deleted successfully.";
      setInlineMessage({ type: "success", message: successMessage });

      setShowConfirm(false);
      onClose && onClose();
      onDeleted && onDeleted();
    } catch (err) {
      console.error("Delete error:", err);
      const msg = err?.message || "Network error while deleting user.";
      setInlineMessage({ type: "error", message: msg });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setInlineMessage({ type: "error", message: "User id is missing." });
      return;
    }

    if (!form.full_name || !form.email) {
      setInlineMessage({ type: "error", message: "Please provide name and email." });
      return;
    }

    // strong email validation (matches backend rules)
    if (!validateEmail(form.email)) {
      setInlineMessage({ type: "error", message: "Invalid email format. Please enter a valid email address." });
      return;
    }

    const updatedFields = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      country: form.country || null,
      role: form.role,
      avatar_url: form.avatar_url || null,
    };
    if (form.password) updatedFields.password = form.password;
    if (form.active === false) updatedFields.status = "suspended";

    setSaving(true);
    setInlineMessage(null);
    try {
      if (typeof onSave === "function") {
        await onSave(updatedFields);
        setInlineMessage({ type: "success", message: "User updated successfully" });
      } else {
        const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify(updatedFields),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = data?.message || `Update failed (${res.status})`;
          setInlineMessage({ type: "error", message: msg });
          console.error("Update failed:", data);
          return;
        }
        const msg = data?.message || "User updated successfully";
        setInlineMessage({ type: "success", message: msg });
      }

      setIsEditing(false);
      setShowPassword(false);
      if (typeof onDeleted === "function") {
        onDeleted();
      }
    } catch (err) {
      console.error("Save error:", err);
      const msg = err?.message || "Network error while saving user.";
      setInlineMessage({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'US';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-purple-500 to-pink-600";
      case "business":
        return "bg-gradient-to-r from-blue-500 to-cyan-600";
      default:
        return "bg-gradient-to-r from-green-500 to-emerald-600";
    }
  };

  // Avatar helpers: update avatar_url in form and show preview
  const onAvatarUrlChange = (value) => {
    setForm(s => ({ ...s, avatar_url: value }));
  };

  const clearAvatar = () => {
    setForm(s => ({ ...s, avatar_url: "" }));
  };

  // New: Fix email handlers
  const handleStartFixEmail = () => {
    setFixEmailValue(form.email || "");
    setShowFixInput(true);
  };

  // Strong validateEmail (matches backend)
  const validateEmail = (email) => {
    if (!email || typeof email !== "string") return false;

    const cleaned = String(email).trim();

    // RFC-like modern regex: local@domain.TLD (TLD >= 2 letters)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    // disallow consecutive dots and dots at edges
    if (cleaned.includes("..")) return false;
    if (cleaned.startsWith(".") || cleaned.endsWith(".")) return false;

    return emailRegex.test(cleaned);
  };

  const handleCancelFix = () => {
    setShowFixInput(false);
    setFixingEmail(false);
    setFixEmailValue(form.email || "");
  };

  const handleSubmitFixEmail = async () => {
    const newEmail = (fixEmailValue || "").trim();
    if (!validateEmail(newEmail)) {
      setInlineMessage({ type: "error", message: "Please enter a valid email address" });
      return;
    }
    setFixingEmail(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/update-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || `Failed to update email (${res.status})`;
        setInlineMessage({ type: "error", message: msg });
        console.error("Fix email failed:", data);
        setFixingEmail(false);
        return;
      }
      // success: update UI
      const updatedUser = data?.user;
      const finalEmail = updatedUser?.email || newEmail;
      setForm(s => ({ ...s, email: finalEmail }));
      setInlineMessage({ type: "success", message: "Email updated successfully" });
      setShowFixInput(false);
      setFixingEmail(false);

      // trigger parent refresh/close if available (Admin page provides onDeleted to refresh)
      if (typeof onDeleted === "function") {
        try { onDeleted(); } catch (_) {}
      }
    } catch (err) {
      console.error("Fix email error:", err);
      setInlineMessage({ type: "error", message: err?.message || "Failed to update email" });
      setFixingEmail(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        {/* Place Toaster inside modal so toasts are visible even if app root doesn't include one */}
        <Toaster position="top-right" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="mt-15 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ rotate: 5 }} className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-white/30 overflow-hidden">
                    {form.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.avatar_url} alt={`${form.full_name} avatar`} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(form.full_name)}</span>
                    )}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${getRoleColor(form.role)} rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center`}>
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {form.full_name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-blue-100">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{form.email}</span>
                      {/* Fix email control (visible when not editing) */}
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={handleStartFixEmail}
                          className="ml-3 text-xs px-2 py-1 bg-white/20 rounded-md hover:bg-white/30 transition-colors"
                        >
                          Fix email
                        </button>
                      )}
                    </div>

                    {form.phone && (
                      <div className="flex items-center gap-1 text-blue-100">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{form.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Inline Fix Email Input (appears under header area) */}
                  {showFixInput && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="email"
                        value={fixEmailValue}
                        onChange={(e) => setFixEmailValue(e.target.value)}
                        className="px-3 py-1 rounded-lg text-sm text-gray-800"
                      />
                      <button
                        onClick={handleSubmitFixEmail}
                        disabled={fixingEmail}
                        className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm disabled:opacity-60"
                      >
                        {fixingEmail ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelFix}
                        disabled={fixingEmail}
                        className="px-3 py-1 rounded-md bg-gray-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                disabled={saving || deleting}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Status indicator */}
            <div className="absolute -bottom-4 right-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md shadow-lg ${form.active ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"}`}>
                <div className={`w-2 h-2 rounded-full ${form.active ? 'bg-green-300' : 'bg-gray-300'}`} />
                {form.active ? "Active Account" : "Inactive Account"}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
            {[
              { id: "details", label: "Profile", icon: User },
              { id: "activity", label: "Activity", icon: Activity },
              { id: "preferences", label: "Preferences", icon: Heart },
              { id: "security", label: "Security", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative cursor-pointer ${activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400" transition={{ type: "spring", stiffness: 300 }} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Inline message banner */}
            <AnimatePresence>
              {inlineMessage && <MessageBanner type={inlineMessage.type} message={inlineMessage.message} />}
            </AnimatePresence>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {activeTab === "details" && (
                  <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-500" />
                          Personal Information
                        </h3>

                        {!isEditing ? (
                          <div className="space-y-4">
                            {[
                              { label: "Full Name", value: form.full_name, icon: User },
                              { label: "Email", value: form.email, icon: Mail },
                              { label: "Phone", value: form.phone || "Not provided", icon: Phone },
                              { label: "Country", value: form.country || "Not specified", icon: MapPin },
                              { label: "Member Since", value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown", icon: Calendar },
                            ].map((item) => {
                              const Icon = item.icon;
                              return (
                                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Icon className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                    <p className="text-gray-800 dark:text-white font-medium">{item.value}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar URL</label>
                              <div className="flex gap-3 items-center">
                                <input
                                  value={form.avatar_url || ""}
                                  onChange={(e) => onAvatarUrlChange(e.target.value)}
                                  placeholder="https://res.cloudinary.com/your-cloud/image/upload..."
                                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white"
                                />
                                <button type="button" onClick={clearAvatar} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Clear</button>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Paste a public image URL (or Cloudinary secure URL). Admins cannot upload on behalf of users from this modal.</p>

                              {form.avatar_url && (
                                <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden border">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={form.avatar_url} alt="avatar preview" className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = ''; }} />
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                              <input
                                value={form.full_name}
                                onChange={(e) => setForm(s => ({ ...s, full_name: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                              <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                <input
                                  value={form.phone}
                                  onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))}
                                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                                <input
                                  value={form.country}
                                  onChange={(e) => setForm(s => ({ ...s, country: e.target.value }))}
                                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Account Details */}
                      <div className="bg-white dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-500" />
                          Account Details
                        </h3>

                        {!isEditing ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
                              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">Account Role</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                                    <Shield className={`w-5 h-5 ${form.role === "admin" ? "text-purple-500" : "text-blue-500"}`} />
                                  </div>
                                  <span className="font-bold text-gray-800 dark:text-white capitalize">{form.role}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(form.role)} text-white`}>
                                  {form.role === "admin" ? "Administrator" : form.role === "business" ? "Business" : "Traveler"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/30">
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Account Status</p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${form.active ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                                  <span className="font-bold text-green-700 dark:text-green-400">{form.active ? "Active" : "Inactive"}</span>
                                </div>
                              </div>

                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">User ID</p>
                                <p className="text-gray-800 dark:text-white font-mono text-sm">{userId}</p>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">Last Updated</p>
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Calendar className="w-4 h-4" />
                                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Never"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Role</label>
                              <select value={form.role} onChange={(e) => setForm(s => ({ ...s, role: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white">
                                <option value="traveler">Traveler</option>
                                <option value="business">Business</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Status</label>
                              <div className="flex gap-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setForm(s => ({ ...s, active: true }))} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${form.active ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                                  <CheckCircle className="w-4 h-4" />
                                  Active
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setForm(s => ({ ...s, active: false }))} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${!form.active ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                                  <AlertTriangle className="w-4 h-4" />
                                  Inactive
                                </motion.button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                              <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))} placeholder="Leave blank to keep current password" className="w-full px-4 py-2.5 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white" />
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Leave blank to keep current password</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* other tabs omitted for brevity (unchanged) */}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                User ID: <span className="font-mono text-gray-700 dark:text-gray-300">{userId}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer" disabled={saving || deleting}>
                Close
              </motion.button>

              {!isEditing ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsEditing(true)} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2 cursor-pointer" disabled={saving || deleting}>
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setIsEditing(false); setForm(s => ({ ...s, password: "" })); setShowPassword(false); }} className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer" disabled={saving || deleting}>
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all font-medium flex items-center gap-2 cursor-pointer" disabled={saving || deleting}>
                    <CheckCircle className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Confirm dialog for deletion */}
        <ConfirmDialog
          open={showConfirm}
          title="Confirm User Deletion"
          message={`Permanently delete "${form.full_name}" (${form.email})? This action will remove all associated data and cannot be undone.`}
          confirmLabel="Delete User"
          cancelLabel="Cancel"
          loading={deleting}
          onCancel={() => setShowConfirm(false)}
          onConfirm={performDelete}
        />
      </motion.div>
    </AnimatePresence>
  );
}