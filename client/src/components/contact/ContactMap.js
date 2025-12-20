'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Maximize2, Minimize2, Loader2 } from 'lucide-react';

export default function ContactMap() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const openInGoogleMaps = () => {
    window.open('https://www.google.com/maps/place/Colombo,+Sri+Lanka/@6.9218378,79.8380058,12z/data=!3m1!4b1!4m6!3m5!1s0x3ae2592b2ba469f7:0x2aa2dca6a324ae54!8m2!3d6.9270786!4d79.861243!16zL20vMDNueHI?entry=ttu', '_blank');
  };

  const getDirections = () => {
    window.open('https://www.google.com/maps/dir//Colombo,+Sri+Lanka/@6.9218378,79.8380058,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ae2592b2ba469f7:0x2aa2dca6a324ae54!2m2!1d79.861243!2d6.9270786?entry=ttu', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative w-full group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Our Location</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">34th Floor, World Trade Center, Echelon Square, Colombo 01, Sri Lanka.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpand}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </motion.button>
        </div>
      </div>

      {/* Map Container */}
      <div
        className={`relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl hover:shadow-3xl transition-all duration-300 ${
          isExpanded ? 'h-[600px]' : 'h-[400px]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
            </div>
          </div>
        )}

        {/* Google Maps Iframe */}
        <iframe
          title="WanderWise Headquarters - Colombo, Sri Lanka"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.647403342918!2d79.84155617456311!3d6.932678693067195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593485d00759%3A0x1744636b12e38719!2sWorld%20Trade%20Center%20-%20East%20tower!5e0!3m2!1sen!2slk!4v1755882055731!5m2!1sen!2slk"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleIframeLoad}
          className="transition-opacity duration-300"
        />

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={getDirections}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer group/btn"
            title="Get Directions"
          >
            <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover/btn:text-blue-700 transition-colors" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openInGoogleMaps}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer group/btn"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-5 h-5 text-green-600 dark:text-green-400 group-hover/btn:text-green-700 transition-colors" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleExpand}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer group/btn md:hidden"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </motion.button>
        </div>

        {/* Location Pin Animation */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-red-500 rounded-full"></div>
        </motion.div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          animate={{ opacity: isHovered ? 0.2 : 0 }}
        />
      </div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">📍 Easy to Find</h4>
          <p className="text-blue-600 dark:text-blue-300 text-xs">Located in the heart of Colombo</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm mb-1">🅿️ Parking Available</h4>
          <p className="text-green-600 dark:text-green-300 text-xs">Ample parking space nearby</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-800 dark:text-purple-200 text-sm mb-1">🚍 Public Transport</h4>
          <p className="text-purple-600 dark:text-purple-300 text-xs">Multiple bus routes nearby</p>
        </div>
      </motion.div>

      {/* Mobile Expand Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleExpand}
        className="w-full mt-4 md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        {isExpanded ? 'Collapse Map' : 'Expand Map'}
      </motion.button>
    </motion.div>
  );
}