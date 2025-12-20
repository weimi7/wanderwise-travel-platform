'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Compass, ExternalLink, Maximize2, Minimize2, LocateFixed, Layers } from 'lucide-react';
import { useState } from 'react';

// Dynamically import Google Map embed (client-side only)
const GoogleMapEmbed = dynamic(() => import('../../common/MapSectionInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
        />
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading map...</p>
      </div>
    </div>
  )
});

export default function MapSection({ latitude, longitude, name, address }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapType, setMapType] = useState('roadmap');
  
  if (!latitude || !longitude) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  const toggleMapType = () => {
    setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
  };

  return (
    <motion.section
      className="mt-12 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className="relative"
            whileHover={{ rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Compass className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Location & Directions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Discover how to reach {name}
            </p>
          </div>
        </div>

        {/* Expand Button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-4 h-4" />
              Collapse View
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              Expand View
            </>
          )}
        </motion.button>
      </div>

      {/* Coordinates and Address */}
      <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <LocateFixed className="w-4 h-4" />
              Coordinates
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Lat:</span>
                <span className="text-gray-700 dark:text-gray-300 font-mono text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-md">{latitude}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Lng:</span>
                <span className="text-gray-700 dark:text-gray-300 font-mono text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-md">{longitude}</span>
              </div>
            </div>
          </div>
          
          {address && (
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Address</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded-md">
                {address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <motion.div
        className={`relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-xl ${
          isExpanded ? 'h-96 md:h-[500px]' : 'h-64 md:h-80'
        } transition-all duration-500`}
        whileHover={{ scale: 1.005 }}
      >
        <GoogleMapEmbed 
          latitude={latitude} 
          longitude={longitude} 
          name={name} 
          mapType={mapType}
        />
        
        {/* Map Overlay Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-3">
          <motion.button
            onClick={toggleMapType}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
            title={`Switch to ${mapType === 'roadmap' ? 'Satellite' : 'Map'} view`}
          >
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </motion.button>
          
          <motion.a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
            title="Get Directions"
          >
            <Navigation className="w-5 h-5 text-green-600 dark:text-green-400" />
          </motion.a>
          
          <motion.a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </motion.a>
        </div>

        {/* Location Pin Animation */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 bg-red-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="w-1 h-10 bg-red-500 rounded-full mt-1"></div>
            <motion.div 
              className="w-2 h-2 bg-red-500 rounded-full mt-1 opacity-70"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <motion.a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer group"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="group-hover:animate-bounce"
          >
            →
          </motion.span>
        </motion.a>
        
        <motion.a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer group"
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
        className="w-full mt-6 md:hidden flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
      >
        {isExpanded ? (
          <>
            <Minimize2 className="w-4 h-4" />
            Collapse Map
          </>
        ) : (
          <>
            <Maximize2 className="w-4 h-4" />
            Expand Map
          </>
        )}
      </motion.button>
    </motion.section>
  );
}