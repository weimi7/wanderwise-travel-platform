'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { culture } from './data/cultureData';

export default function CultureSection() {
  return (
    <section id="culture" className="py-20 px-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Our Culture</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            More Than Just a Workplace
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            We foster an environment where creativity, collaboration, and personal growth thrive
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {culture.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
            >
              <item.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {item.description}
              </p>
            </motion. div>
          ))}
        </div>
      </div>
    </section>
  );
}