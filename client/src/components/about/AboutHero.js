'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Compass, Heart, Users, Sparkles, ArrowDown, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

export default function AboutHero() {

  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background image with multiple overlays */}
      <div className="absolute inset-0">
        
        {/* Multiple gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-transparent"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="z-10 text-center px-6 max-w-4xl relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-8"
        >
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-sm font-semibold">Since 2020</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            WanderWise
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Discover Sri Lanka with confidence. Our mission is to make your travel experience 
          smarter, richer, and more connected to the heart of this beautiful island.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto"
        >
          {[
            { icon: Users, number: '5K+', label: 'Travelers', color: 'text-blue-300' },
            { icon: Star, number: '500+', label: '5-Star Reviews', color: 'text-red-300' },
            { icon: MapPin, number: '30+', label: 'Destinations', color: 'text-green-300' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.number}</div>
              <div className="text-blue-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-blue-200"
      >
        <span className="text-sm mb-2">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-blue-300/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-blue-300 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <Compass className="w-16 h-16 text-blue-300" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <Heart className="w-16 h-16 text-rose-300" />
      </div>
    </section>
  );
}