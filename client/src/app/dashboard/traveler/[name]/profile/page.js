'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Globe,
  Lock,
  Key,
  Settings,
  Bell,
  CreditCard,
  Smartphone,
  MapPin,
  Calendar,
  Trash2,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import SavedCard from "@/components/dashboard/traveler/profile/SavedCard";

const API = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
  : "";

/* -------------------------------
   PHONE NORMALIZATION — FIXED
--------------------------------*/
function normalizePhoneClient(value) {
  if (!value) return null;

  const raw = String(value).trim();

  if (/^\+[1-9]\d{7,14}$/.test(raw)) return raw;

  const digits = raw.replace(/\D/g, "");

  if (/^0\d{9}$/.test(digits)) return "+94" + digits.slice(1);

  if (/^94\d{7,14}$/.test(digits)) return "+" + digits;

  if (/^\d{7,15}$/.test(digits)) return "+" + digits;

  return null;
}

/* -------------------------------
   PHONE VALIDATION — FIXED
--------------------------------*/
function isValidPhoneClient(value) {
  if (!value) return false;
  return /^\+[1-9]\d{7,14}$/.test(value);
}

/* -------------------------------
   EMAIL NORMALIZATION
--------------------------------*/
function normalizeEmailClient(value) {
  if (!value) return "";
  return String(value).trim();
}

