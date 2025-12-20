'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Send, Mail, User, MessageCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name:  '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target. name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers:  { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject:  '', message: '' });
        
        // Reset success state after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError(data.message || 'Failed to send message.  Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission failed:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.2 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full relative overflow-hidden"
    >
      {/* Success Overlay */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-green-50 dark:bg-green-900/30 flex items-center justify-center z-10 rounded-2xl backdrop-blur-sm"
          >
            <div className="text-center p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                Message Sent Successfully!
              </h3>
              <p className="text-green-600 dark:text-green-300">
                Thank you for contacting us. We&#39;ll get back to you within 24-48 hours. 
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <Mail className="w-16 h-16 text-blue-500" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-10">
        <MessageCircle className="w-12 h-12 text-purple-500" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale:  1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Send Us a Message
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We&#39;d love to hear from you.  Get in touch with our team. 
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion. div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity:  1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Your Name *"
              value={formData. name}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
              disabled={loading}
            />
          </div>
        </div>

        <div className="relative">
          <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="subject"
            placeholder="Subject *"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            disabled={loading}
          />
        </div>

        <div className="relative">
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message...  *"
            value={formData.message}
            onChange={handleChange}
            required
            minLength={10}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none outline-none"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 10 characters</p>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
            loading ?  'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 cursor-pointer'
          }`}
        >
          {loading ?  (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
            </>
          )}
        </motion.button>

        {/* Privacy Note */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          🔒 Your information is secure and will never be shared with third parties. <br/>
          We typically respond within 24-48 hours during business days. 
        </p>
      </form>
    </motion.div>
  );
}