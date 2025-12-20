"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Compass,
  Plane,
  Calendar,
  Wallet,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";

// Rotating text
const rotatingTexts = ["Perfect Trip ✈️", "Dream Vacation 🌴", "Luxury Getaway 🏖️"];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % rotatingTexts.length),
      3000
    );
    return () => clearInterval(interval);
  }, []);

  // ⭐ FIXED: Generate stars only on the client (no hydration error)
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generatedStars = [...Array(30)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStars(generatedStars);
  }, []);

  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <section
      className="relative min-h-screen bg-gradient-to-b from-[#0b0f1a] to-[#0e1323] flex items-center justify-center text-white overflow-hidden px-4"
      aria-label="Hero section for WanderWise itinerary planner"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: 0.5,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}

        {/* Gradient Blobs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm">AI-Powered Travel Planning</span>
        </motion.div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Plan Your{" "}
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            >
              {rotatingTexts[index]}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Let WanderWise AI craft a personalized travel itinerary tailored to
            your destinations, budget, and travel style. The easiest way to plan
            unforgettable journeys.
          </motion.p>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="#trip-form"
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 flex items-center gap-2 w-full justify-center max-w-xs mx-auto"
          >
            Start Planning Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto"
        >
          {[
            { icon: Calendar, title: "Smart Itineraries", desc: "AI-optimized daily travel plans" },
            { icon: Wallet, title: "Budget Friendly", desc: "Stay within your preferred budget" },
            { icon: Star, title: "Premium Suggestions", desc: "Hand-picked luxury experiences" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="bg-white/5 backdrop-blur-lg p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <item.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </motion.div>
      </motion.div>

      {/* Floating Icons */}
      <motion.div
        className="hidden xl:block absolute top-20 right-20"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Compass className="w-12 h-12 text-cyan-400/30" />
      </motion.div>

      <motion.div
        className="hidden xl:block absolute bottom-40 left-20"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Plane className="w-10 h-10 text-purple-400/30" />
      </motion.div>
    </section>
  );
}
