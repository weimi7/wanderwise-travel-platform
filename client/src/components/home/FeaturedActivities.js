"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const FeaturedActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/activities/random"); // random activities endpoint
        const data = await res.json();

        // Ensure activities array exists
        const activityList = data || [];

        setActivities(activityList);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Skeleton loader
  const ActivitySkeleton = () => (
    <div className="rounded-lg shadow bg-white dark:bg-gray-800 overflow-hidden">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          Featured Activities
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover our most popular experiences and adventures handpicked just for you
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-8">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]"
              >
                <ActivitySkeleton />
              </div>
            ))}
          </>
        ) : (
          activities.map((activity, index) => {
            // Destinations string
            const location =
              activity.destinations?.length > 0
                ? activity.destinations.map((d) => d.name).join(", ")
                : "Unknown Location";

            return (
              <div
                key={activity.activity_id ?? `activity-${index}`}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -8 }}
                  className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden group h-full flex flex-col"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden flex-grow-0">
                    <Image
                      src={activity.image_url || "/placeholder-activity.jpg"}
                      alt={activity.name}
                      width={400}
                      height={300}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Categories */}
                    {activity.categories?.length > 0 && (
                      <div className="absolute top-4 right-4 flex flex-wrap gap-1">
                        {activity.categories.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                        {activity.categories.length > 2 && (
                          <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                            +{activity.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors">
                      {activity.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <MapPin className="w-4 h-4 mr-1 text-red-500" />
                      <span>{location}</span>
                    </div>

                    {/* Price */}
                    {activity.max_price && (
                      <div className="flex justify-between items-center mt-auto">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Starting from
                          </p>
                          <p className="font-bold text-lg text-blue-500">
                            {activity.min_price} - {activity.max_price}{" "}
                            {activity.currency ?? "USD"}*
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* Explore all link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center mt-14"
      >
        <Link
          href="/activities"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          Explore all Activities
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
};

export default FeaturedActivities;
