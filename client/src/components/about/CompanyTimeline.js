'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaRocket, FaUsers, FaHotel, FaBrain, FaAward, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import { Rocket, Users, Building, Brain, Award, Calendar, MapPin, Sparkles, TrendingUp } from 'lucide-react';

const timeline = [
  {
    year: '2020',
    title: 'Founded WanderWise',
    description: 'Our journey began with a mission to redefine how people explore Sri Lanka.',
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    milestone: '🚀 Launch',
    delay: 0.1
  },
  {
    year: '2022',
    title: 'First 1,000 Travelers',
    description: 'Reached a major milestone by helping 1,000 travelers plan memorable trips.',
    icon: <Users className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    milestone: '🎯 Milestone',
    delay: 0.2
  },
  {
    year: '2024',
    title: 'Partnered with 20+ Hotels',
    description: 'Expanded our network with top-rated local accommodations across Sri Lanka.',
    icon: <Building className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    milestone: '🏨 Expansion',
    delay: 0.3
  },
  {
    year: '2025',
    title: 'AI Itinerary Planner Launched',
    description: 'Introduced AI-powered trip planning to personalize user experiences.',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500',
    milestone: '🤖 Innovation',
    delay: 0.4
  },
  {
    year: '2025',
    title: 'Award for Best Travel Platform',
    description: 'Recognized nationally for innovation in travel technology and customer satisfaction.',
    icon: <Award className="w-6 h-6" />,
    color: 'from-red-500 to-rose-500',
    milestone: '🏆 Recognition',
    delay: 0.5
  }
];

export default function CompanyTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
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
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Our Journey</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Story</span> Through Time
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From humble beginnings to becoming Sri Lanka&#39;s leading travel companion
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={ref} className="relative">

          {timeline.map((event, index) => {
            const isLeft = index % 2 === 0;
            const isLast = index === timeline.length - 1;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: event.delay }}
                viewport={{ once: true, margin: "-50px" }}
                className={`mb-16 md:mb-24 flex flex-col md:flex-row items-start ${isLeft ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content Card */}
                <div className={`md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'} relative`}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className=" dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 relative overflow-hidden group cursor-pointer"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                    {/* Milestone badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-gradient-to-r ${event.color} text-white`}>
                      {event.milestone}
                    </div>

                    {/* Year */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{event.year}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Decorative corner */}
                    <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.div>
                </div>

                {/* Center connector with icon */}
                <div className="hidden md:flex flex-col items-center justify-center w-12 relative">
                  
                  {/* Icon circle */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 bg-gradient-to-r ${event.color} rounded-full flex items-center justify-center text-white shadow-lg z-10 relative group`}
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {event.icon}
                    </div>
                    
                    {/* Pulse animation */}
                    <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </motion.div>
                </div>

                {/* Mobile icon */}
                <div className="md:hidden flex justify-center my-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${event.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                    {event.icon}
                  </div>
                </div>

                {/* Spacer for mobile */}
                <div className="md:hidden w-full"></div>
              </motion.div>
            );
          })}

          {/* Future arrow */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">The journey continues...</span>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
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
    </section>
  );
}