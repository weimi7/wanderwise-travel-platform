// components/DestinationSearchBar.js
'use client';

import { useState, useEffect } from 'react';
import { Search, X, MapPin, Sparkles, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function DestinationSearchBar({ searchItem, onSearch, destinations = [] }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  
  const [popularSearches] = useState([
    'Beach destinations',
    'Mountain resorts',
    'Historical sites',
    'Cultural experiences',
    'Adventure trips'
  ]);

  useEffect(() => {
    if (searchItem.length > 0) {
      setShowSuggestions(true);
      // Filter destinations based on search input
      const filtered = destinations.filter(dest => 
        dest.name?.toLowerCase().includes(searchItem.toLowerCase()) ||
        dest.location?.toLowerCase().includes(searchItem.toLowerCase()) ||
        dest.category?.toLowerCase().includes(searchItem.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setShowSuggestions(false);
      setFilteredDestinations([]);
    }
  }, [searchItem, destinations]);

  const clearSearch = () => {
    onSearch('');
    setShowSuggestions(false);
    setFilteredDestinations([]);
  };

  const handleSuggestionClick = (suggestion) => {
    onSearch(suggestion);
    setShowSuggestions(true);
  };

  const handleDestinationClick = () => {
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <div className="w-full relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'ring-4 ring-blue-100 dark:ring-blue-900/30' : ''}`}>
          <div className="absolute left-4 z-10">
            <Search 
              size={20} 
              className={`transition-colors duration-300 ${isFocused ? 'text-blue-600' : 'text-gray-400'}`} 
            />
          </div>
          
          <input
            type="text"
            placeholder="Where would you like to explore today?"
            value={searchItem}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-base transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
          />
          
          <AnimatePresence>
            {searchItem && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="absolute right-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} className="text-gray-500 dark:text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Popular Searches */}
        <AnimatePresence>
          {isFocused && !searchItem && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Popular Searches</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestionClick(search)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl text-sm text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MapPin size={14} className="text-blue-500" />
                    {search}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <AnimatePresence>
          {showSuggestions && searchItem && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto custom-scrollbar"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Search Results for &quot;{searchItem}&quot;
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                    {filteredDestinations.length} results
                  </span>
                </div>
              </div>

              {filteredDestinations.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredDestinations.map((destination, index) => (
                    <motion.div
                      key={destination.id || destination.destination_id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/destinations/${destination.slug}`}
                        onClick={handleDestinationClick}
                        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <MapPin size={16} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 dark:text-white truncate">
                              {destination.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {destination.location} • {destination.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                            <Navigation size={14} />
                            <span>Explore</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Search size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        No destinations found
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Try different keywords or browse popular destinations
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background overlay when suggestions are visible */}
      <AnimatePresence>
        {(isFocused && !searchItem) || showSuggestions ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }}
            className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-40"
            style={{ top: '100%' }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}