'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Compass, ExternalLink, Maximize2 } from 'lucide-react';
import { useState } from 'react';

// Dynamically import Google Map embed (client-side only)
const GoogleMapEmbed = dynamic(() => import('../../common/MapSectionInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  )
});

export default function MapSection({ latitude, longitude, name }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!latitude || !longitude) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <motion.section
      className="mt-12 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <Compass className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Location & Directions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Find your way to {name}
            </p>
          </div>
        </div>

        {/* Expand Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          {isExpanded ? 'Collapse' : 'Expand'}
        </motion.button>
      </div>

      {/* Coordinates */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700 dark:text-blue-300">Latitude:</span>
            <span className="text-gray-700 dark:text-gray-300 font-mono">{latitude}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700 dark:text-blue-300">Longitude:</span>
            <span className="text-gray-700 dark:text-gray-300 font-mono">{longitude}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <motion.div
        className={`relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg ${
          isExpanded ? 'h-96' : 'h-64'
        } transition-all duration-300`}
        whileHover={{ scale: 1.01 }}
      >
        <GoogleMapEmbed latitude={latitude} longitude={longitude} name={name} />
        
        {/* Map Overlay Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            title="Get Directions"
          >
            <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </motion.a>
          
          <motion.a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-5 h-5 text-green-600 dark:text-green-400" />
          </motion.a>
        </div>

        {/* Location Pin Animation */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-red-500 rounded-full"></div>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        <motion.a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </motion.a>
        
        <motion.a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <ExternalLink className="w-5 h-5" />
          Open in Maps
        </motion.a>
      </div>

      {/* Mobile Expand Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-4 md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <Maximize2 className="w-4 h-4" />
        {isExpanded ? 'Collapse Map' : 'Expand Map'}
      </motion.button>
    </motion.section>
  );
}