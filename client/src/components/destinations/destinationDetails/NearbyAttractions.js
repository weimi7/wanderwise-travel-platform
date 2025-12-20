'use client';
import { motion } from 'framer-motion';
import DestinationCard from '../DestinationCard';
import Link from 'next/link';
import { Navigation, MapPin, Sparkles, Compass } from 'lucide-react';

export default function NearbyAttractions({
  nearbyAttractions = [],
  destinationId,
  slug
}) {
  if (!nearbyAttractions.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-center"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Compass className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No Nearby Attractions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            We couldn’t find any attractions near this location. Explore other amazing destinations instead.
          </p>
        </div>
      </motion.div>
    );
  }

  const showViewAll = nearbyAttractions.length > 2;
  const displayedAttractions = nearbyAttractions.slice(0, 2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Nearby Attractions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Discover amazing places close to this location
            </p>
          </div>
        </div>
        
        {showViewAll && (
          <Link
            href={`/destinations?nearby=${destinationId}&from=${slug}`}
            className="hidden md:block"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              View All
              <Navigation className="w-4 h-4" />
            </motion.button>
          </Link>
        )}
      </div>

      {/* Attractions Grid */}
      <div className="grid gap-6 md:grid-cols-2 scrollbar-hide">
        {displayedAttractions.map((dest, index) => (
          <motion.div
            key={dest.destination_id || dest.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <DestinationCard destination={dest} />
          </motion.div>
        ))}
      </div>

      {/* Mobile View All Button */}
      {showViewAll && (
        <div className="mt-8 text-center md:hidden">
          <Link
            href={`/destinations?nearby=${destinationId}&from=${slug}`}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              View All {nearbyAttractions.length} Nearby Attractions
              <Navigation className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <Compass className="w-16 h-16 text-blue-500" />
      </div>
      
      {/* Counter Badge */}
      {showViewAll && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg"
        >
          +{nearbyAttractions.length - 2} more
        </motion.div>
      )}
    </motion.section>
  );
}