"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaPinterest } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MapPin, Phone, Mail, CheckCircle, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Successfully subscribed! ');
        setIsSubscribed(true);
        setEmail('');

        // Reset success state after 5 seconds
        setTimeout(() => setIsSubscribed(false), 5000);
      } else {
        toast.error(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white pt-16 pb-8 px-4 mt-4 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <span className="text-white text-xl">🌴</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                WanderWise
              </h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your ultimate Sri Lanka travel companion. Discover hidden gems and create unforgettable memories.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-sm">Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone size={16} className="text-blue-400" />
                <span className="text-sm">+94 77 297 6988</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail size={16} className="text-blue-400" />
                <span className="text-sm">info@wanderwise.com</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4">
              {[
                { icon: FaFacebook, color: "hover:text-blue-400", label: "Facebook", href: "https://facebook.com" },
                { icon: FaInstagram, color:  "hover:text-pink-400", label: "Instagram", href:  "https://instagram.com" },
                { icon: FaTwitter, color: "hover:text-blue-300", label: "Twitter", href:  "https://twitter.com" },
                { icon: FaYoutube, color: "hover: text-red-400", label:  "YouTube", href: "https://youtube.com" },
                { icon: FaPinterest, color: "hover:text-red-500", label: "Pinterest", href: "https://pinterest.com" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 ${social.color} cursor-pointer`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Explore */}
          <motion. div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration:  0.6, delay: 0.1 }}
            viewport={{ once:  true }}
          >
            <h3 className="font-semibold text-lg mb-6 text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Explore
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/destinations", label: "Destinations" },
                { href: "/activities", label: "Activities" },
                { href: "/itinerary-planner", label: "Itinerary Planner" },
                { href: "/accommodations", label: "Accommodation" },
                { href: "/transportation", label: "Transportation" }
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Information */}
          <motion.div
            initial={{ opacity: 0, y:  20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-lg mb-6 text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Information
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href:  "/contact", label: "Contact Us" },
                { href: "/legal/privacy-policy", label: "Privacy Policy" },
                { href: "/legal/terms-of-service", label: "Terms of Service" },
                { href: "/legal/sitemap", label: "Site Map" }
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-green-400 transition-colors"></div>
                    {link. label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-lg mb-6 text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-4 text-sm">
              Subscribe to get exclusive travel tips and updates delivered to your inbox.
            </p>

            <AnimatePresence mode="wait">
              {isSubscribed ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity:  1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-6 text-center"
                >
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-green-400 font-semibold mb-1">Successfully Subscribed!</p>
                  <p className="text-gray-300 text-sm">Check your email for confirmation.</p>
                </motion. div>
              ) : (
                <motion.form
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubscribe}
                  className="space-y-3"
                >
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus: ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Subscribe Now
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {! isSubscribed && (
              <p className="text-gray-400 text-xs mt-3">
                ✨ Join 5,000+ travelers who receive our weekly updates
              </p>
            )}
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm font-medium flex items-center gap-1">
              &copy; {currentYear} WanderWise. Made with <Heart size={14} fill='red' className="text-red-500 inline" /> in Sri Lanka
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/legal/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/legal/sitemap" className="hover:text-white transition-colors">Site Map</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;