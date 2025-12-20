import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Shield, FileText, Globe, Clock, Mail, Phone, Home, ArrowUpRight, ExternalLink, BookOpen, CheckCircle, AlertCircle, Info, HelpCircle } from "lucide-react";

export default function LegalLayout({ title, description, children, lastUpdated = "Nov 2025" }) {
  const legalLinks = [
    { name: "Privacy Policy", href: "/legal/privacy-policy", active: title === "Privacy Policy" },
    { name: "Terms of Service", href: "/legal/terms-of-service", active: title === "Terms of Service (TOS)" },
    { name: "Business Partner Agreement", href: "/legal/business-partner-agreement", active: title === "Business Partner Agreement" },
    { name: "Legal Notice", href: "/legal/legal-notice", active: title === "Legal Notice" },
    { name: "Disclaimer", href: "/legal/disclaimer", active: title === "Disclaimer" },
    { name: "Contact", href: "/contact", active: false },
  ];

  const quickFacts = [
    { icon: Clock, text: `Last Updated: ${lastUpdated}`, color: "text-blue-600 dark:text-blue-400" },
    { icon: BookOpen, text: "Legal Document", color: "text-emerald-600 dark:text-emerald-400" },
    { icon: Shield, text: "Legally Binding", color: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <main className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {description}
            </p>
          )}
          
          {/* Quick Facts */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {quickFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <Icon className={`w-4 h-4 ${fact.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fact.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 space-y-6">
              {/* Legal Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">Legal Documents</h3>
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                  {legalLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        link.active
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${link.active ? "bg-blue-100 dark:bg-blue-900/40" : "bg-gray-100 dark:bg-gray-700"}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{link.name}</span>
                      </div>
                      {link.active && <ArrowUpRight className="w-4 h-4" />}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Help Card */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Need Help?</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Have questions about our legal terms?
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href="mailto:support@wanderwise.com"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Mail className="w-4 h-4" />
                    support@wanderwise.com
                  </a>
                  <a
                    href="tel:+18005551234"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Phone className="w-4 h-4" />
                    +94 (77) 297-6988
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Print Document</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Save as PDF</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Content Header */}
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <CheckCircle className="w-4 h-4" />
                          Effective as of {lastUpdated}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Globe className="w-4 h-4" />
                          Applies worldwide
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-ul:mt-4 prose-ul:mb-4 prose-li:mt-2 prose-li:mb-2">
                  {children}
                </div>

                {/* Important Notice */}
                <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Legal Notice</h4>
                      <p className="text-amber-700 dark:text-amber-400 text-sm">
                        This document constitutes a legally binding agreement. By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with any part of these terms, you must discontinue use of our services immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="px-8 py-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <Scale className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-semibold text-gray-800 dark:text-white">WanderWise Legal</h5>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      © {new Date().getFullYear()} WanderWise Travel Platform. All rights reserved.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    >
                      <Home className="w-4 h-4" />
                      Back to Home
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Mail className="w-4 h-4" />
                      Contact Support
                    </Link>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p className="mb-1">For legal inquiries or to serve legal notices, please contact:</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      34th Floor • World Trade Center • Echelon Square • Colombo 01 • Sri Lanka.
                    </p>
                    <p className="mt-2">Email: legal@wanderwise.com • Phone: +94 (77) 297-8988</p>
                  </div>
                </div>
              </footer>
              </div>

            {/* Version History */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Document History</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Current Version</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Effective {lastUpdated}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Previous Version</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Effective January 2023</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                    Archived
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}