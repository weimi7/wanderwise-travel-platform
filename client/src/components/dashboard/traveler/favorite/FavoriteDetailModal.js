'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { X, MapPin, Star, Calendar, Heart, Share2, ExternalLink, Download, Globe, Users, Tag, ChevronRight, Clock, Info, Shield } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const favoriteTypeConfig = {
  accommodation: { 
    label: 'Hotel', 
    icon: '🏨', 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  activity: { 
    label: 'Activity', 
    icon: '🎯', 
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  destination: { 
    label: 'Destination', 
    icon: '📍', 
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  room: { 
    label: 'Room', 
    icon: '🛏️', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20'
  },
  flight: { 
    label: 'Flight', 
    icon: '✈️', 
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  }
};

export default function FavoriteDetailModal({ favorite, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageError, setImageError] = useState(false);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!favorite) return;
    const fetchDetail = async () => {
      setLoading(true);
      setImageError(false);
      try {
        let url;
        const type = favorite.favorite_type;
        
        if (favorite.reference_slug) {
          url = `${API_BASE}/api/${type}s/slug/${favorite.reference_slug}`;
        } else {
          url = `${API_BASE}/api/${type}s/${favorite.reference_id}`;
        }

        if (!url) throw new Error('Unsupported favorite type');

        const res = await axios.get(url);
        const payload = res.data?.data?.[type] ?? res.data?.data ?? res.data;
        setDetail(payload);
      } catch (err) {
        console.error('Failed to load favorite detail', err);
        setDetail({ 
          error: 'Failed to load details',
          name: favorite.reference_slug?.split('-').join(' ') || `Favorite #${favorite.reference_id}`
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [favorite, API_BASE]);

  if (!favorite) return null;

  const typeConfig = favoriteTypeConfig[favorite.favorite_type] || { 
    label: favorite.favorite_type, 
    icon: '❤️', 
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  // Robust rating renderer: accepts numbers, numeric strings, or arrays/objects with rating field.
  const getRatingStars = (rating) => {
    if (rating === null || rating === undefined) return null;

    // If rating is an array or object, try to extract a numeric value
    let numeric = null;
    if (Array.isArray(rating) && rating.length > 0) {
      // try average of numeric entries
      const nums = rating.map(r => parseFloat(r)).filter(n => Number.isFinite(n));
      if (nums.length > 0) numeric = nums.reduce((a,b) => a + b, 0) / nums.length;
    } else if (typeof rating === 'object') {
      // try common fields
      if (rating.value !== undefined) numeric = parseFloat(rating.value);
      else if (rating.rating !== undefined) numeric = parseFloat(rating.rating);
      else if (rating.avg !== undefined) numeric = parseFloat(rating.avg);
    } else {
      numeric = parseFloat(rating);
    }

    if (!Number.isFinite(numeric)) return null;

    const full = Math.floor(Math.max(0, Math.min(5, numeric)));
    const half = numeric - full >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push('full');
      else if (i === full && half) stars.push('half');
      else stars.push('empty');
    }

    return (
      <div className="flex items-center gap-1">
        {stars.map((s, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${s === 'full' ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{numeric.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-auto z-10"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${typeConfig.color} p-6 text-white`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{typeConfig.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      {typeConfig.label}
                    </span>
                    <span className="text-sm opacity-90">#{favorite.reference_id}</span>
                  </div>
                  <h3 className="text-xl font-bold mt-1">
                    {loading ? 'Loading...' : detail?.name || detail?.title || 'Favorite Details'}
                  </h3>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>Added {formatDate(favorite.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Last viewed: Just now</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-auto max-h-[calc(90vh-180px)]">
            {loading ? (
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ) : detail?.error ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{detail.error}</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Unable to load detailed information for this favorite.
                </p>
              </div>
            ) : detail && (
              <div className="p-6">
                {/* Hero Image */}
                <div className="relative h-64 rounded-2xl overflow-auto mb-6">
                  {detail.header_image || detail.image_url ? (
                    <Image
                      src={detail.header_image || detail.image_url}
                      alt={detail.name || detail.title}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : imageError ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{typeConfig.icon}</div>
                        <p className="text-gray-500 dark:text-gray-400">No image available</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"></div>
                  )}
                  
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h2 className="text-2xl font-bold">{detail.name || detail.title}</h2>
                      {(detail.city || detail.country || detail.location) && (
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4" />
                          <span>{[detail.city, detail.country, detail.location].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                  {['overview', 'details', 'reviews', 'pricing'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors cursor-pointer ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Description</h4>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.description || detail.small_description || detail.long_description || 'No description available.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {detail.rating && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-5 h-5 text-amber-500" />
                              <span className="font-medium text-gray-800 dark:text-white">Rating</span>
                            </div>
                            {getRatingStars(detail.rating)}
                          </div>
                        )}

                        {detail.price_per_night && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="w-5 h-5 text-emerald-500" />
                              <span className="font-medium text-gray-800 dark:text-white">Price</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                              {formatCurrency(detail.price_per_night)}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> / night</span>
                            </div>
                          </div>
                        )}

                        {detail.capacity && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-5 h-5 text-blue-500" />
                              <span className="font-medium text-gray-800 dark:text-white">Capacity</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                              {detail.capacity}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> guests</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      {detail.amenities && (
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {detail.amenities.slice(0, 10).map((amenity, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(detail.check_in_time || detail.check_out_time) && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Check-in</div>
                            <div className="font-medium text-gray-800 dark:text-white">
                              {detail.check_in_time || 'N/A'}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Check-out</div>
                            <div className="font-medium text-gray-800 dark:text-white">
                              {detail.check_out_time || 'N/A'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing Tab */}
                  {activeTab === 'pricing' && (
                    <div className="space-y-4">
                      {(detail.price_per_night || detail.min_price) && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-2xl">
                          <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Pricing Information</h4>
                          <div className="space-y-3">
                            {detail.price_per_night && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Standard Rate</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-white">
                                  {formatCurrency(detail.price_per_night)} / night
                                </span>
                              </div>
                            )}
                            {detail.min_price && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Starting From</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-white">
                                  {formatCurrency(detail.min_price)}
                                </span>
                              </div>
                            )}
                            {detail.max_price && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Maximum Rate</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-white">
                                  {formatCurrency(detail.max_price)} / night
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Secure connection • Updated just now</span>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </motion.button>

                {favorite.reference_slug && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`/${favorite.favorite_type}s/${favorite.reference_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Page
                  </motion.a>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const content = JSON.stringify({ favorite, detail }, null, 2);
                    const blob = new Blob([content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `favorite_${favorite.reference_id}_details.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export Details
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}