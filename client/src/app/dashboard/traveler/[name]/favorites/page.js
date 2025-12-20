"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Filter, Search, Grid, List, Star, MapPin, Calendar, Plus, Settings } from 'lucide-react';
import FavoritesTable from '@/components/dashboard/traveler/favorite/FavoritesTable';
import { useState } from 'react';

export default function TravelerFavoritesPage() {
  const { name } = useParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState('grid');

  const filters = [
    { id: 'all', label: 'All Favorites', count: 24 },
    { id: 'hotels', label: 'Hotels', count: 8 },
    { id: 'activities', label: 'Activities', count: 12 },
    { id: 'destinations', label: 'Destinations', count: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-rose-600 dark:from-white dark:to-rose-300 bg-clip-text text-transparent">
                  My Favorites
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                Your personal collection of saved destinations, hotels, and activities. Perfect for planning your next adventure!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* View Toggle Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {viewMode === 'grid' ? 'Favorite Items' : 'List View'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {viewMode === 'grid' 
                    ? 'Browse your saved items in a visual layout' 
                    : 'View all your favorites in a detailed list'}
                </p>
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {viewMode === 'list' ? (
              <FavoritesTable />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Grid className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Grid View Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {"We're working on an enhanced visual grid view for your favorites. For now, please use the list view to manage your saved items."}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  Switch to List View
                </motion.button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Tip:</span> You can organize favorites into collections
              </div>
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-2">Get the most from your favorites</h4>
                <p className="text-rose-700 dark:text-rose-400 text-sm">
                  Create custom collections, set reminders for price drops, and share your favorite finds with friends.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}