"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/admin/Sidebar";
import Topbar from "@/components/dashboard/admin/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [circles, setCircles] = useState([]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Generate background animation circles ONLY on client
  useEffect(() => {
    const data = [...Array(10)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: Math.random() * 200 + 50,
      height: Math.random() * 200 + 50,
      duration: 15 + Math.random() * 15,
      delay: Math.random() * 5,
    }));

    setCircles(data);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
              <p className="text-gray-300">Loading your dashboard...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content wrapper */}
      <div className="lg:ml-64 min-h-screen flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-30">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Topbar setSidebarOpen={setSidebarOpen} />
          </motion.div>
        </header>

        {/* Animated Background — Hydration Safe */}
        {circles.length > 0 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {circles.map((circle, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: circle.left,
                  top: circle.top,
                  width: circle.width,
                  height: circle.height,
                  background:
                    "radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)",
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.1, 0],
                }}
                transition={{
                  duration: circle.duration,
                  repeat: Infinity,
                  delay: circle.delay,
                }}
              />
            ))}
          </div>
        )}

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-6 relative z-10"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-6"
            >
              {children}
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* Quick Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
