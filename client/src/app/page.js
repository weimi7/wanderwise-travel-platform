'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

// Component Imports
import Banner from '@/components/home/Banner';
import QuickSearch from '@/components/home/QuickSearch';
import FeaturedDestinations from '@/components/home/FeaturedDestinations';
import FeaturedActivities from '@/components/home/FeaturedActivities';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on load
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.main 
      className="bg-gradient-to-b text-gray-800 dark:text-white overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30 animate-pulse-slow delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-green-200 dark:bg-green-900/20 rounded-full blur-3xl opacity-25 animate-pulse-slow delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.div variants={itemVariants}>
          <Banner />
        </motion.div>

        <motion.div variants={itemVariants}>
          <QuickSearch />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FeaturedDestinations />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FeaturedActivities />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Testimonials />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CallToAction />
        </motion.div>
      </div>

      {/* Floating Navigation Helper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group cursor-pointer"
        >
          <svg 
            className="w-6 h-6 text-white transform group-hover:-translate-y-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </motion.div>
    </motion.main>
  );
};

export default Home;