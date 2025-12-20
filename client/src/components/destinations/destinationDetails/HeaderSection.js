'use client';
import { useRouter } from 'next/navigation';
import { Bookmark, Share2, ArrowLeft, MapPin, Star, Heart, Navigation, Calendar } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import FavoriteButton from '@/components/common/FavoriteButton';

export default function HeaderSection({ name, image, location, rating, category, isFavorited, id}) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `Check out ${name} - ${location}!`,
          url: window.location.href
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        // Show success feedback
        const shareBtn = document.querySelector('.share-btn');
        if (shareBtn) {
          shareBtn.innerHTML = '✓ Copied!';
          setTimeout(() => {
            shareBtn.innerHTML = '<Share2 size={18} />';
          }, 2000);
        }
      } else {
        alert('Sharing not supported on this browser');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add your bookmark logic here
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Background Image with Gradient Overlay */}
      <div className="relative w-full h-full">
        {image ? (
          <>
            <Image
              src={image}
              alt={name}
              fill
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onLoadingComplete={() => setImageLoaded(true)}
              priority
            />
            <AnimatePresence>
              {!imageLoaded && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse"
                />
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🌄</div>
              <p className="text-lg font-semibold">{name}</p>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-12 text-white">
        {/* Top Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center"
        >
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/destinations')}
            className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl hover:bg-black/60 transition-all duration-300 border border-white/20 cursor-pointer group/back"
          >
            <ArrowLeft size={20} className="group-hover/back:-translate-x-1 transition-transform" />
            <span className="font-medium">All Destinations</span>
          </motion.button>

          <div className="flex gap-3">
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="bg-black/40 backdrop-blur-md p-3 rounded-xl hover:bg-black/60 transition-all duration-300 border border-white/20 cursor-pointer share-btn"
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Destination Info */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight max-w-4xl"
            >
              {name}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex items-center gap-2 text-lg text-white/90 mb-6"
            >
              <MapPin size={20} className="text-blue-300" />
              <span>{location}</span>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            {/* Rating Badge */}
            <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-400/30">
              <Star size={18} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating || 'N/A'}</span>
            </div>

            {/* Category Badge */}
            <div className="bg-green-600/90 backdrop-blur-md px-4 py-2 rounded-xl border border-green-400/30">
              <span className="font-semibold">{category}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-white/80 text-sm mb-2">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white/80 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}