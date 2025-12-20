import { Star, MapPin, Heart, Share, Navigation, ChevronLeft, ExternalLink, Map } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ accommodation }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if accommodation is already favorited (from localStorage)
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(accommodation.id));
  }, [accommodation.id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter(id => id !== accommodation.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } else {
      const updatedFavorites = [...favorites, accommodation.id];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
    
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: accommodation.name,
        text: `Check out ${accommodation.name} in ${accommodation.city}, ${accommodation.country}`,
        url: window.location.href,
      })
      .catch(console.error);
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareOptions(false);
    // You could add a toast notification here
  };

  const openMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${accommodation.latitude},${accommodation.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const openGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps?q=${accommodation.latitude},${accommodation.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  // Fallback image in case of error
  const fallbackImage = "/placeholder-hotel.jpg";

  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="relative h-full w-full">
        <Image
          src={imageError ? fallbackImage : accommodation.header_image}
          alt={accommodation.header_image_alt || accommodation.name}
          fill
          className="object-cover transition-opacity duration-700"
          onLoadingComplete={() => setIsImageLoaded(true)}
          onError={() => setImageError(true)}
          priority
          quality={80}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMk8dfKbPWYq6ZvjR6tweven59Mf/xAAfEAACAQIPAQAAAAAAAAAAAAABAgMABAUREiExUbH/2gAIAQEAAT8Bmk1oVhU2zwSqD2oyzSgMZHsT3Ir2oUqNX//EABkRAQACAwAAAAAAAAAAAAAAAAEAEQIhMf/aAAgBAgEBPwGdGMz/xAAXEQEAAwAAAAAAAAAAAAAAAAABABEh/9oACAEBEQE/Aa0Y/9k="
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        {/* Optional Pattern Overlay for better text readability */}
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGElEQVQYV2NkYGD4z4AEYBgqgGMIABIFAA8/AZ4dAAAAAElFTkSuQmCC')] opacity-10" />
        
        {/* Loading Skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse" />
        )}
      </div>

      {/* Navigation Back Button */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 left-6 z-10 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full p-3 text-white transition-all duration-300 cursor-pointer shadow-lg"
        onClick={() => window.history.back()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      {/* Action Buttons */}
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        {/* Share Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleShare}
          className="bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full p-3 text-white transition-all duration-300 cursor-pointer shadow-lg"
          aria-label="Share"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share className="w-5 h-5" />
        </motion.button>
        
        {/* Favorite Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={toggleFavorite}
          className="bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full p-3 text-white transition-all duration-300 cursor-pointer shadow-lg"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart 
            className="w-5 h-5" 
            fill={isFavorite ? "#ef4444" : "none"} 
            stroke={isFavorite ? "#ef4444" : "currentColor"} 
          />
        </motion.button>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-3 drop-shadow-2xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            {accommodation.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-5">
            <span className="flex items-center bg-yellow-500/30 backdrop-blur-lg px-4 py-2 rounded-xl border border-yellow-400/30">
              <Star className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" />
              <span className="font-bold text-white">{accommodation.rating || "N/A"}</span>
              <span className="ml-2 text-gray-200">
                ({accommodation.review_count || 0} reviews)
              </span>
            </span>
            
            <span className="flex items-center bg-blue-600/30 backdrop-blur-lg px-4 py-2 rounded-xl border border-blue-400/30">
              <MapPin className="w-5 h-5 mr-2 text-blue-300" />
              <span className="text-white">{accommodation.city}, {accommodation.country}</span>
            </span>
            
            {accommodation.price_range && (
              <span className="bg-green-600/30 backdrop-blur-lg px-4 py-2 rounded-xl border border-green-400/30 text-white">
                {accommodation.price_range}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          {(accommodation.latitude && accommodation.longitude) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-3 mt-6"
            >
              <motion.button
                onClick={openMaps}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-5 py-3 rounded-xl border border-white/20 transition-all duration-300 cursor-pointer text-white font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Navigation className="w-5 h-5" />
                <span>Get Directions</span>
              </motion.button>
              
              <motion.button
                onClick={openGoogleMaps}
                className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-lg px-5 py-3 rounded-xl border border-blue-500/30 transition-all duration-300 cursor-pointer text-white font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Map className="w-5 h-5" />
                <span>View on Map</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Image Quality Notice */}
      {imageError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4 bg-yellow-500/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm"
        >
          ⚠️ Using placeholder image
        </motion.div>
      )}

      {/* Share Options Modal */}
      <AnimatePresence>
        {showShareOptions && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-20 right-6 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 w-48 border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={copyLink}
              className="w-full text-left py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <ExternalLink className="w-4 h-4" />
              Copy Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}