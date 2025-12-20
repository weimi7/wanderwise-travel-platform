'use client';

import React, { useState } from "react";
import { 
  Download, 
  Globe, 
  Search, 
  Zap, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Grid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSitemap } from "react-icons/fa";
import { TbFileTypeXml } from "react-icons/tb";

const PAGES = [
  { 
    url: '/', 
    title: 'Home',
    description: 'Discover amazing travel experiences',
    priority: 1.0, 
    changefreq: 'daily',
    category: 'main',
    lastUpdated: '2025-11-15'
  },
  { 
    url: '/accommodations', 
    title: 'Accommodations',
    description: 'Browse hotels, resorts, and stays worldwide',
    priority: 0.8, 
    changefreq: 'weekly',
    category: 'discover',
    lastUpdated: '2025-11-10'
  },
  { 
    url: '/activities', 
    title: 'Activities',
    description: 'Find tours, adventures, and local experiences',
    priority: 0.8, 
    changefreq: 'weekly',
    category: 'discover',
    lastUpdated: '2025-11-10'
  },
  { 
    url: '/accommodations/[slug]', 
    title: 'Accommodation Details',
    description: 'View specific property details and availability',
    priority: 0.6, 
    changefreq: 'monthly',
    category: 'details',
    lastUpdated: '2025-11-05'
  },
  { 
    url: '/activities/[slug]', 
    title: 'Activity Details',
    description: 'View specific activity information and booking',
    priority: 0.6, 
    changefreq: 'monthly',
    category: 'details',
    lastUpdated: '2025-11-05'
  },
  { 
    url: '/dashboard/bookings', 
    title: 'My Bookings',
    description: 'Manage your travel reservations and history',
    priority: 0.3, 
    changefreq: 'monthly',
    category: 'dashboard',
    lastUpdated: '2025-10-30'
  },
  { 
    url: '/dashboard/reviews', 
    title: 'My Reviews',
    description: 'View and manage your travel reviews',
    priority: 0.3, 
    changefreq: 'monthly',
    category: 'dashboard',
    lastUpdated: '2025-10-30'
  },
  { 
    url: '/admin/bookings', 
    title: 'Admin Bookings',
    description: 'Administrator booking management panel',
    priority: 0.2, 
    changefreq: 'monthly',
    category: 'admin',
    lastUpdated: '2025-10-25'
  },
  { 
    url: '/legal/privacy-policy', 
    title: 'Privacy Policy',
    description: 'Our privacy practices and data protection',
    priority: 0.5, 
    changefreq: 'yearly',
    category: 'legal',
    lastUpdated: '2025-11-01'
  },
  { 
    url: '/legal/terms-of-service', 
    title: 'Terms of Service',
    description: 'Platform rules and user agreement',
    priority: 0.5, 
    changefreq: 'yearly',
    category: 'legal',
    lastUpdated: '2025-11-01'
  },
  { 
    url: '/legal/business-partner-agreement', 
    title: 'Partner Agreement',
    description: 'Business partnership terms',
    priority: 0.4, 
    changefreq: 'yearly',
    category: 'legal',
    lastUpdated: '2025-11-01'
  },
  { 
    url: '/about', 
    title: 'About Us',
    description: 'Learn about WanderWise and our mission',
    priority: 0.7, 
    changefreq: 'monthly',
    category: 'company',
    lastUpdated: '2025-10-20'
  },
  { 
    url: '/contact', 
    title: 'Contact',
    description: 'Get in touch with our support team',
    priority: 0.7, 
    changefreq: 'monthly',
    category: 'company',
    lastUpdated: '2025-10-20'
  },
  { 
    url: '/blog', 
    title: 'Travel Blog',
    description: 'Latest travel tips, guides, and stories',
    priority: 0.8, 
    changefreq: 'weekly',
    category: 'content',
    lastUpdated: '2025-11-12'
  },
  { 
    url: '/help', 
    title: 'Help Center',
    description: 'FAQs and customer support resources',
    priority: 0.6, 
    changefreq: 'monthly',
    category: 'support',
    lastUpdated: '2025-10-15'
  }
];

const CATEGORIES = {
  main: { name: 'Main Pages', color: 'from-blue-500 to-cyan-500' },
  discover: { name: 'Discover', color: 'from-emerald-500 to-green-500' },
  details: { name: 'Details', color: 'from-amber-500 to-orange-500' },
  dashboard: { name: 'Dashboard', color: 'from-purple-500 to-pink-500' },
  admin: { name: 'Admin', color: 'from-rose-500 to-red-500' },
  legal: { name: 'Legal', color: 'from-gray-500 to-gray-700' },
  company: { name: 'Company', color: 'from-indigo-500 to-violet-500' },
  content: { name: 'Content', color: 'from-teal-500 to-cyan-500' },
  support: { name: 'Support', color: 'from-yellow-500 to-amber-500' }
};

