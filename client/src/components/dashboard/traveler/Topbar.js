"use client";

import { Bell, Search, Settings, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Topbar({ role, nameSlug, onMenuToggle, isSidebarOpen }) {
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const userMenuRef = useRef(null);

  // Centralized auth hook
  const { logout, user } = useAuth() || {};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Call centralized logout (clears context + storage)
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Navigate after logout completes
      router.push("/");
    }
  };

  const clearNotifications = () => {
    setNotificationCount(0);
    setShowNotifications(false);
  };

  const displayName = (nameSlug || (user && user.full_name) || "user")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Prefer authenticated user's avatar_url, fallback to initial
  const avatarUrl = user?.avatar_url || null;
  const initial = (user?.full_name || nameSlug || "User").charAt(0).toUpperCase();

  const notifications = [
    { id: 1, title: "Booking Confirmed", message: "Your stay at Serenity Resort has been confirmed", time: "2 min ago" },
    { id: 2, title: "Special Offer", message: "Get 20% off on your next booking", time: "1 hour ago" },
    { id: 3, title: "Reminder", message: "Your trip to Ella starts tomorrow", time: "5 hours ago" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md relative z-20"
    >
      {/* Sidebar Toggle (Mobile) */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-4 md:hidden cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Page Title */}
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">
        Dashboard Overview
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Notifications
                  </h3>
                  {notificationCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-blue-500 hover:text-blue-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationCount > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="font-medium text-gray-800 dark:text-white">
                          {notification.title}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No new notifications
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={userMenuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            aria-label="User Menu"
          >
            {/* Avatar: show image if available, else initial */}
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${displayName} avatar`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {initial}
              </div>
            )}

            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-800 dark:text-white">
                {displayName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {role?.toUpperCase()}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1"
              >
                <Link href={`/dashboard/${role}/${nameSlug}/profile`} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}