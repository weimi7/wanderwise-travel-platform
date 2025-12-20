"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Sparkles, Calendar } from "lucide-react";
import FilterSection from "@/components/activities/FilterSection";
import ActivityCard from "@/components/activities/ActivityCard";
import FavoriteButton from "@/components/common/FavoriteButton";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ALL activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:5000/api/activities");
        const data = await res.json();
        const activityList = Array.isArray(data) ? data : data.activities;
        setActivities(activityList || []);
      } catch (err) {
        console.error("Error fetching activities:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Filtering
  const filtered = activities.filter((a) => {
    let match = true;

    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) {
      match = false;
    }

    if (category !== "All" && (!a.categories || !a.categories.includes(category))) {
      match = false;
    }

    return match;
  });

  return (
    <section className="min-h-screen bg-gradient-to-br mt-10 from-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 sm:w-96 sm:h-96 bg-blue-200 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[5%] w-64 h-64 sm:w-80 sm:h-80 bg-purple-200 rounded-full opacity-10 blur-3xl animate-pulse-medium"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white mb-6 shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-400 dark:to-indigo-300">
            Discover Sri Lankan Adventures
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Explore unique activities and create unforgettable memories across the beautiful island
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FilterSection
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
          />
        </motion.div>

        {/* Results Info */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 mt-8 gap-2 sm:gap-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            <MapPin size={18} />
            <span>{filtered.length} activities found</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Filter size={16} />
            <span>Filtered by: {category === "All" ? "All categories" : category}</span>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Activities Grid */}
        <AnimatePresence mode="wait">
          {!isLoading && filtered.length > 0 && (
            <motion.div
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {filtered.map((activity, i) => {
                const location =
                  activity.destinations?.length > 0
                    ? activity.destinations.map((d) => d.name).join(", ")
                    : "Various Locations";

                return (
                  <motion.div
                    key={activity.activity_id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <div className="relative">
                      <ActivityCard
                        activity={{ ...activity, location }}
                        index={i}
                        onExplore={() => setSelectedActivity(activity)}
                        onBook={() => setSelectedActivity(activity)}
                      />
                      {/* Favorite button overlay */}
                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton
                          type="activity"
                          referenceId={activity.activity_id || activity.id}
                          referenceSlug={activity.slug || null}
                          redirectToDashboard={false}
                          className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              No activities found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Try adjusting your search terms or filters. Many amazing experiences await!
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}