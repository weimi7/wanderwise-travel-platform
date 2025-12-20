'use client';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Users, Globe, Star } from 'lucide-react';

export default function ContactInfo() {
  const contactItems = [
    {
      icon: Phone,
      title: "Phone",
      details: ["(+94) 11 297 6988", "(+94) 77 297 6988"],
      description: "Call us for immediate assistance",
      color: "from-blue-500 to-blue-600",
      delay: 0.1
    },
    {
      icon: Mail,
      title: "Email",
      details: ["support@wanderwise.com", "info@wanderwise.com"],
      description: "We respond within 24 hours",
      color: "from-green-500 to-green-600",
      delay: 0.2
    },
    {
      icon: MapPin,
      title: "Office",
      details: ["34th Floor, World Trade Center,", "Echelon Square, Colombo 01,", "Sri Lanka."],
      description: "Visit our headquarters",
      color: "from-purple-500 to-purple-600",
      delay: 0.3
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 09:00 - 18:00", "Sat: 09:00 - 13:00"],
      description: "We're here to help you",
      color: "from-orange-500 to-orange-600",
      delay: 0.4
    }
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Happy Travelers", color: "text-blue-500" },
    { icon: MessageCircle, value: "24/7", label: "Support", color: "text-green-500" },
    { icon: Star, value: "4.9/5", label: "Rating", color: "text-yellow-500" },
    { icon: Globe, value: "50+", label: "Destinations", color: "text-purple-500" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.2 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          viewport={{ once: true }}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Get in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          We&#39;re here to help you plan your perfect Sri Lankan adventure
        </p>
      </div>

      {/* Contact Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {contactItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: item.delay }}
            viewport={{ once: true }}
            className="group cursor-pointer"
            whileHover={{ y: -5 }}
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-start gap-4">
                {/* Icon with gradient background */}
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    {item.title}
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </h3>
                  
                  <div className="space-y-1">
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-gray-600 dark:text-gray-300 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        viewport={{ once: true }}
        className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-red-800 text-sm">Emergency Support</h4>
            <p className="text-red-600 text-xs">(+94) 77 911 9111 - Available 24/7</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}