'use client';

import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, DollarSign, Info, MapPin } from 'lucide-react';

export default function TransportPopup({ isOpen, onClose, transport }) {
  const colorMap = {
    train: { bg: 'bg-green-100', text: 'text-green-700', accent: 'bg-green-500' },
    bus: { bg: 'bg-blue-100', text: 'text-blue-700', accent: 'bg-blue-500' },
    taxi: { bg: 'bg-amber-100', text: 'text-amber-700', accent: 'bg-amber-500' },
    rental: { bg: 'bg-red-100', text: 'text-red-700', accent: 'bg-red-500' }
  };

  const colors =
    colorMap[transport?.type] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      accent: 'bg-gray-500',
    };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={onClose}
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Popup Content */}
          <motion.div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-3/4 h-3/4 sm:h-auto sm:max-w-md z-10 overflow-y-auto custom-scrollbar"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header accent bar */}
            <div className={`h-2 w-full ${colors.accent}`} />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200 cursor-pointer"
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {/* Content */}
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
                  <div className="text-2xl">{transport?.icon}</div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {transport?.name}
                  </h2>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1 bg-gray-100 text-gray-600">
                    {transport?.info}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={18} className="text-gray-500" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Description
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pl-7">
                  {transport?.notes}
                </p>
              </div>

              <div className="space-y-5">
                {/* Timetable */}
                {transport?.timetable?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={18} className="text-gray-500" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        Schedule
                      </h3>
                    </div>
                    <ul className="space-y-2 pl-7">
                      {transport.timetable.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-600 text-sm"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-2 ${colors.accent}`}
                          ></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prices */}
                {transport?.prices?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={18} className="text-gray-500" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        Pricing
                      </h3>
                    </div>
                    <ul className="space-y-2 pl-7">
                      {transport.prices.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-600 text-sm"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-2 ${colors.accent}`}
                          ></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Additional Tips */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    Traveler Tip
                  </h4>
                </div>
                <p className="text-xs text-gray-600">
                  {transport?.type === 'train' &&
                    'Book tickets in advance for popular routes like Kandy to Ella.'}
                  {transport?.type === 'bus' &&
                    'Express buses are faster but may cost slightly more than regular buses.'}
                  {transport?.type === 'taxi' &&
                    'Use ride-hailing apps for fixed prices and better service quality.'}
                  {transport?.type === 'rental' &&
                    'Consider renting with a driver for longer journeys in unfamiliar areas.'}
                </p>
              </div>

              {/* Action Button */}
              <button
                className={`w-full mt-6 py-3 rounded-xl font-medium text-white ${colors.accent} hover:opacity-90 transition-opacity duration-200 cursor-pointer`}
                onClick={onClose}
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
