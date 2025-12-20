'use client';
import { motion } from 'framer-motion';
import { values } from './data/valuesData';

export default function ValuesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Core Values
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            The principles that guide every decision and interaction
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration:  0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y:  -5, scale: 1.02 }}
                className={`bg-gradient-to-br ${value.color} rounded-2xl p-8 hover:shadow-2xl transition-all text-white relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />
                <Icon className="w-12 h-12 mb-6 relative z-10" />
                <h3 className="text-xl font-bold mb-3 relative z-10">
                  {value.title}
                </h3>
                <p className="opacity-90 relative z-10">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}