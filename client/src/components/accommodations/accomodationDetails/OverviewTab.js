"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Bed, Bath, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to dynamically map icon name to Lucide icon
function getLucideIcon(iconName) {
  return LucideIcons[iconName] || LucideIcons.HelpCircle;
}

export default function OverviewTab({ accommodation }) {
  const [expandedAmenities, setExpandedAmenities] = useState({});
  const [showFullGallery, setShowFullGallery] = useState(false);

  const toggleAmenityCategory = (category) => {
    setExpandedAmenities(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const galleryImages = accommodation.gallery_images || [];
  const displayedImages = showFullGallery ? galleryImages : galleryImages.slice(0, 8);

  return (
    <div className="space-y-10">
      {/* About Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          About This Place
        </h2>
        <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
          {accommodation.description.split('\n').map((line, index) => (
            <p key={index} className="mb-4">
              {line}
            </p>
          ))}
        </div>
      </motion.section>

      {/* Amenities Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded-full"></span>
          Amenities
        </h2>
        
        <div className="space-y-4">
          {accommodation.amenities_by_category &&
            Object.entries(accommodation.amenities_by_category).map(
              ([category, amenities]) => (
                <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <button
                    onClick={() => toggleAmenityCategory(category)}
                    className="flex items-center justify-between w-full text-left font-semibold text-lg mb-3 text-gray-800 dark:text-white cursor-pointer"
                  >
                    <span>{category}</span>
                    {expandedAmenities[category] ? (
                      <ChevronUp className="w-5 h-5 cursor-pointer" />
                    ) : (
                      <ChevronDown className="w-5 h-5 cursor-pointer" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedAmenities[category] && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        {amenities.map((amenity) => {
                          const Icon = getLucideIcon(amenity.icon);
                          return (
                            <motion.li
                              key={amenity.amenity_id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{amenity.name}</span>
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )
            )}
        </div>
      </motion.section>

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
            Gallery
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedImages.map((img, index) => (
              <motion.div
                key={img.image_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative h-48 rounded-xl overflow-hidden group cursor-pointer"
                whileHover={{ scale: 1.03 }}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || "Gallery image"}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
          
          {galleryImages.length > 8 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowFullGallery(!showFullGallery)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors duration-300"
              >
                {showFullGallery ? 'Show Less' : `View All ${galleryImages.length} Photos`}
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.section>
      )}

      {/* Pricing & Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-white"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-red-500 rounded-full"></span>
          Stay Info
        </h2>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Price */}
          <div className="text-4xl font-bold">
            ${accommodation.base_price_per_night}
            <span className="text-lg font-normal opacity-90 ml-1">/ night</span>
          </div>

          {/* Totals */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-white/20 rounded-full">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm opacity-80">Guests</div>
                <div className="font-semibold">{accommodation.total_capacity}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-white/20 rounded-full">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm opacity-80">Bedrooms</div>
                <div className="font-semibold">{accommodation.total_bedrooms}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-lg backdrop-blur-sm">
              <div className="p-2 bg-white/20 rounded-full">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm opacity-80">Bathrooms</div>
                <div className="font-semibold">{accommodation.total_bathrooms}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}