function buildXml(hostname) {
  const now = new Date().toISOString();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];
  PAGES.forEach(p => {
    lines.push('  <url>');
    lines.push(`    <loc>${hostname}${p.url}</loc>`);
    lines.push(`    <lastmod>${p.lastUpdated}</lastmod>`);
    lines.push(`    <changefreq>${p.changefreq}</changefreq>`);
    lines.push(`    <priority>${p.priority}</priority>`);
    lines.push('  </url>');
  });
  lines.push('</urlset>');
  return lines.join('\n');
}

export default function SitemapPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [copied, setCopied] = useState(false);
  const [showXML, setShowXML] = useState(false);

  const handleDownload = () => {
    const hostname = window.location.origin;
    const xml = buildXml(hostname);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const hostname = window.location.origin;
    const xml = buildXml(hostname);
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPages = selectedCategory === 'all' 
    ? PAGES 
    : PAGES.filter(page => page.category === selectedCategory);

  const getPriorityColor = (priority) => {
    if (priority >= 0.8) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    if (priority >= 0.5) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-700';
  };

  const getFrequencyColor = (freq) => {
    const colors = {
      daily: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      weekly: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      monthly: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
      yearly: 'text-gray-500 bg-gray-50 dark:bg-gray-700'
    };
    return colors[freq] || colors.yearly;
  };

  return (
    <main className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl">
            <FaSitemap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Sitemap
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Complete navigation guide for WanderWise. Download the XML sitemap for SEO or explore our site structure.
          </p>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Pages</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{PAGES.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {PAGES.filter(p => p.priority >= 0.8).length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Updated Daily</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {PAGES.filter(p => p.changefreq === 'daily').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {Object.keys(CATEGORIES).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-8">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <TbFileTypeXml className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">SEO Sitemap Ready</h3>
                  <p className="text-blue-700 dark:text-blue-400 text-sm">
                    Download the XML sitemap for search engines or copy the raw XML for development.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download XML
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy XML'}
                </motion.button>
                <button
                  onClick={() => setShowXML(!showXML)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {showXML ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showXML ? 'Hide XML' : 'View XML'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* XML Preview */}
        <AnimatePresence>
          {showXML && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="p-4 bg-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TbFileTypeXml className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono">sitemap.xml</span>
                  </div>
                  <span className="text-gray-400 text-sm">Generated: {new Date().toISOString().split('T')[0]}</span>
                </div>
                <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
                  {buildXml(window.location.origin)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter & View Controls */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl transition-all ${selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Pages
              </button>
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${selectedCategory === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color}`} />
                  {category.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pages Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPages.map((page) => {
              const CategoryIcon = CATEGORIES[page.category]?.icon || Globe;
              return (
                <motion.div
                  key={page.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${CATEGORIES[page.category]?.color || 'from-gray-500 to-gray-700'}`}>
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(page.priority)}`}>
                          Priority: {page.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getFrequencyColor(page.changefreq)}`}>
                          {page.changefreq}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {page.description}
                    </p>
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated: {page.lastUpdated}
                        </div>
                      </div>
                      <a
                        href={page.url}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Page</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Frequency</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Last Updated</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredPages.map((page) => (
                      <tr key={page.url} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">{page.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{page.url}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${CATEGORIES[page.category]?.color}`} />
                            {CATEGORIES[page.category]?.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(page.priority)}`}>
                            {page.priority}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getFrequencyColor(page.changefreq)}`}>
                            {page.changefreq}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                          {page.lastUpdated}
                        </td>
                        <td className="p-4">
                          <a
                            href={page.url}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            Visit
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tips */}
        <div className="mb-8">
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">SEO Best Practices</h3>
                <ul className="text-emerald-700 dark:text-emerald-400 text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit your XML sitemap to Google Search Console and Bing Webmaster Tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Keep sitemap updated regularly to reflect new content and page changes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Use proper priority values to indicate important pages to search engines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Include canonical URLs to avoid duplicate content issues</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>This sitemap was last generated on {new Date().toLocaleDateString()}</span>
          </div>
          <p>
            For production use, generate an XML sitemap server-side or during build time for optimal SEO performance.
          </p>
        </div>
      </div>
    </main>
  );
}