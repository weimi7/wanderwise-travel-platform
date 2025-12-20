'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Info, Star, MapPin, Camera, Heart, Clock, Users, Sparkles } from 'lucide-react';

export default function OverviewTab({ description, highlights }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const highlightIcons = [Star, MapPin, Camera, Heart, Clock, Users];
  
  return (
    <motion.div
      className="space-y-8 py-8 px-6 mt-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* About Section */}
      <motion.div
        variants={itemVariants}
        className="relative"
      >
        <div className="absolute -top-2 -left-2 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="ml-14">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            About This Destination
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </h2>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {description.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-lg">
                  {line}
                </p>
                {index !== description.split('\n').length - 1}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Highlights Section */}
      {highlights && highlights.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="relative pt-8"
        >
          <div className="absolute -top-2 -left-2 w-12 h-12 mt-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="ml-14">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              Key Highlights
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlights.map((item, index) => {
                const IconComponent = highlightIcons[index % highlightIcons.length];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed mt-2">
                        {item}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <Sparkles className="w-16 h-16 text-blue-500" />
      </div>
      
      <div className="absolute bottom-4 left-4 opacity-10">
        <MapPin className="w-12 h-12 text-green-500" />
      </div>
    </motion.div>
  );
}