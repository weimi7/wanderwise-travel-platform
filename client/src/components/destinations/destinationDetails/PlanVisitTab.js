'use client';
import { motion } from 'framer-motion';
import { Calendar, Luggage, Wifi, Bath, Lightbulb, Clock, Users, Car, Utensils, Toilet, Bike, Ticket, Info, Map, Train, Shrub, Sailboat, Hotel, Bus } from 'lucide-react';

export default function PlanVisitTab({
  best_time,
  what_to_bring = [],
  facilities = [],
  tips,
}) {
  // Icon mapping for facilities
  const facilityIcons = {
    'Sanitary facilities': Bath,
    'Parking': Car,
    'Restaurant': Utensils,
    'Restrooms': Users,
    'Guided tours': Clock,
    'Wifi': Wifi,
    'Accommodation': Users,
    'Toilets': Toilet,
    'Bike rental': Bike,
    'First aid': Lightbulb,
    'Rest areas': Users,
    'Guide services': Clock,
    'guides': Users,
    'visitor center': Users,
    'ticket counter': Ticket,
    'information boards': Info,
    'eco-lodge nearby': Map,
    'picnic area': Utensils,
    'local guides': Users,
    'eateries': Utensils,
    'cafés': Utensils,
    'train station': Train,
    'public parks': Shrub,
    'gardens': Shrub,
    'boat rides': Sailboat,
    'scenic viewpoints': Map,
    'hotels': Hotel,
    'public transport': Bus,
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const getFacilityIcon = (facility) => {
    const lowerFacility = facility.toLowerCase();
      for (const [key, Icon] of Object.entries(facilityIcons)) {
        if (lowerFacility.includes(key.toLowerCase())) { // convert key to lowercase
      return Icon;
      }
    }
    return Clock; // Default icon
  };

  return (
    <motion.div
      className="space-y-8 py-8 px-6 mt-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Calendar className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Plan Your Visit
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Everything you need to know for a perfect trip
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Best Time to Visit */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Best Time to Visit
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-blue-700 dark:text-blue-300 font-medium text-lg">
                {best_time}
              </p>
            </div>
          </motion.div>

          {/* What to Bring */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Luggage className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                What to Bring
              </h3>
            </div>
            
            {Array.isArray(what_to_bring) && what_to_bring.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {what_to_bring.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 group hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 dark:text-green-300 font-medium text-sm">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <Luggage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No specific items mentioned</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Facilities Available */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Facilities Available
              </h3>
            </div>
            
            {Array.isArray(facilities) && facilities.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {facilities.map((item, idx) => {
                  const IconComponent = getFacilityIcon(item);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 group hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        {item}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <Wifi className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No facilities listed</p>
              </div>
            )}
          </motion.div>

          {/* Important Tips */}
          {tips && (
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Pro Tips
                </h3>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-yellow-200 dark:border-yellow-600">
                <p className="text-yellow-700 dark:text-yellow-300 font-medium leading-relaxed">
                  💡 {tips}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-6 right-6 opacity-10">
        <Calendar className="w-16 h-16 text-blue-500" />
      </div>
    </motion.div>
  );
}