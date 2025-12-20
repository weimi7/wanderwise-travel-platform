'use client';
import { motion } from 'framer-motion';

// Import components
import TransportOptionsSection from "@/components/transportation/TransportOptionsSection";
import TravelTipsSection from "@/components/transportation/TravelTipsSection";

export default function TransportationPage() {
  return (
    <main className="min-h-screen mt-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800 px-4 md:px-10 py-10 space-y-16 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-indigo-900 dark:text-gray-200">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10% left-5% w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-30 animate-pulse-slow dark:bg-blue-900 dark:opacity-20"></div>
        <div className="absolute bottom-10% right-5% w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-pulse-slow dark:bg-purple-900 dark:opacity-20"></div>
      </div>
      
      {/* Page Heading */}
      <section className="text-center relative z-10">
        <motion.div
          className="z-10 text-center px-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold p-5 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
            Transportation in Sri Lanka
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mb-6 rounded-full"></div>
          
          <p className="text-lg md:text-xl text-center max-w-3xl mx-auto leading-relaxed">
            Discover the diverse ways to journey across the beautiful island—from scenic train rides through tea plantations to convenient tuk-tuks and comfortable buses. Find your perfect travel experience.
          </p>
        </motion.div>
      </section>

      {/* Transport Options Section (Cards + Popup) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <TransportOptionsSection />
      </motion.div>

      {/* Travel Tips Section (Scrollable + Modal) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <TravelTipsSection />
      </motion.div>
      
      {/* Bottom decorative section */}
      <motion.div 
        className="relative z-10 mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium">Start your Sri Lankan journey today</span>
        </div>
      </motion.div>
    </main>
  );
}