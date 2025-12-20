'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import FavoriteButton from '../common/FavoriteButton';
import Link from 'next/link';

export default function DestinationCard({ destination, isFavorited }) {
  const { name, category, small_description, image_url, rating, location } = destination;
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const formattedRating = rating ? Number(rating).toFixed(1) : 'N/A';

  return (
    <motion.div
      className="group h-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-[410px] flex flex-col"
        whileHover={{ scale: 1.02 }}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <Image
            src={image_url || '/placeholder-destination.jpg'}
            alt={name}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full backdrop-blur-sm bg-opacity-90">
              {category}
            </span>
          </div>

          {/* Favorite overlay */}
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton
              type="destination"
              referenceId={destination.destination_id || destination.id}
              referenceSlug={destination.slug || null}
              redirectToDashboard={false}
              className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
            />
          </div>

          {/* Rating Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white text-sm font-semibold">{formattedRating}</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-2">
            <MapPin size={14} />
            <span className="text-xs font-medium">{location || 'Popular Destination'}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
            {small_description}
          </p>

          {/* Action Button */}
          <motion.div
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <Link
              href={`/destinations/${destination.slug}`}
              className="inline-flex items-center justify-between gap-3 group"
            >
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Explore Now
            </span>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full group-hover:bg-blue-700 transition-colors">
              <ArrowRight size={16} className="text-white" />
            </div>
            </Link>
          </motion.div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 transition-all duration-300 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
