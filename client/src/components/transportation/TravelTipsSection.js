'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Train, Bus, Car, ArrowRight, Compass } from 'lucide-react';

import TravelTipModal from './TravelTipModal';

const travelTips = [
  {
    from: 'Colombo',
    to: 'Kandy',
    tip: 'Start early to avoid traffic. Take the train for scenic views through tea plantations, or expressway bus for speed and comfort.',
    icon: <Train className="text-blue-600" size={24} />,
    duration: '2.5-3 hours',
    proTip: 'Book train tickets in advance for the observation car - best views!',
    color: 'blue'
  },
  {
    from: 'Ella',
    to: 'Nuwara Eliya',
    tip: 'Tuk-tuks are available but can be costly for this route. Opt for a local bus for a budget-friendly scenic ride through the highlands.',
    icon: <Bus className="text-green-600" size={24} />,
    duration: '2 hours',
    proTip: 'The bus journey offers spectacular views of tea plantations - sit on the left side!',
    color: 'green'
  },
  {
    from: 'Galle',
    to: 'Colombo',
    tip: 'Use the Southern Expressway for the fastest route. AC buses depart every 30 minutes from the Galle bus station.',
    icon: <Bus className="text-orange-600" size={24} />,
    duration: '1.5 hours',
    proTip: 'Take the coastal route if you have extra time - beautiful ocean views!',
    color: 'orange'
  },
  {
    from: 'Sigiriya',
    to: 'Dambulla',
    tip: 'Only 30 minutes by tuk-tuk or local bus. Morning is the best time to travel to beat the heat and crowds.',
    icon: <MapPin className="text-red-600" size={24} />,
    duration: '30 minutes',
    proTip: 'Combine both sites in one day - they\'re very close to each other.',
    color: 'red'
  },
  {
    from: 'Negombo',
    to: 'Colombo Airport',
    tip: 'Use a registered airport taxi or Uber/Bolt for safety and fixed pricing. Avoid touts near the station.',
    icon: <Car className="text-purple-500" size={24} />,
    duration: '20-30 minutes',
    proTip: 'Pre-book your airport transfer to avoid last-minute hassles.',
    color: 'purple'
  },
];

export default function TravelTipsSection() {
  const [selectedTip, setSelectedTip] = useState(null);

  return (
    <section className="mt-12 md:mt-16 px-4 md:px-10 py-10 md:py-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-lg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-blue-200 rounded-full -translate-y-20 translate-x-20 opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-indigo-200 rounded-full translate-y-16 -translate-x-16 opacity-30"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full mb-3 md:mb-4 shadow-lg">
            <Compass size={28} className="text-white md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold p-5 md:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
            Smart Travel Tips
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Expert advice for traveling between Sri Lanka&#39;s most popular destinations
          </p>
        </motion.div>

        {/* Cards Section */}
        <div className="
          flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 
          overflow-x-auto md:overflow-visible pb-6 md:pb-0 px-1 md:px-0 
          custom-scrollbar scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 scrollbar-thumb-rounded-full
        ">
          {travelTips.map((tip, index) => (
            <motion.div
              key={index}
              className="min-w-[200px] sm:min-w-[220px] md:min-w-0 bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden flex-shrink-0 mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedTip(tip)}
            >
              {/* Color accent */}
              <div className={`h-1.5 w-full bg-${tip.color}-500`}></div>
              
              <div className="p-4 md:p-5">
                <div className="flex items-start gap-2.5 md:gap-3 mb-3">
                  <div className={`p-2.5 md:p-3 rounded-xl bg-${tip.color}-100`}>
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-lg text-gray-800 flex items-center gap-1.5 md:gap-2">
                      {tip.from} 
                      <ArrowRight size={14} className="text-gray-400" />
                      {tip.to}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs md:text-sm text-gray-500">{tip.duration}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs md:text-base text-gray-600 line-clamp-2 mb-3 md:mb-4 leading-relaxed">
                  {tip.tip}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-gray-500">Click for details</span>
                  <div className={`p-1 rounded-full bg-${tip.color}-100 group-hover:bg-${tip.color}-200 transition-colors`}>
                    <ArrowRight size={12} className={`text-${tip.color}-600 md:w-4 md:h-4`} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Scroll Indicator */}
        <motion.div 
          className="text-center mt-6 md:hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-gray-500 inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm py-1.5 px-3 rounded-full border border-gray-200">
            <span>Swipe sideways for more</span>
            <ArrowRight size={14} />
          </p>
        </motion.div>
      </div>

      {/* Modal */}
      <TravelTipModal tip={selectedTip} onClose={() => setSelectedTip(null)} />
    </section>
  );
}
