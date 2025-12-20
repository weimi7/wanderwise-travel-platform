'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Components
import HeaderSection from '@/components/destinations/destinationDetails/HeaderSection';
import OverviewTab from '@/components/destinations/destinationDetails/OverviewTab';
import NearbyAttractions from '@/components/destinations/destinationDetails/NearbyAttractions';
import PlanVisitTab from '@/components/destinations/destinationDetails/PlanVisitTab';
import ItinerarySection from '@/components/destinations/destinationDetails/ItinerarySection';
import MapSection from '@/components/destinations/destinationDetails/MapSection';
import ReviewsButton from '@/components/reviews/ReviewsButton';
import FavoriteButton from '@/components/common/FavoriteButton';


export default function DestinationDetailPage() {
  const { slug } = useParams();
  const [destination, setDestination] = useState(null);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch main destination details
        const { data: destinationData } = await axios.get(
          `${API_BASE}/api/destinations/slug/${slug}`,
          { signal: controller.signal }
        );
        setDestination(destinationData);

        // Fetch nearby destinations
        if (destinationData?.destination_id) {
          try {
            const { data: nearbyData } = await axios.get(
              `${API_BASE}/api/destinations/${destinationData.destination_id}/nearby`,
              { signal: controller.signal }
            );
            setNearbyAttractions(nearbyData || []);
          } catch (nearbyErr) {
            console.warn('⚠️ Failed to load nearby destinations:', nearbyErr.message);
            setNearbyAttractions([]);
          }
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('❌ Failed to fetch destination details:', err);
        setError('Unable to load destination details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [slug]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8 animate-pulse"></div>
          
          {/* Tabs Skeleton */}
          <div className="flex justify-center mt-8 gap-6 mb-8">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
        >
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Destination Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The destination you’re looking for doesn’t exist. Please check the URL and try again.
          </p>
          <Link 
            href="/destinations"
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg inline-block"
          >
            Browse Destinations
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 mt-12"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <HeaderSection
          image={destination.image_url}
          name={destination.name}
          location={destination.location}
          rating={destination.rating}
          category={destination.category}
        />

        {/* Tabs + Reviews & Favorite Button */}
        <div className="flex justify-between items-center mt-8 mb-8 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            {['overview', 'plan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg'
                }`}
              >
                {tab === 'overview' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Overview
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Plan Visit
                  </>
                )}
              </button>
            ))}
          </motion.div>

          <div className="flex items-center gap-3">
            <ReviewsButton type="destination" id={destination.destination_id || destination.id} />
            <FavoriteButton
              type="destination"
              referenceId={destination.destination_id || destination.id}
              referenceSlug={destination.slug || null}
              referenceName={destination.name}
              redirectToDashboard={false}
            />
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <>
                <OverviewTab
                  description={destination.long_description}
                  highlights={destination.highlights}
                />
                <NearbyAttractions
                  nearbyAttractions={nearbyAttractions}
                  destinationId={destination.destination_id}
                  slug={destination.slug}
                />
              </>
            )}

            {activeTab === 'plan' && (
              <>
                <PlanVisitTab
                  best_time={destination.best_time}
                  what_to_bring={destination.what_to_bring}
                  facilities={destination.facilities}
                  tips={destination.tips}
                />
                <ItinerarySection
                  price={destination.price}
                  duration={destination.duration}
                  difficulty={destination.difficulty}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Map */}
        {destination.latitude && destination.longitude && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <MapSection
              latitude={destination.latitude}
              longitude={destination.longitude}
              name={destination.name}
            />
          </motion.div>
        )}

        {/* Back to destinations button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link 
            href="/destinations"
            className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Explore More Destinations
          </Link>
        </motion.div>
      </div>
    </motion.main>
  );
}