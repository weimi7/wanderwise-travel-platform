'use client';
import { useState } from 'react';
import { 
  MessageCircle, 
  Star, 
  ChevronRight, 
  TrendingUp, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewsModal from './ReviewsModal';

export default function ReviewsButton({ type, id, reviewCount, averageRating }) {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!id) return null;

  // Get button styling based on type (destination, activity, accommodation)
  const getButtonConfig = () => {
    switch (type?.toLowerCase()) {
      case 'destination':
        return {
          gradient: 'from-blue-500 to-purple-600',
          hoverGradient: 'from-blue-600 to-purple-700',
          icon: MessageSquare,
          shadow: 'shadow-lg hover:shadow-xl',
          accent: 'bg-gradient-to-r from-blue-400 to-purple-400'
        };
      case 'activity':
        return {
          gradient: 'from-green-500 to-emerald-600',
          hoverGradient: 'from-green-600 to-emerald-700',
          icon: TrendingUp,
          shadow: 'shadow-lg hover:shadow-xl',
          accent: 'bg-gradient-to-r from-green-400 to-emerald-400'
        };
      case 'accommodation':
        return {
          gradient: 'from-amber-500 to-orange-600',
          hoverGradient: 'from-amber-600 to-orange-700',
          icon: Star,
          shadow: 'shadow-lg hover:shadow-xl',
          accent: 'bg-gradient-to-r from-amber-400 to-orange-400'
        };
      default:
        return {
          gradient: 'from-gray-700 to-gray-800',
          hoverGradient: 'from-gray-800 to-gray-900',
          icon: MessageCircle,
          shadow: 'shadow-md hover:shadow-lg',
          accent: 'bg-gradient-to-r from-gray-400 to-gray-500'
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setOpen(true)}
        className={`
          relative px-5 py-3 rounded-xl 
          bg-gradient-to-r ${config.gradient} hover:${config.hoverGradient}
          text-white font-medium transition-all duration-300 
          ${config.shadow}
          overflow-hidden group
          flex items-center justify-center gap-2 cursor-pointer
        `}
        aria-label={`View reviews for this ${type}`}
      >
        {/* Animated background shine effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          <motion.div
            animate={{ rotate: isHovered ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`p-1.5 ${config.accent} rounded-lg`}
          >
            <Icon className="w-4 h-4 text-white" />
          </motion.div>

          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">Reviews</span>
              {reviewCount > 0 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`ml-2 px-1.5 py-0.5 text-xs font-bold ${config.accent} text-white rounded-full`}
                >
                  {formatNumber(reviewCount)}
                </motion.div>
              )}
            </div>
            
            {averageRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-2.5 h-2.5 ${star <= Math.round(averageRating) 
                        ? 'text-yellow-300 fill-yellow-300' 
                        : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold ml-1">{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <motion.div
            animate={{ x: isHovered ? 3 : 0 }}
            className="opacity-70"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <ReviewsModal
            reviewableType={type}
            reviewableId={id}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}