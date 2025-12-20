"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, MapPin, Sparkles, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const categories = [
  { value: "All", label: "All Activities", icon: <Sparkles size={16} /> },
  { value: "Adventure", label: "Adventure", icon: "🧗" },
  { value: "Water Sports", label: "Water Sports", icon: "🌊" },
  { value: "Marine Life", label: "Marine Life", icon: "🐠" },
  { value: "Nature", label: "Nature", icon: "🌳" },
  { value: "Wildlife", label: "Wildlife", icon: "🐘" },
  { value: "Conservation", label: "Conservation", icon: "🌱" },
  { value: "Culture", label: "Culture", icon: "🏛️" },
  { value: "Heritage", label: "Heritage", icon: "🏯" },
  { value: "Spiritual", label: "Spiritual", icon: "🕉️" },
  { value: "Culinary", label: "Culinary", icon: "🍲" },
  { value: "Wellness", label: "Wellness", icon: "🧘" },
  { value: "Leisure", label: "Leisure", icon: "🎈" },
  { value: "Entertainment", label: "Entertainment", icon: "🎭" },
  { value: "Scenic Travel", label: "Scenic Travel", icon: "🏞️" },
  { value: "Sports", label: "Sports", icon: "⚽" },
];

export default function FilterSection({ search, setSearch, category, setCategory }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [dropdownCategories, setDropdownCategories] = useState([]);
  const dropdownRef = useRef(null);

  // Initialize displayed categories and dropdown categories
  useEffect(() => {
    // First 3 categories + 4th slot (initially the 4th category)
    const initialDisplayed = categories.slice(0, 4);
    // The rest go to dropdown
    const initialDropdown = categories.slice(4);
    
    setDisplayedCategories(initialDisplayed);
    setDropdownCategories(initialDropdown);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory.value);
    
    // If the selected category is already in displayed, do nothing
    if (displayedCategories.some(cat => cat.value === selectedCategory.value)) {
      return;
    }
    
    // If the selected category is in dropdown, replace the 4th category
    if (dropdownCategories.some(cat => cat.value === selectedCategory.value)) {
      // Create new displayed categories: first 3 + the selected category
      const newDisplayed = [...displayedCategories.slice(0, 3), selectedCategory];
      
      // Create new dropdown: all dropdown categories except the selected one + the replaced category
      const replacedCategory = displayedCategories[3];
      const newDropdown = [
        ...dropdownCategories.filter(cat => cat.value !== selectedCategory.value),
        replacedCategory
      ];
      
      setDisplayedCategories(newDisplayed);
      setDropdownCategories(newDropdown);
    }
    
    setIsDropdownOpen(false);
  };

  const hasActiveFilters = search !== "" || category !== "All";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search Input */}
        <motion.div 
          className="relative flex-1 w-full"
          whileFocus={{ scale: 1.02 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search adventures, water sports, wildlife, cultural experiences..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {search && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Category Filter - Mobile Toggle */}
        <div className="lg:hidden w-full">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <span>Categories</span>
            </div>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-2 grid grid-cols-2 gap-2"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setCategory(cat.value);
                      setIsExpanded(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      category === cat.value
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Filter - Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          {/* First 3 categories always displayed */}
          {displayedCategories.slice(0, 3).map((cat) => (
            <motion.button
              key={cat.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                category === cat.value
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.label}</span>
            </motion.button>
          ))}
          
          {/* 4th category slot */}
          {displayedCategories.length > 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(displayedCategories[3].value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                category === displayedCategories[3].value
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-lg">{displayedCategories[3].icon}</span>
              <span>{displayedCategories[3].label}</span>
            </motion.button>
          )}
          
          {/* Dropdown for remaining categories */}
          {dropdownCategories.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
              >
                <span>More</span>
                <motion.span
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.span>
              </motion.button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 z-10 overflow-hidden custom-scrollbar"
                  >
                    <div className="max-h-60 overflow-y-auto py-1">
                      {dropdownCategories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => handleCategorySelect(cat)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors duration-200 cursor-pointer ${
                            category === cat.value
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            <X size={16} />
            <span className="text-sm">Clear All</span>
          </motion.button>
        )}
      </div>

      {/* Active Filters Indicator */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  Search: &quot;{search}&quot;
                  <button onClick={() => setSearch("")} className="ml-1 hover:text-blue-600">
                    <X size={12} />
                  </button>
                </span>
              )}
              {category !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full">
                  Category: {category}
                  <button onClick={() => setCategory("All")} className="ml-1 hover:text-green-600 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}