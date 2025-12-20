'use client';

import AccommodationCard from "./AccommodationCard";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Filter, Heart, Star, ChevronDown, SortAsc, SortDesc, Award } from "lucide-react";
import { useState } from "react";

export default function AccommodationsList({ accommodations }) {
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!accommodations || accommodations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl 
          backdrop-blur-md border border-white/10"
      >
        <div className="w-20 h-20 mx-auto bg-purple-600/20 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No accommodations found</h3>
        <p className="text-purple-200/80 max-w-md mx-auto">
          Try adjusting your search criteria to discover amazing stays
        </p>
      </motion.div>
    );
  }

  // Sort accommodations based on selected criteria
  const sortedAccommodations = [...accommodations].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.base_price_per_night || 0) - (b.base_price_per_night || 0);
      case 'price-high':
        return (b.base_price_per_night || 0) - (a.base_price_per_night || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0; // Recommended/Default order
    }
  });

  const sortOptions = [
    { 
      value: 'recommended', 
      label: 'Recommended', 
      icon: Award,
      description: 'Our top picks for you'
    },
    { 
      value: 'price-low', 
      label: 'Price: Low to High', 
      icon: SortAsc,
      description: 'Most affordable first'
    },
    { 
      value: 'price-high', 
      label: 'Price: High to Low', 
      icon: SortDesc,
      description: 'Luxury options first'
    },
    { 
      value: 'rating', 
      label: 'Highest Rated', 
      icon: Star,
      description: 'Best reviewed properties'
    }
  ];

  const currentSort = sortOptions.find(option => option.value === sortBy);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 
          p-6 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-2xl backdrop-blur-md 
          border border-white/10 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-white font-semibold text-lg">
              {accommodations.length} {accommodations.length === 1 ? 'Property' : 'Properties'}
            </span>
            <p className="text-purple-200/70 text-sm">Available for your dates</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Custom Sort Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 
                backdrop-blur-sm border border-purple-500/30 rounded-xl px-4 py-3 text-white 
                hover:from-purple-600/30 hover:to-indigo-600/30 transition-all duration-300 
                focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-lg
                min-w-[200px] group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <currentSort.icon className="w-4 h-4 text-purple-300" />
              <div className="flex-1 text-left">
                <span className="font-medium text-sm">{currentSort.label}</span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-purple-300 transition-transform duration-200 
                  ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </motion.button>

            {/* Dropdown Menu - Fixed Position */}
            <AnimatePresence>
              {isDropdownOpen && (
                <div className="fixed inset-0" style={{ zIndex: 99999 }}>
                  {/* Backdrop */}
                  <div 
                    className="absolute inset-0 bg-black/20" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  {/* Dropdown positioned relative to button */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute w-64 bg-slate-800 backdrop-blur-xl 
                      border border-white/20 rounded-xl shadow-2xl overflow-hidden"
                    style={{
                      top: '60px',
                      right: '20px'
                    }}
                  >
                    <div className="p-2">
                      {sortOptions.map((option, index) => {
                        const IconComponent = option.icon;
                        return (
                          <motion.button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left 
                              transition-all duration-200 group hover:bg-purple-600/20 cursor-pointer
                              ${sortBy === option.value 
                                ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/30' 
                                : 'hover:bg-white/5'
                              }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                          >
                            <div className={`p-2 rounded-lg transition-colors
                              ${sortBy === option.value 
                                ? 'bg-purple-500/30 text-purple-300' 
                                : 'bg-white/5 text-purple-400 group-hover:bg-purple-500/20'
                              }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium text-sm transition-colors
                                ${sortBy === option.value ? 'text-white' : 'text-white/90'}`}>
                                {option.label}
                              </div>
                              <div className="text-xs text-purple-200/60 mt-1">
                                {option.description}
                              </div>
                            </div>
                            {sortBy === option.value && (
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Accommodations Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          layout
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }
        >
          {sortedAccommodations.map((accommodation, i) => (
            <motion.div
              key={accommodation.accommodation_id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className={viewMode === 'list' 
                ? "bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-md rounded-2xl border border-white/10 p-4"
                : ""
              }
            >
              <AccommodationCard 
                accommodation={accommodation} 
                viewMode={viewMode}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Results Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-8 border-t border-white/10"
      >
        <div className="flex items-center justify-center gap-6 text-sm text-purple-200/60">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-yellow-400/20 rounded-full">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </div>
            <span>Exceptional stays</span>
          </div>
          <div className="w-1 h-1 bg-purple-400/30 rounded-full"></div>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-pink-400/20 rounded-full">
              <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
            </div>
            <span>Traveler favorites</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}