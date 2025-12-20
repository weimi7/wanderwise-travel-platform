'use client';

import { motion } from 'framer-motion';
import { Sparkles, Users, Target, Heart, Globe, Award } from 'lucide-react';

// Import components
import AboutHero from "@/components/about/AboutHero";
import AboutStats from "@/components/about/AboutStats";
import CompanyTimeline from "@/components/about/CompanyTimeline";
import CoreValues from "@/components/about/CoreValues";
import TeamSection from "@/components/about/TeamSection";
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/4 w-32 h-32 bg-green-200 dark:bg-green-900 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <AboutHero />

        {/* Mission Statement Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="py-20 px-4"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 mb-6"
              >
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Our Purpose</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
                Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mission</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                To transform how travelers experience Sri Lanka by providing personalized, authentic, 
                and unforgettable journeys that connect people with the heart and soul of this beautiful island.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "Global Reach",
                  description: "Connecting travelers from around the world to Sri Lanka's hidden gems",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: Heart,
                  title: "Local Love",
                  description: "Supporting local communities and sustainable tourism practices",
                  color: "from-green-500 to-green-600"
                },
                {
                  icon: Award,
                  title: "Excellence",
                  description: "Committed to delivering exceptional travel experiences every time",
                  color: "from-purple-500 to-purple-600"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <AboutStats />

        {/* Story Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
                  Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Story</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Founded by passionate travelers who fell in love with Sri Lanka&#39;s beauty and culture, 
                  WanderWise was born from a desire to share this magical island with the world. What started 
                  as a simple blog has grown into a comprehensive travel platform helping thousands of 
                  travelers discover authentic Sri Lankan experiences.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Today, we&#39;re proud to be Sri Lanka&#39;s most trusted travel companion, offering personalized 
                  itineraries, local insights, and unforgettable adventures that go beyond the guidebooks.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-8 text-white text-center">
                  <Users className="w-16 h-16 text-white mx-auto mb-4 opacity-90" />
                  <div className="text-4xl font-bold mb-2">5,000+</div>
                  <div className="text-xl font-semibold">Happy Travelers</div>
                  <div className="text-blue-100 mt-2">and counting...</div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full"></div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <CompanyTimeline />
        <CoreValues />
        <TeamSection />

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-20 px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-6 right-6 opacity-20">
                <Target className="w-16 h-16" />
              </div>
              <div className="absolute bottom-6 left-6 opacity-20">
                <Heart className="w-16 h-16" />
              </div>
              
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of travelers who have discovered the magic of Sri Lanka with WanderWise
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                <Link href="/itinerary-planner">Plan Your Adventure</Link>
              </motion.button>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}