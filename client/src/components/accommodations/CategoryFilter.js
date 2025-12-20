'use client';
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Tent,
  House,
  TreePalm,
  Leaf,
  Building,
  Sparkles,
  Filter,
  X,
} from "lucide-react";

// icon map
const iconMap = {
  All: Sparkles,
  Resort: TreePalm,
  "Safari Lodge": Tent,
  "Eco Lodge": Leaf,
  Hotel: Building,
  Villa: House,
  "Boutique Hotel": Building2,
};

export default function AccommodationFilter({ category, setCategory }) {
  const [categories, setCategories] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:5000/api/accommodations/categories");
        const data = await res.json();
        if (data.status === "success") {
          // Limit to first 5 categories plus "All" = 6 total
          const limitedCategories = ["All", ...data.data.categories.slice(0, 5)];
          setCategories(limitedCategories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Fallback categories
        setCategories(["All", "Resort", "Hotel", "Villa", "Safari Lodge", "Eco Lodge"]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderButton = (cat) => {
    const Icon = iconMap[cat] || Building2;
    const isSelected = category === cat;

    return (
      <motion.button
        key={cat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCategory(cat)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 relative overflow-hidden group cursor-pointer
          ${
            isSelected
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
              : "bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-md shadow-md hover:shadow-lg border border-white/20"
          }`}
      >
        {/* Shine effect */}
        <span
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
            isSelected ? "opacity-50" : "opacity-0"
          }`}
        ></span>

        <Icon size={18} className={isSelected ? "text-white" : "text-purple-300"} />
        <span className="font-medium">{cat}</span>

        {isSelected && (
          <motion.span 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="ml-auto"
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col-3 items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter size={20} className="text-purple-400" />
          Filter by Type
        </h3>
        {category !== "All" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCategory("All")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer backdrop-blur-md"
          >
            <X size={14} />
            Clear
          </motion.button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex gap-3 flex-wrap justify-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-12 w-24 bg-white/10 rounded-xl animate-pulse backdrop-blur-md"
            />
          ))}
        </div>
      )}

      {/* Categories Grid - Always 5 items */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 w-full"
        >
          {categories.map((cat) => renderButton(cat))}
        </motion.div>
      )}

      {/* Selected category indicator */}
      {category !== "All" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 mt-4 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-purple-200">
            Showing: <strong className="text-white">{category}</strong> accommodations
          </span>
        </motion.div>
      )}
    </div>
  );
}