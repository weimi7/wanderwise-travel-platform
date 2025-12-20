'use client';

import { motion } from 'framer-motion';
import { FaArrowRight, FaStar, FaClock, FaUsers } from 'react-icons/fa';

export default function TransportCard({ 
  name, 
  icon, 
  price, 
  label, 
  rating, 
  travelTime, 
  bestFor, 
  onClick, 
  gradient, 
  borderColor, 
  bgColor, 
  textColor, 
  isHovered 
}) {
  return (
    <motion.div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer group h-full flex flex-col justify-between transition-all duration-300 border-2 ${borderColor} hover:shadow-2xl hover:border-opacity-100`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          {/* Icon with background */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white`}>
            <div className="text-4xl">
              {icon}
            </div>
          </div>
          
          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              <FaStar className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-semibold text-blue-600">{rating}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors">
          {name}
        </h3>

        {/* Label with gradient */}
        <div className="inline-block">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white bg-gray-700 rounded-b-md backdrop-blur-sm`}>
            {label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-4 space-y-3">
        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-2xl font-bold text-white">{price}</p>
        </div>

        {/* Additional Info */}
        {travelTime && (
          <div className="flex items-center gap-2 text-sm text-gray-200">
            <FaClock className="w-3 h-3" />
            <span>{travelTime}</span>
          </div>
        )}
        
        {bestFor && (
          <div className="flex items-center gap-2 text-sm text-gray-200">
            <FaUsers className="w-3 h-3" />
            <span className="text-xs">{bestFor}</span>
          </div>
        )}
      </div>

      {/* Footer with CTA */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
        <motion.button
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full flex items-center justify-between px-4 py-2 rounded-xl bg-gradient-to-r bg-blue-500 text-white font-semibold hover:shadow-lg transition-all group/button cursor-pointer`}
        >
          <span className="text-sm">View Details</span>
          <motion.div
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform" />
          </motion.div>
        </motion.button>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-white/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Pulse animation when hovered */}
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
      )}
    </motion.div>
  );
}