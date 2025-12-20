'use client';

import { Suspense } from 'react';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import CategoryFilter from '@/components/destinations/CategoryFilter';
import DestinationCard from '@/components/destinations/DestinationCard';
import DestinationSearchBar from '@/components/destinations/DestinationSearchBar';
import Pagination from '@/components/common/Pagination';
import { Map } from 'lucide-react';
import FavoriteButton from '@/components/common/FavoriteButton';

function DestinationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get('search') || '';
  const nearbyId = searchParams.get('nearby') || null;
  const fromSlug = searchParams.get('from') || null;
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialCategory = searchParams.get('category') || 'All';

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  // States for all destinations
  const [destinations, setDestinations] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [searchItem, setSearchItem] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);

  // States for nearby attractions
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const [fromDestinationName, setFromDestinationName] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // items per page

  // Keep URL in sync with state (page, category, search)
  useEffect(() => {
    // Build querystring
    const params = new URLSearchParams();
    if (currentPage && currentPage !== 1) params.set('page', String(currentPage));
    if (category && category !== 'All') params.set('category', category);
    if (searchItem) params.set('search', searchItem);
    // Preserve nearby/from if present in URL (do not override)
    if (nearbyId) params.set('nearby', nearbyId);
    if (fromSlug) params.set('from', fromSlug);

    const queryString = params.toString();
    const url = queryString ? `/destinations?${queryString}` : '/destinations';

    // Replace instead of push so pagination/category changes don't spam history
    router.replace(url);
  }, [currentPage, category, searchItem, router, nearbyId, fromSlug]);

  // Fetch all destinations with pagination (only if no nearbyId)
  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true);

      // Build request URL including category when set
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(limit));
      if (category && category !== 'All') {
        params.set('category', category);
      }
      // Optionally include search server-side if supported (commented)
      // if (searchItem) params.set('search', searchItem);

      const url = `${API_BASE}/api/destinations?${params.toString()}`;
      const res = await axios.get(url);
      setDestinations(res. data.destinations || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, currentPage, category, limit]);

  // Fetch nearby attractions if nearbyId present
  const fetchNearbyAttractions = useCallback(async () => {
    if (!nearbyId) return;

    setLoadingNearby(true);
    setNearbyError(null);

    try {
      const res = await axios.get(`${API_BASE}/api/destinations/${nearbyId}/nearby`);
      setNearbyAttractions(res.data || []);
    } catch (err) {
      console.error('Error fetching nearby attractions:', err);
      setNearbyError('Failed to load nearby attractions.');
    } finally {
      setLoadingNearby(false);
    }
  }, [nearbyId, API_BASE]);

  // Fetch original destination name if coming from slug
  const fetchFromDestinationName = useCallback(async () => {
    if (!fromSlug) return;
    try {
      const res = await axios.get(`${API_BASE}/api/destinations/slug/${fromSlug}`);
      setFromDestinationName(res.data?. name || '');
    } catch (err) {
      console.error('Error fetching from destination name:', err);
    }
  }, [fromSlug, API_BASE]);

  // Effects:  fetch data based on nearbyId or normal listing
  useEffect(() => {
    if (nearbyId) {
      fetchNearbyAttractions();
      if (fromSlug) fetchFromDestinationName();
    } else {
      fetchDestinations();
    }
  }, [fetchDestinations, fetchNearbyAttractions, fetchFromDestinationName, nearbyId, fromSlug]);

  // Update searchItem if URL query changes (e.g.  back/forward)
  useEffect(() => {
    setSearchItem(initialSearch);
  }, [initialSearch]);

  // When category changes, reset to first page
  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  // Filter only applies client-side for search (category handled server-side)
  const filteredDestinations = destinations.filter((dest) => {
    const matchesCategory =
      category === 'All' || dest.category?. toLowerCase() === category.toLowerCase();

    const matchesSearch =
      searchItem === '' || dest.name?. toLowerCase().includes(searchItem.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Skeleton loader component
  const DestinationSkeleton = () => (
    <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );

  // Render nearby attractions if nearbyId exists
  if (nearbyId) {
    if (loadingNearby) {
      return (
        <main className="p-6 dark: bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading nearby attractions...
            </p>
          </div>
        </main>
      );
    }

    if (nearbyError) {
      return (
        <main className="p-6 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg mb-6">{nearbyError}</p>
            <Link href="/destinations">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer">
                Back to All Destinations
              </button>
            </Link>
          </div>
        </main>
      );
    }

    if (nearbyAttractions.length === 0) {
      return (
        <main className="p-6 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-5xl mb-4">😢</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              No nearby attractions found.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/destinations">
                <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-md hover:shadow-lg cursor-pointer">
                  All Destinations
                </button>
              </Link>
              {fromSlug && (
                <Link href={`/destinations/${fromSlug}`}>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all cursor-pointer shadow-md hover:shadow-lg">
                    Back to {fromDestinationName || 'Destination'}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="p-6 dark: bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-blue-50 to-indigo-50 min-h-screen">
        {/* Header with gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity:  1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg"
        >
          <h1 className="text-4xl font-bold text-center mb-2">Nearby Attractions</h1>
          <p className="text-center text-blue-100">Discover amazing places close to your location</p>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-between items-center mb-8 gap-4"
        >
          <Link href="/destinations">
            <button className="px-6 py-3 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All Destinations
            </button>
          </Link>
          {fromSlug && (
            <Link href={`/destinations/${fromSlug}`}>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to {fromDestinationName || 'Destination'}
              </button>
            </Link>
          )}
        </motion.div>

        {/* Attractions Grid */}
        <motion. div 
          initial={{ opacity:  0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4"
        >
          <AnimatePresence>
            {nearbyAttractions.map((dest, index) => (
              <motion.div
                key={dest.slug ??  dest.destination_id ??  dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y:  0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer relative"
              >
                <Link href={`/destinations/${dest.slug}`} className="block">
                  <DestinationCard destination={dest} />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    );
  }

  // Default rendering:  all destinations + search + filter
  return (
    <main className="p-6 bg-gradient-to-br from-slate-900 min-h-screen mt-16">
      {/* Hero Section */}
      <motion. div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity:  1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness:  200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white mb-6 shadow-lg"
        >
          <Map className="w-8 h-8" />
        </motion. div>
        <h1 className="text-5xl font-bold p-5 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Explore Destinations
        </h1>
        <p className="text-lg md:text-xl text-purple-200/90 max-w-2xl mx-auto">
          Discover the world&apos;s most amazing places for your next adventure
        </p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity:  1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-16 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
      >
        <div className="flex-grow">
          <DestinationSearchBar 
            searchItem={searchItem} 
            onSearch={setSearchItem}
            destinations={destinations} // Pass your destinations array here
          />
        </div>
        <div className="w-full md:w-auto">
          <CategoryFilter selected={category} onSelect={handleSelectCategory} />
        </div>
      </motion.div>

      {/* Destination List */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
          {[...Array(8)].map((_, i) => (
            <DestinationSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4"
          >
            <AnimatePresence>
              {filteredDestinations.map((dest, index) => (
                <motion.div
                  key={dest.slug ?? dest.destination_id ?? dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer relative"
                >
                  
                  <DestinationCard destination={dest} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredDestinations.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity:  1 }}
              className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mt-8"
            >
              <div className="text-6xl mb-4">🌎</div>
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No destinations found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button 
                onClick={() => {
                  setSearchItem('');
                  setCategory('All');
                  setCurrentPage(1);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </main>
    
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading destinations...</p>
        </div>
      </div>
    }>
      <DestinationsContent />
    </Suspense>
  );
}