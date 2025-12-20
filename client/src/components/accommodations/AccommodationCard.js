'use client';

import { MapPin, Star, Heart, Sparkles, ChevronRight, Calendar, Users } from "lucide-react";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import FavoriteButton from "../common/FavoriteButton";

// Helper to safely get Lucide icon component
function getLucideIcon(iconName) {
  return LucideIcons[iconName] || LucideIcons.Sparkles;
}

export default function AccommodationCard({ accommodation, viewMode = 'grid', isFavorited }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Format rating to one decimal place or 'N/A' if not available
  const { rating } = accommodation;
  const formattedRating = rating ? Number(rating).toFixed(1) : 'N/A';

  // Calculate discount if available
  const hasDiscount = accommodation.original_price && accommodation.original_price > accommodation.base_price_per_night;
  const discountPercentage = hasDiscount 
    ? Math.round(((accommodation.original_price - accommodation.base_price_per_night) / accommodation.original_price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-b from-purple-900/20 to-indigo-900/20 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 z-[-100]"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={accommodation.header_image || "/placeholder.jpg"}
          alt={accommodation.header_image_alt || accommodation.name}
          width={500}
          height={300}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Favorite Button */}
          <FavoriteButton itemType="accommodation" itemId={accommodation.id} initialFavorited={!!isFavorited} />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {/* Quick Info Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
            <Star size={12} className="text-yellow-400 fill-current" />
            {formattedRating}
          </div>
          {accommodation.is_featured && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full text-xs text-white font-medium">
              <Sparkles size={12} className="inline mr-1" />
              Featured
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title + Location */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-200 transition-colors line-clamp-1">
            {accommodation.name}
          </h3>
          <div className="flex items-center text-purple-200/80">
            <MapPin size={14} className="mr-1" />
            <span className="text-sm truncate">
              {accommodation.city}, {accommodation.country}
            </span>
          </div>
        </div>

        {/* Amenities (Icons only, 4 max + counter) */}
        <div className="flex items-center gap-2 mb-4">
          {accommodation.amenities?.slice(0, 4).map((amenity) => {
            const Icon = getLucideIcon(amenity.icon);
            return (
              <div
                key={amenity.amenity_id}
                title={amenity.name}
                className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors"
              >
                <Icon size={16} className="text-purple-300" />
              </div>
            );
          })}
          {accommodation.total_amenities > 4 && (
            <span className="text-xs text-purple-300/60">
              +{accommodation.total_amenities - 4}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <div className="text-white">
            {hasDiscount ? (
              <div>
                <span className="text-2xl font-bold">${accommodation.base_price_per_night}</span>
                <span className="text-sm text-gray-400 line-through ml-2">${accommodation.original_price}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold">${accommodation.base_price_per_night}</span>
            )}
            <span className="text-sm text-gray-300 ml-1">/ night</span>
          </div>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`/accommodations/${accommodation.slug}`}
            className="px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
          >
            View More
          </motion.a>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}