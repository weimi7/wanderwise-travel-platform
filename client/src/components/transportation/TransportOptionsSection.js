'use client';
import { useState } from 'react';
import { FaTrain, FaBus, FaTaxi, FaCar, FaTimes, FaClock, FaMoneyBill, FaStickyNote, FaStar, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import TransportCard from './TransportCard';
import TransportPopup from './TransportPopup';

const transportData = [
  {
    type: 'train',
    name: 'Train',
    price: 'From $1.99',
    info: 'Scenic & Fast',
    icon: <FaTrain className="text-green-600" />,
    timetable: ['6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
    prices: ['$1.99 - 2nd Class', '$3.99 - 1st Class', '$5.99 - Observation Car'],
    notes: 'Book in advance for peak hours. The observation car offers spectacular views of tea plantations.',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
    color: 'green'
  },
  {
    type: 'bus',
    name: 'Bus',
    price: 'From $1.59',
    info: 'Extensive Network',
    icon: <FaBus className="text-blue-600" />,
    timetable: ['Every 15 min from 5:00 AM to 10:00 PM', 'Night buses available on main routes'],
    prices: ['$1.59 - Standard', '$2.99 - Express', '$4.99 - Air-conditioned'],
    notes: 'Most economical option. Express buses make fewer stops. Great for budget travelers exploring the island.',
    bgColor: 'bg-gradient-to-br from-blue-50 to-sky-100',
    color: 'blue'
  },
  {
    type: 'taxi',
    name: 'Taxi',
    price: 'From $7.99',
    info: 'Door-to-Door',
    icon: <FaTaxi className="text-amber-600" />,
    timetable: ['Available 24/7', 'Booking apps: PickMe, Uber'],
    prices: ['$7.99 base + $0.99/km', '$11.99/hour - waiting time', 'Airport transfers: $14.99-24.99'],
    notes: 'Convenient for short trips and airport transfers. Negotiate fares in advance or use ride-hailing apps.',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
    color: 'amber'
  },
  {
    type: 'rental',
    name: 'Car Rental',
    price: 'From $34.99/day',
    info: 'Complete Freedom',
    icon: <FaCar className="text-red-600" />,
    timetable: ['Pickup any time', '24/7 support'],
    prices: ['$34.99/day - Compact', '$49.99/day - SUV', '$69.99/day - Luxury', 'Includes basic insurance'],
    notes: 'Ideal for exploring remote areas. International driving permit required. Drive on the left side of the road.',
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-100',
    color: 'red'
  },
];

export default function TransportOptionsSection() {
  const [selectedTransport, setSelectedTransport] = useState(null);

  const handleCardClick = (item) => {
    setSelectedTransport(item);
  };

  const handleClose = () => {
    setSelectedTransport(null);
  };

  return (
    <div className="py-10 px-4 md:px-10 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-xl"></div>
      </div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
          <FaStar className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Best Transportation Options</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Travel Style</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Select from various transportation options to suit your budget, schedule, and travel preferences across Sri Lanka.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {transportData.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <TransportCard
              type={item.type}
              name={item.name}
              icon={item.icon}
              price={item.price}
              label={item.info}
              bgColor={item.bgColor}
              onClick={() => handleCardClick(item)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTransport && (
          <TransportPopup
            isOpen={!!selectedTransport}
            onClose={handleClose}
            transport={selectedTransport}
          />
        )}
      </AnimatePresence>
      
      {/* Additional Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 mt-16 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Flexible Timing</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Options available 24/7 to suit your schedule</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaMoneyBill className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Budget Friendly</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">From economical to premium options</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaInfoCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Local Expertise</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Get insider tips for the best travel experience</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}