'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Users, Clock, Star } from 'lucide-react';

// Import components
import ContactBanner from '@/components/contact/ContactBanner';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import ContactMap from '@/components/contact/ContactMap';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/4 w-32 h-32 bg-cyan-200 dark:bg-cyan-900 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <ContactBanner />

        {/* Main Content Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-4 py-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ContactForm />
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <ContactInfo />
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Users, number: '5K+', label: 'Happy Travelers', color: 'text-blue-600' },
                { icon: Star, number: '4.9/5', label: 'Rating', color: 'text-yellow-600' },
                { icon: MessageCircle, number: '24/7', label: 'Support', color: 'text-green-600' },
                { icon: Clock, number: '<1h', label: 'Avg. Response', color: 'text-purple-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Map Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-4 py-20"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4"
            >
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Our Location</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Find Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Office</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Visit us at our headquarters in Colombo, Sri Lanka. We&#39;d love to meet you in person!
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ContactMap />
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}