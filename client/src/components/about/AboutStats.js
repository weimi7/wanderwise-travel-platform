'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaGlobeAsia, FaUserFriends, FaHotel, FaAward, FaStar, FaHeart, FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';
import { Users, Globe, Building, Award, Sparkles, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: <Users className="w-8 h-8" />,
    label: 'Happy Travelers',
    value: 5000,
    suffix: '+',
    description: 'Satisfied adventurers',
    color: 'from-blue-500 to-cyan-500',
    delay: 0.1
  },
  {
    icon: <Globe className="w-8 h-8" />,
    label: 'Destinations',
    value: 30,
    suffix: '+',
    description: 'Across Sri Lanka',
    color: 'from-green-500 to-emerald-500',
    delay: 0.2
  },
  {
    icon: <Building className="w-8 h-8" />,
    label: 'Accommodation Partners',
    value: 20,
    suffix: '+',
    description: 'Quality stays',
    color: 'from-purple-500 to-pink-500',
    delay: 0.3
  },
  {
    icon: <Award className="w-8 h-8" />,
    label: 'Awards Won',
    value: 10,
    suffix: '+',
    description: 'Industry recognition',
    color: 'from-orange-500 to-amber-500',
    delay: 0.4
  }
];

export default function AboutStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 mb-6"
          >
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Our Journey in Numbers</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Travelers</span> Choose Us
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Trusted by thousands of adventurers exploring the beautiful island of Sri Lanka
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: stat.delay }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 h-full relative overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>

                {/* Animated number */}
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
                    {isInView ? stat.value.toLocaleString() : '0'}
                  </span>
                  {stat.suffix && (
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.suffix}
                    </span>
                  )}
                </div>

                {/* Label */}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {stat.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Growing Everyday</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Join thousands of travelers who trust WanderWise for their Sri Lankan adventures
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </section>
  );
}