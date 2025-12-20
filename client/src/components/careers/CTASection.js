'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 p-12 md:p-16 text-center text-white">
            <Rocket className="w-20 h-20 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Even if you don&apos;t see the perfect role, we&apos;d love to hear from you.  
              Amazing talent always finds a home at WanderWise. 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 cursor-pointer"
                >
                  Send Open Application
                  <ArrowRight className="w-5 h-5" />
                </motion. button>
              </Link>
              
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-transparent border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all cursor-pointer"
                >
                  Learn About Our Journey
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Floating Elements */}
          {[... Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 100, opacity: 0 }}
              animate={{ 
                y: [100, -100, 100],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
              className="absolute w-4 h-4 bg-white rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                bottom: '0%'
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}