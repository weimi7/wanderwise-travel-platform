'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import seedrandom from "seedrandom";

const CallToAction = () => {
  // Pre-generate random positions once, stable across renders
  const rng = seedrandom("fixed-seed");
  const dots = Array.from({ length: 20 }, () => ({
    left: `${rng() * 100}%`,
    top: `${rng() * 100}%`,
    duration: 3 + rng() * 4,
    delay: rng() * 2,
  }));

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          {dots.map((dot, index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 bg-white rounded-full"
              style={{ left: dot.left, top: dot.top }}
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: dot.duration,
                repeat: Infinity,
                delay: dot.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-700/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-700/40 to-transparent"></div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <MapPin className="w-16 h-16 text-white" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <Compass className="w-16 h-16 text-white" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-semibold">
              Join 2,000+ Happy Travelers
            </span>
          </motion.div>

          {/* Main heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Explore the{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Magic
            </span>{' '}
            of Sri Lanka?
          </h2>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Let WanderWise craft your perfect Sri Lankan adventure with
            personalized itineraries, hidden gems, and local insights that
            transform your journey into an unforgettable experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/itinerary-planner">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer flex items-center gap-3"
              >
                <span className="relative z-10">Start Planning Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </motion.button>
            </Link>

            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden bg-transparent text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-3"
              >
                <span className="relative z-10">Learn More</span>
                <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            viewport={{ once: true }}
            className="mt-8 text-blue-100 text-sm"
          >
            <p>✨ No credit card required • Free itinerary planning • 24/7 support</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
