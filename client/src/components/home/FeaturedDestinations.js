'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const FeaturedDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDestinations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/destinations');
      const data = await res.json();

      // Use the array from the API response
      const shuffled = data.destinations.sort(() => 0.5 - Math.random());
      const randomThree = shuffled.slice(0, 3);

      setDestinations(randomThree);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchDestinations();
}, []);


  // Skeleton loader component
  const DestinationSkeleton = () => (
    <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        </div>
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
          Featured Destinations
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the world’s most captivating places for your next adventure
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-8">
        {loading ? (
          // Show skeleton loaders while loading
          <>
            <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]">
              <DestinationSkeleton />
            </div>
            <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]">
              <DestinationSkeleton />
            </div>
            <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]">
              <DestinationSkeleton />
            </div>
          </>
        ) : (
          destinations.map((destination, index) => (
            <div key={destination.id ?? `dest-${index}`} className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -8 }}
                className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden group h-full flex flex-col"
              >
                <div className="relative overflow-hidden flex-grow-0">
                  <Image
                    src={destination.image_url || "/placeholder-destination.jpg"}
                    alt={destination.name}
                    width={400}
                    height={300}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      {destination.category}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center bg-black bg-opacity-60 text-white px-2 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{destination.rating || "4.5"}</span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors">
                    {destination.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {destination.small_description}
                  </p>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{destination.country || "Sri Lanka"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center mt-14"
      >
        <Link
          href="/destinations"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          Explore all Destinations
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
};

export default FeaturedDestinations;