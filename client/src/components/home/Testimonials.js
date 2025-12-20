'use client';

import { motion } from 'framer-motion';
import { Star, Quote, User, MapPin, Calendar } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "New York, USA",
      rating: 5,
      text: "This app completely transformed my Sri Lanka trip! The personalized recommendations led us to hidden gems we would have never found otherwise.",
      date: "December 2023",
      image: "👩‍💼"
    },
    {
      id: 2,
      name: "David Chen",
      location: "Singapore",
      rating: 5,
      text: "Incredible experience! The itinerary planner saved us hours of research and the local insights were spot on. Can't wait to visit again!",
      date: "January 2024",
      image: "👨‍💼"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      location: "London, UK",
      rating: 5,
      text: "From booking accommodations to finding the best local experiences, WanderWise made everything seamless. A must-have for any Sri Lanka traveler!",
      date: "February 2024",
      image: "👩‍🎓"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br dark:to-gray-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Rated 4.9/5 by 2,000+ Travelers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Don&#39;t just take our word for it. Here&#39;s what our community of adventurers has to say about their experiences.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="group cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                {/* Quote icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-grow italic">
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Testimonial footer */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl">
                      {testimonial.image}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{testimonial.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{testimonial.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer">
            Join Our Community
            <User className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;