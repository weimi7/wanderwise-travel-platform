'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Home, Search, Heart, Share2 } from 'lucide-react';

// Components
import ActivityHeader from '@/components/activities/activityDetails/ActivityHeader';
import ActivityInfo from '@/components/activities/activityDetails/ActivityInfo';
import ReviewsButton from '@/components/reviews/ReviewsButton';
import FavoriteButton from '@/components/common/FavoriteButton';


export default function ActivityDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRefreshing(true);

        const { data } = await axios.get(`${API_BASE}/api/activities/slug/${slug}`, {
          signal: controller.signal
        });
        // data shape from controller is likely the activity object directly
        setActivity(data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('❌ Failed to fetch activity details:', err);
        setError('Unable to load activity details. Please try again later.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchActivity();
    return () => controller.abort();
  }, [slug]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const controller = new AbortController();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

    const fetchActivity = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/activities/slug/${slug}`, {
          signal: controller.signal
        });
        setActivity(data);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError('Unable to load activity details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
    return () => controller.abort();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          
          {/* Header Skeleton */}
          <div className="animate-pulse space-y-6 mb-12">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center max-w-md w-full"
        >
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Loading...' : 'Try Again'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/activities')}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              <ArrowLeft size={18} />
              Back to Activities
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Activity not found
  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center max-w-md w-full"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Activity Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The activity you&#39;re looking for doesn&#39;t exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/activities')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Search size={18} />
              Browse Activities
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              <Home size={18} />
              Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render activity details
  return (
    <div className="min-h-screen mt-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/activities')}
            className="flex items-center gap-2 font-bold px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Activities
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-12"
        >
          <ActivityHeader activity={activity} />

          {/* Reviews button + Favorite */}
          <div className="flex justify-center mt-4 gap-3">
            <ReviewsButton type="activity" id={activity?.activity_id || activity?.id} />
            <FavoriteButton
              type="activity"
              referenceId={activity?.activity_id || activity?.id}
              referenceSlug={activity?.slug || null}
              redirectToDashboard={false}
              className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
            />
          </div>

          <div className="flex">
            <div className="lg:col-span-2">
              <ActivityInfo activity={activity} />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}