/* -------------------------------
   EMAIL VALIDATION (RFC-ish)
--------------------------------*/
function isValidEmailClient(email) {
  const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return r.test(String(email).trim());
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateUser } = useAuth();

  // friendly display name
  const displayName = user?.full_name || user?.email?.split?.("@")?.[0] || "User";

  const tabs = [
    { id: "basic", label: "Personal Info", icon: User, color: "from-blue-500 to-cyan-500" },
    { id: "security", label: "Security", icon: Shield, color: "from-emerald-500 to-green-500" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "from-purple-500 to-pink-500" },
    { id: "billing", label: "Billing", icon: CreditCard, color: "from-amber-500 to-orange-500" },
  ];

  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    avatar_url: null,
  });

  // Avatar UI state
  const [avatarPreview, setAvatarPreview] = useState(""); // preview URL (local object or remote)
  const [avatarFile, setAvatarFile] = useState(null); // File object selected
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Saved cards state for billing tab
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      setFormData((p) => ({
        ...p,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        avatar_url: user.avatar_url || null,
      }));
      // set initial avatar preview from user avatar_url
      setAvatarPreview(user.avatar_url || "");
      // fetch saved cards for billing tab
      fetchSavedCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  /* ---------------------------------------
     Avatar handlers
  -----------------------------------------*/
  function onAvatarSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    // basic client-side validation
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(f.type)) {
      toast.error("Please select a jpeg/png/webp image.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Image is too large (max 4MB).");
      return;
    }
    // revoke previous object URL if any
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    const objUrl = URL.createObjectURL(f);
    setAvatarFile(f);
    setAvatarPreview(objUrl);
  }

  async function uploadAvatarToServer(file) {
    if (!file) return null;
    setUploadingAvatar(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch(`${API || ""}/api/auth/avatar`, {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || "Failed to upload avatar";
        throw new Error(msg);
      }

      // Expect { success: true, avatar_url, public_id }
      if (data && data.avatar_url) {
        // update local preview to the returned URL (CDN)
        setAvatarPreview(data.avatar_url);
        // update formData avatar_url so it is saved with user profile
        setFormData((p) => ({ ...p, avatar_url: data.avatar_url }));
        // update auth context user immediately if available
        if (updateUser) {
          updateUser({ ...user, avatar_url: data.avatar_url });
        }
        return data.avatar_url;
      }
      return null;
    } catch (err) {
      console.error("uploadAvatarToServer error", err);
      toast.error(err.message || "Failed to upload avatar");
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  }

  /* ---------------------------------------
     Saved cards API helpers
  -----------------------------------------*/
  const getAuthHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  async function fetchSavedCards() {
    try {
      setLoadingCards(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setSavedCards([]);
        return;
      }
      const res = await fetch(`${API || ""}/api/users/cards`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn("Failed to load saved cards", data);
        setSavedCards([]);
        return;
      }
      // expected: { cards: [...] }
      setSavedCards(data.cards || []);
    } catch (err) {
      console.error("fetchSavedCards error", err);
      setSavedCards([]);
    } finally {
      setLoadingCards(false);
    }
  }

  async function deleteSavedCard(cardId) {
    if (!cardId) return;
    if (!confirm("Permanently delete this saved card?")) return;
    try {
      const res = await fetch(`${API || ""}/api/users/cards/${cardId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message || "Failed to delete card");
        return;
      }
      toast.success("Card removed");
      // refresh list
      fetchSavedCards();
    } catch (err) {
      console.error("deleteSavedCard error", err);
      toast.error("Failed to delete card");
    }
  }

  async function setDefaultCard(cardId) {
    if (!cardId) return;
    try {
      const res = await fetch(`${API || ""}/api/users/cards/${cardId}/default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message || "Failed to set default card");
        return;
      }
      toast.success("Default card updated");
      fetchSavedCards();
    } catch (err) {
      console.error("setDefaultCard error", err);
      toast.error("Failed to set default card");
    }
  }

  /* ---------------------------------------
     SAVE — UPDATED to include avatar upload
     and toast loading/update handling
  -----------------------------------------*/
  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const endpoint = API ? `${API}/api/auth/update-profile` : "/api/auth/update-profile";

      if (activeTab === "basic") {
        /* Name check */
        if (!formData.full_name || formData.full_name.trim().length < 2) {
          toast.error("Please enter a valid full name", { id: toastId });
          setIsSaving(false);
          return;
        }

        /* Email check */
        const cleanEmail = normalizeEmailClient(formData.email);

        if (!isValidEmailClient(cleanEmail)) {
          toast.error("Invalid email format", { id: toastId });
          setIsSaving(false);
          return;
        }

        /* Phone check */
        let cleanPhone = formData.phone?.trim() || "";

        cleanPhone = cleanPhone ? normalizePhoneClient(cleanPhone) : null;

        if (cleanPhone && !isValidPhoneClient(cleanPhone)) {
          toast.error("Invalid phone number format", { id: toastId });
          setIsSaving(false);
          return;
        }

        // If a new avatar file was chosen, upload it first
        let avatarUrlToSend = formData.avatar_url || null;
        if (avatarFile) {
          const up = await uploadAvatarToServer(avatarFile);
          if (up) avatarUrlToSend = up;
          // if upload failed, uploadAvatarToServer already notified the user and we may continue without avatar
        }

        const payload = {
          full_name: formData.full_name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          country: formData.country || null,
          avatar_url: avatarUrlToSend,
        };

        const res = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(data?.message || "Failed to update profile", { id: toastId });
          setIsSaving(false);
          return;
        }

        if (data.success && updateUser) updateUser(data.user);

        toast.success("Profile updated successfully!", { id: toastId });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // refetch saved cards after profile update (in case email changed)
        fetchSavedCards();
      }

      /* SECURITY TAB (unchanged business logic, just toast updates and redirect on success) */
      else if (activeTab === "security") {
        const { currentPassword, newPassword, confirmPassword } = formData;

        if (!currentPassword || !newPassword || !confirmPassword) {
          toast.error("Please fill all password fields", { id: toastId });
          setIsSaving(false);
          return;
        }

        if (newPassword.length < 6) {
          toast.error("New password must be at least 6 characters", { id: toastId });
          setIsSaving(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match", { id: toastId });
          setIsSaving(false);
          return;
        }

        const payload = { currentPassword, newPassword };
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(data?.message || "Failed to change password", { id: toastId });
          setIsSaving(false);
          return;
        }

        // Clear password fields locally
        setFormData((p) => ({
          ...p,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));

        // Notify user and then log them out and redirect to login.
        toast.success("Password changed successfully! Please log in with your new password.", { id: toastId });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        try {
          // Remove token and clear auth context so they are effectively logged out
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
          if (updateUser) {
            updateUser(null);
          }
        } catch (e) {
          console.warn("Error clearing auth state after password change:", e);
        }

        // Give the success toast a moment to be readable, then redirect to login
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.message || "Failed to save changes", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  /* -------------------------
     UI helpers
  --------------------------*/
  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* User Profile Card */}
          <div className="lg:w-1/3">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                  {/* Avatar preview or initial */}
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  <p className="text-blue-100">{user?.email}</p>
                </div>
              </div>

              {/* Avatar change controls */}
              <div className="flex items-center gap-3 mb-4">
                <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-white/20 rounded-md">
                  <input type="file" accept="image/*" className="hidden" onChange={onAvatarSelect} />
                  <span className="text-sm">Change Avatar</span>
                </label>
                {avatarFile && (
                  <button
                    onClick={() => {
                      // remove selected file and revert preview to saved avatar or initials
                      if (avatarPreview && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
                      setAvatarFile(null);
                      setAvatarPreview(user?.avatar_url || "");
                    }}
                    className="px-3 py-2 bg-white/10 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                )}
                {uploadingAvatar && <div className="text-sm text-white/80">Uploading...</div>}
              </div>

              <div className="grid mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-xs text-blue-100">Member Since</div>
                  <div className="font-medium">
                    {user?.created_at &&
                      new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div className="bg-white rounded-full h-2 w-5/5"></div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${activeTab === t.id ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
                  >
                    <t.icon className="inline-block mr-2" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Full name</label>
                    <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Email</label>
                      <input name="email" value={formData.email} onChange={handleChange} className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Phone</label>
                      <input name="phone" value={formData.phone || ""} onChange={handleChange} className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400">Country</label>
                    <input name="country" value={formData.country || ""} onChange={handleChange} className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200" />
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">Your changes will be saved to your profile</div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700">
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )} 

              {activeTab === "security" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Current password</label>
                    <div className="relative">
                      <input
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        type={showCurrentPassword ? "text" : "password"}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 pr-10 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">New password</label>
                      <div className="relative">
                        <input
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          type={showNewPassword ? "text" : "password"}
                          className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Confirm password</label>
                      <div className="relative">
                        <input
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div />
                    <div className="flex items-center gap-3">
                      <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-700">
                        {isSaving ? "Saving..." : "Change Password"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h3 className="font-medium mb-2">Notification preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2"><input type="checkbox" name="notifications.email" checked={formData.notifications.email} onChange={handleChange} /> Email</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="notifications.push" checked={formData.notifications.push} onChange={handleChange} /> Push</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="notifications.sms" checked={formData.notifications.sms} onChange={handleChange} /> SMS</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="notifications.marketing" checked={formData.notifications.marketing} onChange={handleChange} /> Marketing</label>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div>
                  <h3 className="font-medium mb-2">Billing & payment</h3>
                  <p className="text-sm text-gray-500 mb-4">Manage payment methods and invoices.</p>

                  {/* Saved Cards Grid */}
                  <div className="flex flex-wrap -m-2">
                    {loadingCards ? (
                      <div className="w-full p-2 text-center text-sm text-gray-500">Loading saved cards...</div>
                    ) : savedCards.length === 0 ? (
                      <div className="w-full p-2 text-center text-sm text-gray-500">
                        No saved cards found. Add a card when booking to save it here.
                      </div>
                    ) : (
                      savedCards.map((c) => (
                        <SavedCard key={c.id} card={c} onDelete={deleteSavedCard} onSetDefault={setDefaultCard} />
                      ))
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}