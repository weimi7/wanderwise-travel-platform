'use client';

import Image from "next/image";
import dynamic from "next/dynamic";
import { MapPin, Star, Clock, Users, Heart, Share2, Calendar } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Dynamically load booking modal (client-side only)
const BookingModal = dynamic(() => import('@/components/bookings/BookingModal'), { ssr: false });

// Simple toast helper (shared behavior)
function showToast(message, duration = 3000) {
  if (typeof window === 'undefined') return;
  const existing = document.getElementById('ww-toast');
  if (existing) existing.remove();
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

export default function ActivityHeader({ activity, name }) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const location = activity.destinations?.length > 0
    ? activity.destinations.map((d) => d.name).join(", ")
    : "Various Locations";
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: name || activity.name,
          text: `Check out ${name || activity.name} - ${location}!`,
          url: window.location.href
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        const shareBtn = document.querySelector('.share-btn');
        if (shareBtn) {
          const prev = shareBtn.innerHTML;
          shareBtn.innerHTML = '✓ Copied!';
          setTimeout(() => { shareBtn.innerHTML = prev; }, 2000);
        } else {
          showToast('Link copied to clipboard', 2000);
        }
      } else {
        showToast('Sharing not supported on this browser', 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleBookmark = () => {
    const key = 'bookmarkedActivities';
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      if (isBookmarked) {
        const updated = existing.filter(id => id !== activity.activity_id);
        localStorage.setItem(key, JSON.stringify(updated));
        setIsBookmarked(false);
        showToast('Removed bookmark', 1500);
      } else {
        const updated = [...existing, activity.activity_id];
        localStorage.setItem(key, JSON.stringify(updated));
        setIsBookmarked(true);
        showToast('Added to bookmarks', 1500);
      }
    } catch (err) {
      console.error('Bookmark error', err);
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleBookNow = () => {
    // Only allow logged-in users to book
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      // Show toast only (no redirect)
      showToast('Please log in to continue booking', 3000);
      return;
    }

    setShowBookingModal(true);
  };

  return (
    <div className="relative mb-12">
      {/* Image with Gradient Overlay */}
      <div className="relative h-96 md:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl">
        <Image
          src={activity.image_url || "/placeholder-activity.jpg"}
          alt={activity.name}
          fill
          priority
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="bg-black/40 backdrop-blur-md p-3 rounded-xl hover:bg-black/60 transition-all duration-300 border border-white/20 cursor-pointer share-btn"
            title="Share"
          >
            <Share2 size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            className={`bg-black/40 backdrop-blur-md p-3 rounded-xl hover:bg-black/60 transition-all duration-300 border border-white/20 cursor-pointer ${isBookmarked ? 'ring-2 ring-yellow-400' : ''}`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Heart size={20} fill={isBookmarked ? '#ef4444' : 'none'} />
          </motion.button>
        </div>

        {/* Quick Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Rating */}
            {activity.rating && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">
                  {Number(activity.rating).toFixed(1)}
                </span>
              </div>
            )}
            
            {/* Duration */}
            {activity.duration && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                <Clock size={16} />
                <span className="text-sm">{activity.duration}</span>
              </div>
            )}
            
            {/* Group Size */}
            {activity.group_size && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                <Users size={16} />
                <span className="text-sm">Max {activity.group_size}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activity.categories?.map((cat, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-500/90 backdrop-blur-md text-white text-sm font-semibold rounded-full border border-white/20"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content Below Image */}
      <div className="relative mt-8">
        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
          <MapPin className="w-5 h-5 text-red-500" />
          <span className="text-lg font-medium">{location}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {activity.name}
        </h1>

        {/* Price & Booking Info */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              ${activity.min_price}
            </span>
            {activity.original_price && activity.original_price > activity.min_price && (
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                ${activity.original_price}
              </span>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">per person</span>
          </div>
          
          <button
            onClick={handleBookNow}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            title="Book this activity"
          >
            <Calendar size={20} />
            Book Now
          </button>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {activity.difficulty && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Difficulty</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {activity.difficulty}
              </div>
            </div>
          )}
          
          {activity.season && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Season</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {activity.season}
              </div>
            </div>
          )}
          
          {activity.age_limit && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Age Limit</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {activity.age_limit}+
              </div>
            </div>
          )}
          
          {activity.availability && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Availability</div>
              <div className="font-semibold text-green-600 dark:text-green-400 capitalize">
                {activity.availability}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking modal (in-page) */}
      {showBookingModal && (
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          bookingContext={{
            booking_type: 'activity',
            reference: activity,
            pricePerUnit: activity.min_price
          }}
          prefill={{ full_name: '', email: '' }}
        />
      )}
    </div>
  );
}