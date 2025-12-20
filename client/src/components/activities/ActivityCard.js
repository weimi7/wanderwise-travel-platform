import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Users, Heart, ArrowRight, Calendar } from "lucide-react";
import { useState } from "react";
import FavoriteButton from "../common/FavoriteButton";

export default function ActivityCard({ activity, index, onBook, onExplore, isFavorited }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Format destinations into a readable string
  const location =
    activity.destinations?.length > 0
      ? activity.destinations.map((d) => d.name).join(", ")
      : "Various Locations";

  // Calculate discount if available
  const hasDiscount = activity.original_price && activity.original_price > activity.min_price;
  const discountPercentage = hasDiscount 
    ? Math.round(((activity.original_price - activity.min_price) / activity.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
    >

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          -{discountPercentage}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Image
          src={activity.image_url || "/default-activity.jpg"}
          alt={activity.name}
          width={400}
          height={280}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Categories Tags */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {activity.categories?.slice(0, 2).map((cat, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-600/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-full backdrop-blur-sm"
            >
              {cat}
            </span>
          ))}
          {activity.categories?.length > 2 && (
            <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-full backdrop-blur-sm">
              +{activity.categories.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <MapPin size={14} className="text-red-500" />
          <span className="truncate">{location}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {activity.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(activity.rating || 0) 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-gray-300 dark:text-gray-600"
                }
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {activity.rating ? Number(activity.rating).toFixed(1) : "New"}
          </span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activity.review_count || 0} reviews
          </span>
        </div>

        {/* Duration & Group Size */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          {activity.duration && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{activity.duration}</span>
            </div>
          )}
          {activity.group_size && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>Max {activity.group_size}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              ${activity.min_price}
            </span>
            {activity.currency && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.currency}</span>
            )}
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">${activity.original_price}</span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">per person</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href={`/activities/${activity.slug || activity.activity_id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 group/explore"
          >
            <span>Details</span>
            <ArrowRight size={16} className="group-hover/explore:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}