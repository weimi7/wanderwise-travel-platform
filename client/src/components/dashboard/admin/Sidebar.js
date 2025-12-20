"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, BarChart3, Users, CalendarCheck2, Settings, LogOut, Shield, ChevronRight, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Overview", href: "/dashboard/admin", icon: BarChart3, color: "text-blue-400" },
  { name: "Users", href: "/dashboard/admin/user-management", icon: Users, color: "text-green-400" },
  { name: "Bookings", href: "/dashboard/admin/booking-management", icon: CalendarCheck2, color: "text-purple-400" },
  { name: "Reviews", href: "/dashboard/admin/reviews", icon: Bell, color: "text-red-400" },
  { name: "Settings", href: "/dashboard/admin/settings", icon: Settings, color: "text-yellow-400" },
  { name: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: Shield, color: "text-teal-400" },

];

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(null);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-6 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white"
                            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700 group-hover:bg-blue-500/20'} transition-colors`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                        </div>
                        <span className="ml-3 font-medium">{item.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-1.5 h-1.5 bg-blue-400 rounded-full ml-auto"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-gray-700 space-y-3">
                <Link
                  href="/"
                  className="flex items-center px-4 py-3 rounded-xl text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-gray-700 group-hover:bg-green-500/20 transition-colors">
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="ml-3 font-medium">Go to Home</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Fixed positioning */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:flex lg:flex-col"
      >
        <div className="flex flex-col flex-1 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700">
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white"
                        : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                    }`}
                    onMouseEnter={() => setIsHovered(item.name)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700 group-hover:bg-blue-500/20'} transition-colors`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                    </div>
                    <span className="ml-3 font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full ml-auto"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-700 space-y-3">
            <Link
              href="/"
              className="flex items-center px-4 py-3 rounded-xl text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-all group"
            >
              <div className="p-2 rounded-lg bg-gray-700 group-hover:bg-green-500/20 transition-colors">
                <Home className="w-5 h-5" />
              </div>
              <span className="ml-3 font-medium">Go to Home</span>
            </Link>
          </div>

          {/* Admin Info */}
          <div className="px-4 py-4 bg-gray-700/50 rounded-lg mx-3 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Admin User</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Last login: Today</span>
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}