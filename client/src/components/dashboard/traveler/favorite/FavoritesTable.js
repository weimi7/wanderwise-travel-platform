'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Eye, Trash2, Heart, MapPin, Calendar, Star, Hotel, Activity, Plane, MoreVertical, ExternalLink, Download, Share2, Clock, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FavoriteDetailModal from './FavoriteDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const favoriteTypeConfig = {
  hotel: { icon: Hotel, label: 'Hotel', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  activity: { icon: Activity, label: 'Activity', color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  flight: { icon: Plane, label: 'Flight', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  destination: { icon: MapPin, label: 'Destination', color: 'from-rose-500 to-red-500', bgColor: 'bg-rose-50 dark:bg-rose-900/20' },
  room: { icon: Hotel, label: 'Room', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
};

export default function FavoritesTable({ apiBase = '' }) {
  const API_BASE = apiBase || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFav, setSelectedFav] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const { user } = useAuth() || {};

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/users/favorites`, { headers: getAuthHeaders() });
      setFavorites(res.data.favorites || []);
      toast.success('Favorites loaded successfully');
    } catch (err) {
      console.error('Failed to load favorites', err);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onView = (fav) => {
    setSelectedFav(fav);
  };

  const onRemove = async (fav) => {
    if (!window.confirm(`Are you sure you want to remove "${fav.reference_slug || fav.favorite_type}" from favorites?`)) return;
    
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/users/favorites`, {
        headers: getAuthHeaders(),
        params: { favorite_type: fav.favorite_type, reference_id: fav.reference_id }
      });
      
      setFavorites(prev => prev.filter(f => f.favorite_id !== fav.favorite_id));
      toast.success('Favorite removed successfully');
    } catch (err) {
      console.error('Failed to remove favorite', err);
      toast.error('Failed to remove favorite');
    } finally {
      setDeleting(false);
    }
  };

  const getFavoriteType = (type) => favoriteTypeConfig[type] || { icon: Heart, label: 'Favorite', color: 'from-gray-500 to-gray-700', bgColor: 'bg-gray-50 dark:bg-gray-900/20' };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredFavorites = favorites.filter(fav => {
    if (selectedCategory === 'all') return true;
    return fav.favorite_type === selectedCategory;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'type') {
      return a.favorite_type.localeCompare(b.favorite_type);
    }
    return 0;
  });

  const categories = [
    { id: 'all', label: 'All Items', count: favorites.length },
    ...Object.entries(favoriteTypeConfig).map(([key, config]) => ({
      id: key,
      label: config.label,
      count: favorites.filter(f => f.favorite_type === key).length
    }))
  ];

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!favorites.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No favorites yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Start saving your favorite hotels, activities, and destinations for easy access later.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.label}
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/20'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">{filteredFavorites.length}</span> of {favorites.length} favorites
        </div>
      </div>

      {/* Favorites List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredFavorites.map((fav, index) => {
            const typeConfig = getFavoriteType(fav.favorite_type);
            const TypeIcon = typeConfig.icon;
            
            return (
              <motion.div
                key={fav.favorite_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Type Icon */}
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${typeConfig.color}`}>
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>

                      {/* Favorite Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} text-gray-700 dark:text-gray-300`}>
                            {typeConfig.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {fav.reference_id}
                          </span>
                        </div>

                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                          {fav.reference_slug ? 
                            fav.reference_slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') :
                            `${typeConfig.label} #${fav.reference_id}`
                          }
                        </h4>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Saved {formatDate(fav.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {fav.updated_at && `Updated ${formatDate(fav.updated_at)}`}
                          </div>
                        </div>

                        {/* Tags */}
                        {fav.tags && fav.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {fav.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes Preview */}
                        {fav.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                            {fav.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onView(fav)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </motion.button>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onRemove(fav)}
                          disabled={deleting}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{favorites.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {new Set(favorites.map(f => f.favorite_type)).size}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {favorites.length > 0 ? formatDate(favorites.reduce((latest, fav) => 
                new Date(fav.created_at) > new Date(latest.created_at) ? fav : latest
              ).created_at) : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last Added</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <Heart className="w-4 h-4 inline mr-2" />
              Your favorites are automatically synced across all devices
            </div>
            <button 
              onClick={loadFavorites}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFav && (
        <FavoriteDetailModal 
          favorite={selectedFav} 
          onClose={() => setSelectedFav(null)}
          onRemove={onRemove}
          onRefresh={loadFavorites}
        />
      )}
    </div>
  );
}