'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ContactBanner() {
  const [dots, setDots] = useState([]);

  // Generate floating dots positions only on client to prevent hydration mismatch
  useEffect(() => {
    const generatedDots = [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
    setDots(generatedDots);
  }, []);

  return (
    <section className="relative h-[100vh] min-h-[90vh] overflow-hidden mt-4">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>

        {/* Animated Floating Dots */}
        <div className="absolute inset-0">
          {dots.map((dot, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
              style={{ left: dot.left, top: dot.top }}
              animate={{ y: [0, -20, 0], opacity: [0, 0.4, 0] }}
              transition={{ duration: dot.duration, repeat: Infinity, delay: dot.delay }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/30 mb-6 text-xs sm:text-sm"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
          <span className="font-semibold">We&#39;re Here to Help</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
        >
          Let&#39;s{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Connect
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto leading-relaxed"
        >
          We&#39;d love to hear from you. Let&#39;s create something amazing together!
        </motion.p>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 w-full max-w-4xl"
        >
          {[
            { icon: Mail, text: 'info@wanderwise.com', label: 'Email Us' },
            { icon: Phone, text: '+94 77 297 6988', label: 'Call Us' },
            { icon: MapPin, text: 'Colombo, Sri Lanka', label: 'Visit Us' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="flex items-center gap-3 p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-colors cursor-pointer group text-sm sm:text-base"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white group-hover:text-blue-200 transition-colors truncate">
                  {item.text}
                </p>
                <p className="text-blue-100 text-xs sm:text-sm">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer flex items-center gap-2 sm:gap-3"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            Start a Conversation
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-white/80"
          >
            <span className="text-xs sm:text-sm mb-1 sm:mb-2">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Icons */}
      <div className="absolute top-6 sm:top-10 left-6 sm:left-10 opacity-20">
        <MessageCircle className="w-10 h-10 sm:w-16 sm:h-16 text-blue-300" />
      </div>
      <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 opacity-20">
        <Mail className="w-10 h-10 sm:w-16 sm:h-16 text-cyan-300" />
      </div>
    </section>
  );
}
