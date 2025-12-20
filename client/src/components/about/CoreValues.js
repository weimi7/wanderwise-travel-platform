'use client';
import { motion } from 'framer-motion';
import { Heart, Globe, Lightbulb, Users, Sparkles, Target, Star, Shield } from 'lucide-react';

const values = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Passion for Travel',
    description: 'We live and breathe travel. Our passion drives everything we do, creating unforgettable experiences that inspire wanderlust.',
    color: 'from-red-500 to-pink-500',
    delay: 0.1,
    features: ['Authentic experiences', 'Cultural immersion', 'Heartfelt service']
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Local Empowerment',
    description: 'We empower local communities through sustainable tourism, ensuring that travel benefits everyone involved in the journey.',
    color: 'from-green-500 to-emerald-500',
    delay: 0.2,
    features: ['Community support', 'Eco-friendly practices', 'Local partnerships']
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Innovation',
    description: 'We continuously innovate to provide smart, tailored travel experiences using cutting-edge technology and creative solutions.',
    color: 'from-yellow-500 to-amber-500',
    delay: 0.3,
    features: ['AI-powered planning', 'Smart itineraries', 'Tech-driven solutions']
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Customer-Centric',
    description: 'Our users are at the heart of everything we build and offer, with personalized service that exceeds expectations.',
    color: 'from-blue-500 to-cyan-500',
    delay: 0.4,
    features: ['24/7 support', 'Personalized service', 'Continuous feedback']
  }
];

export default function CoreValues() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 mb-6"
          >
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Our Foundation</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Core Values</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            The principles that guide every decision we make and every experience we create
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: value.delay }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              whileHover={{ y: -8 }}
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 h-full relative overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {value.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {value.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Decorative corner */}
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <Star className="w-8 h-8 text-yellow-500" />
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Commitment to Excellence
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              These values aren&#39;t just words—they&#39;re the foundation of every interaction and every journey we create.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </section>
  );
}