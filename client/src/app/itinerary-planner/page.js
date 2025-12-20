"use client";

import { useState, useEffect } from "react";
import PlannerProvider from "@/components/itinerary-planner/PlannerProvider";

import HeroSection from "@/components/itinerary-planner/HeroSection";
import TripDetailsForm from "@/components/itinerary-planner/TripDetailsForm";
import GenerateButton from "@/components/itinerary-planner/GenerateButton";
import ChatTab from "@/components/itinerary-planner/ChatTab";
import ItineraryViewer from "@/components/itinerary-planner/ItineraryViewer";

import { motion, AnimatePresence } from "framer-motion";
import { Map, MessageCircle, HelpCircle, Plane } from "lucide-react";

export default function ItineraryPlannerPage() {
  const [activeTab, setActiveTab] = useState("planner");
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  // FIX: Generate random spheres only on the client after hydration
  const [spheres, setSpheres] = useState([]);

  useEffect(() => {
    const generated = [...Array(18)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 120 + 60,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 6,
    }));
    setSpheres(generated);
  }, []);

  return (
    <PlannerProvider>
      <section className="min-h-screen text-white relative overflow-hidden p-4 md:p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">

        {/* Floating glowing background spheres */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {spheres.map((s, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)",
              }}
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.7, 1, 0.7],
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: s.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <HeroSection />

          {/* Help Floating Button */}
          <motion.button
            onClick={() => setIsHelpVisible(!isHelpVisible)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg hover:bg-white/20"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>

          {/* Help Tooltip */}
          <AnimatePresence>
            {isHelpVisible && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="fixed top-16 right-4 w-80 z-50 p-5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
              >
                <h4 className="font-semibold text-white mb-2">Need Help?</h4>
                <p className="text-sm text-gray-300">
                  Fill your trip details (destination, dates, budget, preferences)
                  and click <span className="text-blue-400">Generate</span>.
                  The AI will create your itinerary instantly.
                </p>

                <button
                  onClick={() => setIsHelpVisible(false)}
                  className="mt-3 text-xs text-blue-300 hover:text-blue-200 transition"
                >
                  Got it!
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TWO-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

            {/* LEFT: Planner & Chat */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl"
            >
              <div className="flex justify-center gap-2 mb-6 bg-white/5 p-1 backdrop-blur-xl border border-white/10 rounded-xl">

                {/* Planner Tab */}
                <motion.button
                  onClick={() => setActiveTab("planner")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "planner"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Map className="w-4 h-4" /> Planner
                </motion.button>

                {/* Chatbot Tab */}
                <motion.button
                  onClick={() => setActiveTab("chatbot")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "chatbot"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" /> Assistant
                </motion.button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "planner" && (
                  <motion.div
                    key="planner"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    <TripDetailsForm />
                    <GenerateButton />
                  </motion.div>
                )}

                {activeTab === "chatbot" && (
                  <motion.div
                    key="chatbot"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="h-[600px]"
                  >
                    <ChatTab />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* RIGHT: Itinerary Viewer */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-2xl p-6 backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg shadow-emerald-400/20">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Your Itinerary</h3>
                  <p className="text-sm text-gray-400">Generated by AI</p>
                </div>
              </div>

              <ItineraryViewer />
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-center mt-10 text-gray-400 text-sm">
            Powered by WanderWise • AI Travel Intelligence
          </div>
        </div>
      </section>
    </PlannerProvider>
  );
}
