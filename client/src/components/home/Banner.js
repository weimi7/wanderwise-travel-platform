'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronDown, MapPin, Star, Compass } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const Banner = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative w-full h-[100vh] sm:h-screen flex items-center justify-center overflow-hidden mt-2 sm:mt-4">
      {/* Banner image with gradient overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://res.cloudinary.com/daziy1ben/image/upload/colombo_c6kz48.avif"
          alt="Sri Lanka Travel Banner"
          fill
          priority
          className="object-cover transition-opacity duration-1000"
          style={{ opacity: imageLoaded ? 1 : 0 }}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent"></div>
      </div>

      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse"></div>
      )}

      {/* Main content */}
      <div className="relative z-10 text-center px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="mb-4 sm:mb-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-6 rounded-full border border-white/20 mb-3 sm:mb-6"
          >
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
            <span className="text-white text-[10px] sm:text-sm font-medium">
              #1 Travel Destination 2025
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-6 text-white leading-snug sm:leading-tight">
            Discover the{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Magic
            </span>{' '}
            of Sri Lanka
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-lg md:text-xl text-white/90 mb-5 sm:mb-8 max-w-md sm:max-w-2xl mx-auto leading-relaxed"
          >
            Experience custom itineraries, hidden gems, and authentic local insights that transform your journey into an unforgettable adventure.
          </motion.p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mb-6 sm:mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-medium sm:font-semibold text-sm sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              <Link href="/auth/login">Start Your Journey</Link>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-3 gap-2 sm:gap-6 max-w-sm sm:max-w-2xl mx-auto mb-6 sm:mb-12"
        >
          {[
            { number: '5K+', label: 'Happy Travelers' },
            { number: '30+', label: 'Hidden Gems' },
            { number: '24/7', label: 'Local Support' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              className="text-center p-2 sm:p-4 bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10"
            >
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-0.5 sm:mb-1">
                {stat.number}
              </div>
              <div className="text-white/80 text-[10px] sm:text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-3 sm:bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-white/80"
        >
          <span className="text-[10px] sm:text-sm mb-1">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6" />
        </motion.div>
      </motion.div>

      {/* Decorative icons */}
      <div className="absolute top-2 sm:top-8 left-2 sm:left-8 opacity-50">
        <MapPin className="w-6 h-6 sm:w-12 sm:h-12 text-yellow-400" />
      </div>
      <div className="absolute top-6 sm:top-12 right-4 sm:right-12 opacity-50">
        <Compass className="w-6 h-6 sm:w-10 sm:h-10 text-blue-400" />
      </div>
    </section>
  );
};

export default Banner;
