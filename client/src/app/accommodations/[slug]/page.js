"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Home, Loader2, MapPin, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Header from "@/components/accommodations/accomodationDetails/Header";
import Tabs from "@/components/accommodations/accomodationDetails/Tabs";
import OverviewTab from "@/components/accommodations/accomodationDetails/OverviewTab";
import BookingTab from "@/components/accommodations/accomodationDetails/BookingTab";
import MapSection from "@/components/accommodations/accomodationDetails/MapSection";
import ReviewsButton from "@/components/reviews/ReviewsButton";
import FavoriteButton from "@/components/common/FavoriteButton";

export default function AccommodationDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [accommodation, setAccommodation] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `http://localhost:5000/api/accommodations/slug/${slug}`
        );
        
        if (!res.ok) {
          throw new Error(`Failed to fetch accommodation: ${res.status}`);
        }
        
        const data = await res.json();
        if (data.status === "success") {
          setAccommodation(data.data.accommodation);
        } else {
          throw new Error(data.message || "Failed to load accommodation");
        }
      } catch (err) {
        console.error("Error fetching accommodation details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) fetchAccommodation();
  }, [slug]);

  const handleBackClick = () => {
    router.push("/accommodations");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-medium">Loading accommodation details...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we prepare your experience</p>
        </motion.div>
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center text-white bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Accommodation Not Found</h2>
          <p className="text-gray-300 mb-6">
            {error || "The accommodation you're looking for doesn't exist or may have been removed."}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBackClick}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors mx-auto cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Accommodations
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Navigation Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Accommodations
            </motion.button>
            
            <motion.div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Go to homepage"
              >
                <Home className="w-5 h-5" />
                Home
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Header Section */}
      <Header accommodation={accommodation} />

      {/* Reviews button + Favorite button */}
      <div className="flex justify-center mt-4 gap-3">
        <ReviewsButton type="accommodation" id={accommodation?.accommodation_id || accommodation?.id} />
        <FavoriteButton
          type="accommodation"
          referenceId={accommodation?.accommodation_id || accommodation?.id}
          referenceSlug={accommodation?.slug || null}
          redirectToDashboard={false}
          className="hidden md:inline-flex px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OverviewTab accommodation={accommodation} />
              </motion.div>
            )}
            {activeTab === "booking" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BookingTab accommodation={accommodation} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Common Map Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12"
          >
            <MapSection
              latitude={accommodation.latitude}
              longitude={accommodation.longitude}
              name={accommodation.name}
              address={`${accommodation.address}, ${accommodation.city}, ${accommodation.country}`}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Button for Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-30 md:hidden"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackClick}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          title="Back to accommodations"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </motion.section>
  );
}