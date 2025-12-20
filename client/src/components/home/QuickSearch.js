'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiMap, FiActivity, FiHome, FiGlobe, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const QuickSearch = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  const popularSearches = [
    { text: 'Beach destinations', icon: FiGlobe, type: 'destination' },
    { text: 'Cultural activities', icon: FiActivity, type: 'activity' },
    { text: 'Luxury hotels', icon: FiHome, type: 'accommodation' },
    { text: 'Adventure trips', icon: FiMap, type: 'activity' }
  ];

  const handleSearch = (searchQuery = query) => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    if (!lowerQuery) return;

    if (lowerQuery.includes('destination') || ['galle', 'colombo', 'kandy', 'ella', 'mirissa'].includes(lowerQuery)) {
      router.push(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    } else if (lowerQuery.includes('activity') || lowerQuery.includes('activities') || ['surfing', 'hiking', 'yoga', 'safari'].includes(lowerQuery)) {
      router.push(`/activities?search=${encodeURIComponent(searchQuery)}`);
    } else if (lowerQuery.includes('accommodation') || lowerQuery.includes('hotel') || lowerQuery.includes('stay') || ['villa', 'resort', 'guesthouse'].includes(lowerQuery)) {
      router.push(`/accommodations?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    }
    
    setShowSuggestions(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <section className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Main Search Input */}
        <div className={`relative transition-all duration-300 ${isFocused ? 'ring-4 ring-blue-100 dark:ring-blue-900/30 rounded-2xl' : ''}`}>
          <FiSearch className="absolute top-1/2 left-5 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" size={20} />
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Search destinations, activities, accommodations and more..."
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-base transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(query.length > 0);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 150);
            }}
          />
          
          {/* Clear button */}
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 p-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={16} className="text-gray-500 dark:text-gray-400" />
            </motion.button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Search for &quot;{query}&quot;
                </div>
                <div className="space-y-1">
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => handleSuggestionClick(query)}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <FiSearch size={16} className="text-blue-500" />
                    <span>Search &quot;{query}&quot;</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popular Searches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <FiGlobe size={16} />
            Popular Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSuggestionClick(search.text)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <search.icon size={14} className="text-blue-500 group-hover:text-blue-600 transition-colors" />
                {search.text}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: FiMap, label: 'Destinations', description: 'Explore beautiful places', color: 'from-blue-500 to-blue-600' },
            { icon: FiActivity, label: 'Activities', description: 'Find exciting things to do', color: 'from-green-500 to-green-600' },
            { icon: FiHome, label: 'Accommodations', description: 'Discover places to stay', color: 'from-purple-500 to-purple-600' }
          ].map((category, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/${category.label.toLowerCase()}`)}
              className="p-4 bg-gradient-to-r rounded-xl text-white text-left group cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
              // Using style because template literals in class names can be tricky
              style={{
                background: `linear-gradient(135deg, 
                  ${category.color.includes('blue') ? '#3b82f6, #2563eb' : 
                    category.color.includes('green') ? '#10b981, #059669' : 
                    '#8b5cf6, #7c3aed'})`
              }}
            >
              <category.icon size={24} className="mb-2 opacity-90 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-lg mb-1">{category.label}</h4>
              <p className="text-white/80 text-sm">{category.description}</p>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default QuickSearch;