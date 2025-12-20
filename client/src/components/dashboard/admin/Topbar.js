"use client";

import { Bell, Search, Settings, User, LogOut, ChevronDown, Menu, HelpCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function Topbar({ role, nameSlug, onMenuToggle, isSidebarOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const userMenuRef = useRef(null);

  // Centralized auth hook - get user + logout
  const { user, logout } = useAuth() || {};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (logout) await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setShowUserMenu(false);
      router.push("/");
    }
  };

  const clearNotifications = () => {
    setShowNotifications(false);
  };

  const displayName = (nameSlug || (user && user.full_name) || "user")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const notifications = [
    { id: 1, title: "New booking", message: "Customer booked a 3-day trip", time: "2 min ago", read: false },
    { id: 2, title: "System update", message: "New features available", time: "1 hour ago", read: true },
    { id: 3, title: "Payment received", message: "Payment of $299 received", time: "5 hours ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Avatar helpers
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm relative z-30">
      {/* Left side: Menu button and title */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => typeof onMenuToggle === "function" ? onMenuToggle() : null}
          className="lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent hidden sm:block"
        >
          Admin Dashboard
        </motion.h1>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2"
        >
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-40 lg:w-56 placeholder-gray-400 text-gray-700 dark:text-gray-300"
          />
        </motion.div>
      </div>

      {/* Right side: Actions and user dropdown */}
      <div className="flex items-center gap-4">
        {/* Help button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications((s) => !s)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                  <button className="text-xs text-blue-500" onClick={clearNotifications}>Close</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="font-medium text-gray-800 dark:text-white">{notification.title}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User dropdown */}
        <div className="relative" ref={userMenuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUserMenu((s) => !s)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {/* Avatar: use user.avatar_url when available, otherwise initials */}
            {user && user.avatar_url ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                <Image
                  src={user.avatar_url}
                  alt={user.full_name || "avatar"}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(user?.full_name || user?.email || "U")}
              </div>
            )}

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
              {user?.full_name ? user.full_name : "Account"}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.full_name || "User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || "Member"}</p>
                </div>

                <Link
                  href="/dashboard/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlay for dropdowns */}
      <AnimatePresence>
        {(showUserMenu || showNotifications) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            onClick={() => {
              setShowUserMenu(false);
              setShowNotifications(false);
            }}
          />
        )}
      </AnimatePresence>
    </header>
  );
}