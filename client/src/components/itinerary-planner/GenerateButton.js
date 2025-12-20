"use client";

import { useState, useEffect } from "react";
import { Sparkles, AlertCircle, CheckCircle, Clock, Rocket, Brain, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanner } from "./PlannerProvider";

/**
 * Renders the Generate button but ensures only one instance shows across the page.
 * Uses a global window flag: window.__WANDERWISE_GENERATE_BUTTON_MOUNTED
 *
 * If you prefer to remove duplicates by editing JSX, simply remove one of the <GenerateButton />
 * usages instead of using this file-level guard.
 */

export default function GenerateButton() {
  const planner = usePlanner?.() || {};
  const {
    destinations = [],
    days = 0,
    preferences = "",
    loading = {},
    errors = {},
    generateItinerary,
    clearError = () => {},
  } = planner;

  // If another GenerateButton already mounted, this instance will hide itself.
  const [hiddenBecauseExists, setHiddenBecauseExists] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // server-side or test env guard
    if (typeof window === "undefined") return;

    // If another instance exists, mark this one hidden
    if (window.__WANDERWISE_GENERATE_BUTTON_MOUNTED) {
      setHiddenBecauseExists(true);
      return;
    }

    // Otherwise claim the slot
    window.__WANDERWISE_GENERATE_BUTTON_MOUNTED = true;

    // On unmount free the slot
    return () => {
      window.__WANDERWISE_GENERATE_BUTTON_MOUNTED = false;
    };
  }, []);

  const getValidationMessage = () => {
    if (!destinations || destinations.length === 0) return "Add at least 1 destination to continue";
    if (!days || days < 1) return "Trip must be at least 1 day";
    return null;
  };

  const validationMessage = getValidationMessage();
  const isGenerating = loading?.generation || false;
  const hasError = errors?.generation || null;

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 95 ? 95 : prev + Math.random() * 12));
      }, 600);
      return () => {
        clearInterval(interval);
        setProgress(0);
      };
    }
  }, [isGenerating]);

  if (hiddenBecauseExists) return null;

  const handleGenerate = () => {
    if (isGenerating || validationMessage) return;
    if (hasError) clearError("generation");
    generateItinerary?.();
  };

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center space-x-8 text-sm">
        {[
          { label: "Destinations", complete: destinations.length >= 1 },
          { label: "Days", complete: days >= 1 },
          { label: "Preferences", complete: preferences.length > 0 },
        ].map((step, index) => (
          <motion.div key={index} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1 }} className={`flex flex-col items-center gap-2 ${step.complete ? "text-green-400" : "text-gray-500"}`}>
            <div className={`p-2 rounded-full ${step.complete ? "bg-green-500/20 ring-2 ring-green-500/40" : "bg-gray-500/20 ring-2 ring-gray-600/30"}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">{step.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Error/Validation */}
      <AnimatePresence>
        {hasError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-red-300 font-medium">Generation Failed</span>
              <p className="text-red-300/80 text-sm mt-1">{hasError}</p>
            </div>
            <button onClick={() => clearError("generation")} className="ml-auto text-red-300 hover:text-red-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {validationMessage && !isGenerating && !hasError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="text-yellow-300 font-medium">Almost There!</span>
              <p className="text-yellow-300/80 text-sm mt-1">{validationMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate button */}
      <motion.div className="flex justify-center" whileHover={!validationMessage && !isGenerating ? { scale: 1.03 } : {}}>
        <button onClick={handleGenerate} disabled={validationMessage || isGenerating} className={`relative flex items-center gap-4 px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-500 overflow-hidden group ${validationMessage || isGenerating ? "bg-gray-600/50 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:shadow-2xl hover:shadow-blue-500/30 cursor-pointer"}`}>
          {isGenerating ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full" />
              <span>Creating Your Itinerary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-7 h-7" />
              <span>Generate AI Itinerary</span>
            </>
          )}

          {isGenerating && <motion.div initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400" />}
        </button>
      </motion.div>
    </div>
  );
}