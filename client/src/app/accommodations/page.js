"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Filter, Sparkles, Moon, Home, TrendingUp, X, Loader } from "lucide-react";
import SearchBar from "@/components/accommodations/SearchBar";
import CategoryFilter from "@/components/accommodations/CategoryFilter";
import Pagination from "@/components/common/Pagination";
import Image from "next/image";
import FavoriteButton from "@/components/common/FavoriteButton";

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch accommodations
  useEffect(() => {
    const fetchAccommodations = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          search,
          ...(category !== "All" && { type: category }),
        });

        const res = await fetch(`http://localhost:5000/api/accommodations?${queryParams}`);
        const data = await res.json();

        if (!res.ok || data.status !== "success") {
          throw new Error(data.message || "Failed to fetch accommodations");
        }

        setAccommodations(data.accommodations || []);
        setTotalPages(data.pagination?.total_pages || 1);
      } catch (err) {
        console.error("Error fetching accommodations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to show loading animation
    const timeoutId = setTimeout(fetchAccommodations, 500);
    return () => clearTimeout(timeoutId);
  }, [search, category, currentPage]);

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setCurrentPage(1);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 px-4 py-8 md:px-6 md:py-10 relative overflow-hidden mt-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: i * 0.3 }}
            className="absolute w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"
            style={{
              top: `${20 + i * 15}%`,
              left: `${5 + i * 10}%`,
            }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: i * 0.2 }}
            className="absolute w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"
            style={{
              bottom: `${10 + i * 15}%`,
              right: `${5 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12 relative z-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl text-white mb-6 shadow-lg shadow-purple-500/30"
          >
            <Home className="w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl p-5 font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-white to-purple-200">
            Luxury Escapes
          </h1>
          <p className="text-lg md:text-xl text-purple-200/90 max-w-2xl mx-auto">
            Discover exquisite stays and create unforgettable memories in Sri Lanka&#39;s finest accommodations
          </p>
        </motion.div>

        {/* Mobile Filter Toggle */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl mb-6 w-full justify-center hover:bg-white/20 transition-all"
        >
          {showFilters ? (
            <>
              <X size={20} className="transition-transform group-hover:rotate-90" />
              <span>Hide Filters</span>
            </>
          ) : (
            <>
              <Filter size={20} className="transition-transform group-hover:scale-110 " />
              <span>Show Filters</span>
            </>
          )}
        </motion.button>

        {/* Filters Section */}
        <AnimatePresence>
          {(showFilters || !showFilters) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-6 mb-10 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg relative z-50`}
            >
              {/* Search Bar - Left Side */}
              <div className="flex-1 md:order-1">
                <SearchBar search={search} setSearch={setSearch} />
              </div>
              
              {/* Category Filter - Right Side */}
              <div className="flex-1 md:order-2">
                <CategoryFilter category={category} setCategory={setCategory} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-between mb-8 text-white/80 relative z-20"
        >
          <div className="flex items-center gap-2 text-sm md:text-base">
            {category !== "All" && (
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-500/20"
              >
                {category}
              </motion.span>
            )}
          </div>
          {search && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm md:text-base mt-2 md:mt-0 bg-white/5 px-3 py-1 rounded-lg"
            >
              Searching for: <span className="font-semibold">&quot;{search}&quot;</span>
            </motion.p>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 relative z-20"
          >
            <div className="inline-flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full mb-6 flex items-center justify-center"
              >
                <Loader className="w-8 h-8 text-purple-400" />
              </motion.div>
              <p className="text-white/80 text-lg font-light">Discovering luxury accommodations...</p>
              <p className="text-white/50 text-sm mt-2">Your perfect stay is just a moment away</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 relative z-20"
          >
            <div className="text-red-300 text-4xl mb-4">⚠️</div>
            <p className="text-red-200 font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600/30 hover:bg-red-600/40 text-white rounded-xl transition-all duration-300 border border-red-500/30"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && accommodations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative z-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-6"
            >
              <Sparkles className="w-10 h-10 text-purple-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-3">No accommodations found</h3>
            <p className="text-purple-200/80 mb-6 max-w-md mx-auto">
              Try adjusting your search terms or filters. We have many luxurious stays waiting to be discovered!
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Accommodations List - custom simplified list so we can add FavoriteButton per card */}
        <AnimatePresence mode="wait">
          {!loading && !error && accommodations.length > 0 && (
            <motion.div
              key="accommodations-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-20"
            >
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {accommodations.map((acc, idx) => {
                  const name = acc.name || acc.title || 'Accommodation';
                  const city = acc.city || '';
                  const price = acc.base_price_per_night ? `$${acc.base_price_per_night}` : acc.price || '—';
                  const rating = typeof acc.rating !== 'undefined' ? acc.rating : acc.avg_rating || null;
                  const image = acc.header_image || acc.image_url || acc.gallery_images?.[0]?.image_url || '/api/placeholder/320/200';
                  const accId = acc.accommodation_id || acc.id;
                  const slug = acc.slug || acc._slug || '';

                  return (
                    <motion.article
                      key={accId || idx}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3, delay: idx * 0.02 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative"
                    >
                      {/* image */}
                      <div className="relative">
                        <Image src={image} alt={name} width={400} height={300} className="w-full h-48 object-cover" />
                        {/* Favorite button overlay */}
                        <div className="absolute top-3 right-3 z-10">
                          <FavoriteButton
                            type="accommodation"
                            referenceId={accId}
                            referenceSlug={slug || null}
                            redirectToDashboard={false}
                            className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{city}</p>
                          </div>
                          <div className="text-right">
                            {rating !== null && (
                              <div className="flex items-center gap-1 justify-end text-sm text-yellow-500">
                                <Star className="w-4 h-4" />
                                <span className="font-medium text-gray-700 dark:text-gray-200">{rating}</span>
                              </div>
                            )}
                            <div className="text-sm text-gray-500 mt-2">{price}</div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center">
                          <a
                            href={`/accommodations/${slug || accId}`}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm hover:opacity-95"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 relative z-20"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </motion.div>
        )}

        {/* Featured Properties Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 overflow-hidden relative z-20"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Featured Properties</h3>
                <p className="text-purple-200/80 text-sm">Exclusive deals on premium stays</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}