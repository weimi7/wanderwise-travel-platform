'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Lightbulb, Navigation, Clock } from 'lucide-react';

export default function TravelTipModal({ tip, onClose }) {
  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with blur effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal Content */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Decorative header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 relative">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-2 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-2 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Lightbulb size={20} className="text-white" />
                  </div>
                  <h2 className="text-white font-bold text-lg">Traveler&#39;s Tip</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Route information */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin size={14} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-1">{tip.from}</span>
                </div>
                
                <div className="flex flex-col items-center flex-grow max-w-[120px]">
                  <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                  <Navigation size={14} className="text-indigo-500 mt-1" />
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MapPin size={14} className="text-indigo-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-1">{tip.to}</span>
                </div>
              </div>
              
              {tip.duration && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-1.5 px-3 rounded-full">
                  <Clock size={14} />
                  <span>{tip.duration}</span>
                </div>
              )}
            </div>
            
            {/* Tip content */}
            <div className="p-5">
              <div className="bg-blue-50 rounded-xl p-4 relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Lightbulb size={12} className="text-white" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pl-2">{tip.tip}</p>
              </div>
              
              {/* Additional details if available */}
              {tip.details && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">Good to know:</h4>
                  <p className="text-xs text-gray-500">{tip.details}</p>
                </div>
              )}
              
              {/* Pro tip if available */}
              {tip.proTip && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">!</span>
                    </div>
                    <h4 className="text-xs font-semibold text-amber-800">Pro Tip</h4>
                  </div>
                  <p className="text-xs text-amber-700">{tip.proTip}</p>
                </div>
              )}
            </div>
            
            {/* Action button */}
            <div className="px-5 pb-5">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}