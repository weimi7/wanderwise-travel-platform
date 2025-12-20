"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Users, Bed, Bath, Star, Calendar, CheckCircle, ArrowRight, MapPin } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import BookingModal (client-side only)
const BookingModal = dynamic(() => import('@/components/bookings/BookingModal'), { ssr: false });

// Helper to get Lucide icon safely
function getLucideIcon(iconName) {
  return LucideIcons[iconName] || LucideIcons.HelpCircle;
}

// Simple toast helper (vanilla, lightweight)
function showToast(message, duration = 3000) {
  if (typeof window === 'undefined') return;
  const existing = document.getElementById('ww-toast');
  if (existing) {
    existing.remove();
  }
  const el = document.createElement('div');
  el.id = 'ww-toast';
  el.innerText = message;
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '10px 14px',
    borderRadius: '8px',
    zIndex: 99999,
    fontSize: '14px',
    opacity: '0',
    transition: 'opacity 200ms ease, transform 200ms ease',
    pointerEvents: 'none',
  });
  document.body.appendChild(el);
  // Trigger enter
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => el.remove(), 250);
  }, duration);
}

export default function RoomBookingModal({ room, onClose }) {
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookNow = () => {
    // Only allow logged-in users to open booking flow
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      // Show a toast message only (no redirect)
      showToast('Please log in to continue booking');
      return;
    }

    // Open in-page booking modal with the selected room as context
    setShowBookingModal(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{room.name}</h2>
                {room.is_premium && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Premium Room</span>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-8">
                {/* Images Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.images?.slice(0, 4).map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative h-40 md:h-48 rounded-xl overflow-hidden group"
                    >
                      <Image
                        src={img.image_url}
                        alt={img.alt_text || "Room image"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="prose prose-gray dark:prose-invert max-w-none"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {room.description}
                  </p>
                </motion.div>

                {/* Room Features */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{room.capacity}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Guests</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{room.bedrooms}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <Bath className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{room.bathrooms}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
                    </div>
                  </div>
                </motion.div>

                {/* Amenities */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Amenities Included
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {room.amenities?.map((amenity) => {
                      const Icon = getLucideIcon(amenity.icon);
                      return (
                        <div
                          key={amenity.amenity_id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookNow}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold cursor-pointer shadow-lg transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Confirm Booking
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Booking modal (in-page) */}
      {showBookingModal && (
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          bookingContext={{
            booking_type: 'room',
            reference: room,
            pricePerUnit: room.price_per_night,
            pricePerNight: room.price_per_night
          }}
          prefill={{ full_name: '', email: '' }}
        />
      )}
    </>
  );
}