"use client";

import Link from "next/link";
import {
  Home,
  Calendar,
  Heart,
  Settings,
  LogOut,
  ArrowLeft,
  User,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ role, nameSlug }) {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      href: `/dashboard/${role}/${nameSlug}`,
      icon: Home,
      label: "Dashboard Home",
    },
    {
      id: "bookings",
      href: `/dashboard/${role}/${nameSlug}/bookings`,
      icon: Calendar,
      label: "My Bookings",
    },
    {
      id: "reviews",
      href: `/dashboard/${role}/${nameSlug}/reviews`,
      icon: Star,
      label: "My Reviews",
    },
    {
      id: "favorites",
      href: `/dashboard/${role}/${nameSlug}/favorites`,
      icon: Heart,
      label: "My Favorites",
    },
    {
      id: "profile",
      href: `/dashboard/${role}/${nameSlug}/profile`,
      icon: Users,
      label: "My Profile",
    },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl flex flex-col h-screen relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full translate-y-20 -translate-x-20"></div>

      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WanderWise
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Traveler Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href={item.href}
                onClick={() => setActiveItem(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeItem === item.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {activeItem === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 bg-white rounded-full ml-auto"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t dark:border-gray-700 space-y-2 relative z-10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go to Home</span>
        </Link>
      </div>

      {/* Hover animations */}
      <AnimatePresence>
        {isHovered && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute bottom-1/3 left-6 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-40"
            />
          </>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
