"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Bed, Bath, Star, ChevronRight, Calendar, Shield, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RoomBookingModal from "./RoomBookingModal";

export default function BookingTab({ accommodation }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
          Choose Your Perfect Room
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select from our beautifully designed rooms, each offering unique amenities and stunning views to make your stay unforgettable.
        </p>
      </motion.div>

      {/* Room Types */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {accommodation.room_types?.map((room, index) => (
          <motion.div
            key={room.room_type_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setHoveredRoom(room.room_type_id)}
            onMouseLeave={() => setHoveredRoom(null)}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
          >
            {/* Room Image */}
            <div className="relative h-52 overflow-hidden">
              <Image
                src={room.images?.[0]?.image_url || "/placeholder.jpg"}
                alt={room.images?.[0]?.alt_text || room.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Premium Badge */}
              {room.is_premium && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Premium
                </div>
              )}

              {/* Image Counter */}
              {room.images && room.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                  +{room.images.length - 1}
                </div>
              )}
            </div>

            {/* Room Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {room.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {room.description}
                </p>
              </div>

              {/* Features */}
              <div className="flex gap-4 text-gray-600 dark:text-gray-400 text-sm">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  {room.capacity}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-blue-500" />
                  {room.bedrooms}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-blue-500" />
                  {room.bathrooms}
                </span>
              </div>

              {/* Amenities Preview */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {amenity.name}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{room.amenities.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Price + Button */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${room.price_per_night}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/night</span>
                  </div>
                  {room.original_price && room.original_price > room.price_per_night && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ${room.original_price}
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRoom(room)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Book Now
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Hover Overlay */}
            <AnimatePresence>
              {hoveredRoom === room.room_type_id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-6 py-8 bg-gray-50 dark:bg-gray-900 rounded-2xl mt-12"
      >
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-sm">Best Price Guarantee</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-sm">Free Cancellation</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Shield className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-sm">Secure Payment</span>
        </div>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <RoomBookingModal
            room={selectedRoom}
            onClose={() => setSelectedRoom(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}