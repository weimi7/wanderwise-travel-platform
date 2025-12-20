'use client';

import { Search, X, Filter, Sparkles, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar({ search, setSearch }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Sample popular searches (you can replace with actual data)
  const popularSearches = [
    "Beachfront Villas",
    "Luxury Resorts",
    "Mountain Retreats",
    "City Center Hotels",
    "Eco Lodges"
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recentAccommodationSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.log('Could not load recent searches');
    }
  }, []);

  // Save search to recent searches
  const handleSearch = (value) => {
    setSearch(value);
    if (value.trim()) {
      try {
        const updatedSearches = [
          value,
          ...recentSearches.filter(s => s !== value).slice(0, 4)
        ];
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentAccommodationSearches', JSON.stringify(updatedSearches));
      } catch (error) {
        console.log('Could not save recent searches');
      }
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearch('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-2xl z-50">
      {/* Main Search Container */}
      <motion.div
        className={`relative group rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 
          backdrop-blur-xl border transition-all duration-500 mt-10`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Search Icon */}
        <motion.div
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
          animate={{ rotate: isFocused ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Search className="w-5 h-5 text-purple-300/80 group-hover:text-purple-200 transition-colors duration-300" />
        </motion.div>

        {/* Input Field */}
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding suggestions to allow clicks
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder="Discover luxury accommodations..."
          className="w-full pl-12 pr-12 py-4 bg-transparent border-none text-white placeholder-purple-200/60 text-lg font-normal relative z-10 focus:outline-none"
        />

        {/* Clear Button */}
        {search && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full 
              bg-white/10 hover:bg-white/20 transition-all duration-300 group/clear z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-purple-200 group-hover/clear:text-white transition-colors cursor-pointer" />
          </motion.button>
        )}
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-r from-slate-800 to-slate-900 
              backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-purple-500/20 
              overflow-hidden z-[9999]"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Recent Searches
                </h3>
                <div className="space-y-1">
                  {recentSearches.map((term, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-all duration-200 
                        text-white/80 hover:text-white flex items-center gap-2 group/suggestion"
                      whileHover={{ x: 4 }}
                    >
                      <Search className="w-4 h-4 text-purple-300 opacity-60 group-hover/suggestion:opacity-100" />
                      <span>{term}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Popular Destinations
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 
                      text-white/80 hover:text-white text-sm transition-all duration-200 backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {term}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <p className="text-xs text-purple-200/60 text-center">
                💡 Try searching by location, amenities, or property type
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay when suggestions are visible */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }}
            className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-[9998]"
            style={{ top: '0' }}
          />
        )}
      </AnimatePresence>

      {/* Micro-interaction indicator */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mt-1 z-10"
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}