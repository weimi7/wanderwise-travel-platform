'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Star, ArrowRight, Users, Briefcase, Heart, Globe } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
              opacity:  0
            }}
            animate={{
              x: [
                Math.random() * 100 + 'vw',
                Math.random() * 100 + 'vw',
                Math.random() * 100 + 'vw'
              ],
              y: [
                Math.random() * 100 + 'vh',
                Math.random() * 100 + 'vh',
                Math.random() * 100 + 'vh'
              ],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat:  Infinity,
              ease: "linear"
            }}
            className="absolute w-64 h-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${i % 3 === 0 ?  '#60a5fa' : i % 3 === 1 ? '#a78bfa' : '#34d399'}22, transparent 70%)`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity:  1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-8 shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Join Our Growing Team
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            Build the Future of
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient"
            >
              Travel Experiences
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Join a passionate team of innovators building cutting-edge solutions that 
            help millions discover the world&apos;s beauty, starting from the heart of Sri Lanka.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="#open-positions">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 cursor-pointer relative overflow-hidden"
              >
                <span className="relative z-10">Explore Opportunities</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover: translate-x-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>

            <button
              onClick={() => document.getElementById('culture')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white rounded-2xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl"
            >
              Meet Our Team
            </button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { number: '50+', label: 'Global Team Members', icon: Users, color: 'blue' },
            { number: '15+', label: 'Open Positions', icon: Briefcase, color: 'purple' },
            { number: '95%', label: 'Employee Satisfaction', icon: Heart, color: 'pink' },
            { number: '20+', label: 'Countries Represented', icon: Globe, color: 'emerald' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.number}
                </div>
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}