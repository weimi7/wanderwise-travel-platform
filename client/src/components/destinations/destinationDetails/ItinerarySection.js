'use client';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, TrendingUp, DollarSign, Activity, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function ItinerarySection({ price, duration, difficulty }) {

  const getDifficultyColor = (level) => {
    if (!level) return 'gray';
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('easy')) return 'green';
    if (lowerLevel.includes('moderate')) return 'yellow';
    if (lowerLevel.includes('hard') || lowerLevel.includes('difficult')) return 'red';
    if (lowerLevel.includes('medium')) return 'blue';
    return 'purple';
  };

  const getDifficultyIcon = (level) => {
    if (!level) return <Activity className="w-5 h-5" />;
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('easy')) return '😊';
    if (lowerLevel.includes('moderate')) return '😐';
    if (lowerLevel.includes('hard') || lowerLevel.includes('difficult')) return '😅';
    if (lowerLevel.includes('medium')) return '🙂';
    return '🏔️';
  };

  const items = [
    { 
      icon: <DollarSign className="w-6 h-6" />, 
      label: "Price", 
      value: price ? `${price.toLocaleString()} USD` : 'Contact for price', 
      sub: "per person",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800"
    },
    { 
      icon: <Clock className="w-6 h-6" />, 
      label: "Duration", 
      value: duration || 'Flexible',
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    { 
      icon: <TrendingUp className="w-6 h-6" />, 
      label: "Difficulty", 
      value: difficulty || 'Not specified',
      color: `text-${getDifficultyColor(difficulty)}-600 dark:text-${getDifficultyColor(difficulty)}-400`,
      bgColor: `bg-${getDifficultyColor(difficulty)}-100 dark:bg-${getDifficultyColor(difficulty)}-900/30`,
      borderColor: `border-${getDifficultyColor(difficulty)}-200 dark:border-${getDifficultyColor(difficulty)}-800`,
      emoji: getDifficultyIcon(difficulty)
    }
  ];

  return (
    <motion.div
      className="mt-12 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-yellow-800" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Trip Details
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Essential information for your adventure
          </p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className={`p-6 rounded-xl border-2 ${item.borderColor} ${item.bgColor} group hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}
          >
            {/* Icon */}
            <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <div className={item.color}>
                {item.icon}
              </div>
            </div>

            {/* Label */}
            <span className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {item.label}
            </span>

            {/* Value with emoji if exists */}
            <div className="flex items-center gap-2">
              <strong className={`block text-2xl font-bold ${item.color}`}>
                {item.value}
              </strong>
              {item.emoji && (
                <span className="text-xl">{item.emoji}</span>
              )}
            </div>

            {/* Sub text */}
            {item.sub && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {item.sub}
              </p>
            )}

            {/* Decorative corner */}
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-6 right-6 opacity-10">
        <Calendar className="w-16 h-16 text-purple-500" />
      </div>
    </motion.div>
  );
}