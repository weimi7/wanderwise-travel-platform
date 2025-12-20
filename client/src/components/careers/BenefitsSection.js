'use client';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { benefits } from './data/benefitsData';

export default function BenefitsSection() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full mb-4">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-semibold">Perks & Benefits</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            We Take Care of Our Team
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Competitive benefits designed to support your health, wealth, and happiness
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration:  0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y:  -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <Icon className={`w-10 h-10 text-${benefit.color}-600 dark:text-${benefit.color}-400 mb-4`} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}