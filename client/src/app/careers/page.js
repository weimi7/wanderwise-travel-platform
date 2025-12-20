'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import BenefitsSection from "@/components/careers/BenefitsSection";
import CTASection from "@/components/careers/CTASection";
import CultureSection from "@/components/careers/CultureSection";
import HeroSection from "@/components/careers/HeroSection";
import JobList from "@/components/careers/JobList";
import ValuesSection from "@/components/careers/ValuesSection";

export default function CareersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);

    // Update page metadata
    document.title = "Careers - Join WanderWise | Build the Future of Travel";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join WanderWise and help build innovative travel solutions. Explore exciting career opportunities in engineering, design, marketing, and more. Apply now!');
    }

    // Simulate initial load (remove if not needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity:  1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading career opportunities...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion. div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y:  0 }}
          className="text-center max-w-md"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Careers at WanderWise",
            "description": "Join our team and help build the future of travel technology.  Explore exciting career opportunities at WanderWise.",
            "url":  typeof window !== 'undefined' ?  window.location.href : "https://wanderwise.com/careers",
            "publisher": {
              "@type": "Organization",
              "name": "WanderWise",
              "logo": {
                "@type": "ImageObject",
                "url":  "https://wanderwise.com/logo.png"
              }
            },
            "breadcrumb":  {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position":  1,
                  "name": "Home",
                  "item": typeof window !== 'undefined' ? window.location.origin :  "https://wanderwise.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name":  "Careers",
                  "item": typeof window !== 'undefined' ? window.location.href :  "https://wanderwise.com/careers"
                }
              ]
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://wanderwise.com/careers? search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + 'vw',
                y: Math.random() * 100 + 'vh',
                opacity:  0
              }}
              animate={{
                x: [
                  Math.random() * 100 + 'vw',
                  Math.random() * 100 + 'vw',
                  Math.random() * 100 + 'vw'
                ],
                y: [
                  Math.random() * 100 + 'vh',
                  Math.random() * 100 + 'vh',
                  Math.random() * 100 + 'vh'
                ],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${
                  i % 3 === 0 ?  '#60a5fa' : 
                  i % 3 === 1 ? '#a78bfa' : 
                  '#34d399'
                }22, transparent 70%)`
              }}
            />
          ))}
        </div>

        {/* Content Sections */}
        <div className="relative z-10">
          <HeroSection />
          <CultureSection />
          <ValuesSection />
          <BenefitsSection />
          <JobList />
          <CTASection />
        </div>
      </div>
    </>
  );
}