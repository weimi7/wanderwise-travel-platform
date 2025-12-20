"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/traveler/Sidebar";
import Topbar from "@/components/dashboard/traveler/Topbar";

export default function UserDashboardLayout({ children, params }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Correct way to extract slug param
  const { name } = React.use(params);

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : isMobile ? -280 : -80,
          width: isSidebarOpen ? 280 : isMobile ? 280 : 80,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed md:relative z-40 h-screen flex-shrink-0"
      >
        <Sidebar
          role="traveler"
          nameSlug={name}
          isCollapsed={!isSidebarOpen && !isMobile}
          onToggle={toggleSidebar}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col min-h-screen"
      >
        <Topbar
          role="traveler"
          nameSlug={name}
          onMenuToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 md:p-6 flex-1 overflow-y-auto"
        >
          {children}
        </motion.main>

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute bottom-20 left-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
          />
        </div>
      </motion.div>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex items-center justify-center text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </motion.button>
      )}
    </div>
  );
}
