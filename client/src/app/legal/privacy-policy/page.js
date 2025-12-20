'use client';

import React, { useState } from "react";
import LegalLayout from "@/components/common/LegalLayout";
import { 
  Shield, 
  Eye, 
  Database, 
  CreditCard, 
  Bell, 
  Globe, 
  Lock, 
  Mail, 
  UserCheck, 
  Download,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Smartphone,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced Privacy Policy page for WanderWise Travel Platform
 * - Interactive sections with expandable details
 * - Visual icons for better readability
 * - Quick summary section
 * - Download option for privacy policy
 */

export default function PrivacyPolicyPage() {
  const [expandedSections, setExpandedSections] = useState(["introduction"]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      content: `WanderWise ("we", "us", "our") operates the WanderWise Travel Platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit and use the Service.`,
      highlights: [
        "Transparent data practices",
        "GDPR compliant",
        "Regularly updated"
      ]
    },
    {
      id: "information-collected",
      title: "Information We Collect",
      icon: Database,
      color: "from-emerald-500 to-green-500",
      subsections: [
        {
          title: "Information you provide",
          icon: UserCheck,
          content: "When you create an account, book an activity or accommodation, write a review, or contact support, we collect information you provide such as your name, email address, phone number, billing details, travel preferences, and message contents."
        },
        {
          title: "Automatically collected information",
          icon: Smartphone,
          content: "We collect data about your interactions with the Service, including device information, IP address, browser type, pages visited, and timestamps. We also use cookies and similar technologies to provide core functionality and analytics."
        },
        {
          title: "Payment information",
          icon: CreditCard,
          content: "We do not store full card details on our servers unless explicitly stated; we use payment processors to handle sensitive payment data. We may store masked card numbers or the last 4 digits for identification and receipts."
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Bell,
      color: "from-amber-500 to-orange-500",
      items: [
        "To provide and maintain the Service, including booking, confirmations, and messaging.",
        "To process payments and refunds, and to prevent fraud.",
        "To personalize your experience and show relevant content and offers.",
        "To communicate with you regarding bookings, updates, and support requests.",
        "To comply with legal obligations and resolve disputes."
      ]
    },
    {
      id: "sharing-disclosure",
      title: "Sharing and Disclosure",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      content: "We may share personal information with third parties only as necessary to operate the Service: payment processors, service providers, analytics vendors, and legal authorities when required. We do not sell your personal information.",
      note: "Your data is never sold or shared for marketing purposes without your explicit consent."
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: FileText,
      color: "from-indigo-500 to-violet-500",
      content: "We retain personal information for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements."
    },
    {
      id: "your-rights",
      title: "Your Choices & Rights",
      icon: Eye,
      color: "from-rose-500 to-red-500",
      content: "You may access and update your account information, opt out of marketing communications, and request deletion of your account. Requests can be made via the account settings or by emailing support@wanderwise.com. Some data may remain in backups or logs for a reasonable period.",
      rights: ["Right to Access", "Right to Rectification", "Right to Deletion", "Right to Object"]
    },
    {
      id: "security",
      title: "Security",
      icon: Lock,
      color: "from-gray-600 to-gray-800",
      content: "We implement reasonable administrative, technical, and physical safeguards to protect personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.",
      features: ["256-bit SSL encryption", "Regular security audits", "PCI DSS compliance"]
    },
    {
      id: "children",
      title: "Children",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      content: "The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such data, please contact us to request deletion."
    },
    {
      id: "international-transfers",
      title: "International Transfers",
      icon: Globe,
      color: "from-teal-500 to-cyan-500",
      content: "As a global service, we may transfer personal data to countries outside your residence. Where required, we implement appropriate safeguards to protect your information in accordance with applicable law.",
      certifications: ["GDPR", "CCPA", "PIPEDA"]
    },
    {
      id: "policy-changes",
      title: "Changes to This Policy",
      icon: AlertCircle,
      color: "from-yellow-500 to-amber-500",
      content: "We may update this Privacy Policy from time to time. If we make material changes, we will provide notice on the site or by other means before the changes take effect."
    }
  ];

  const downloadPrivacyPolicy = () => {
    const content = `
WanderWise Privacy Policy
===========================
Last Updated: ${new Date().getFullYear()}

${sections.map(section => `
${section.title}
${'='.repeat(section.title.length)}
${section.content || ''}
${section.items ? section.items.map(item => `• ${item}`).join('\n') : ''}
${section.subsections ? section.subsections.map(sub => `
${sub.title}
${'-'.repeat(sub.title.length)}
${sub.content}
`).join('\n') : ''}
`).join('\n\n')}

Contact Information
===================
Email: support@wanderwise.com
Phone: +1 (800) 555-1234
Address: 123 Travel Street, Suite 100, San Francisco, CA 94107
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderwise-privacy-policy-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LegalLayout
      title="Privacy Policy"
      description="Transparent and comprehensive privacy practices for your data protection"
      lastUpdated="Nov 2025"
    >
      {/* Quick Summary */}
      <div className="mb-12">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Your Privacy Matters</h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  We&apos;re committed to protecting your personal data with transparent practices and robust security measures.
                  This policy outlines how we collect, use, and safeguard your information.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadPrivacyPolicy}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Policy
            </motion.button>
          </div>
        </div>
      </div>

      {/* Interactive Policy Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <motion.div
              key={section.id}
              layout
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{section.title}</h3>
                    {section.highlights && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {section.highlights.map((highlight, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      {/* Main Content */}
                      {section.content && (
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                          {section.content}
                        </p>
                      )}

                      {/* Subsections */}
                      {section.subsections && (
                        <div className="space-y-4 mb-4">
                          {section.subsections.map((subsection, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                {subsection.icon && <subsection.icon className="w-4 h-4 text-gray-500" />}
                                <h4 className="font-medium text-gray-800 dark:text-white">{subsection.title}</h4>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {subsection.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* List Items */}
                      {section.items && (
                        <ul className="space-y-2 mb-4">
                          {section.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Rights */}
                      {section.rights && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Your Rights Include:</h4>
                          <div className="flex flex-wrap gap-2">
                            {section.rights.map((right, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                              >
                                {right}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {section.features && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Security Features:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {section.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center"
                              >
                                <div className="text-sm font-medium text-gray-800 dark:text-white">{feature}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {section.certifications && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Compliance:</h4>
                          <div className="flex flex-wrap gap-2">
                            {section.certifications.map((cert, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Note */}
                      {section.note && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            <strong>Note:</strong> {section.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Contact Information Card */}
      <div className="mt-12">
        <div className="p-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Contact Us</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                If you have questions about this policy or how we handle your data, please reach out to our privacy team.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href="mailto:support@wanderwise.com" className="font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      support@wanderwise.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-800 dark:text-white">+94 (77) 297-6988</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">Data Protection Officer</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span>Oversees all data protection matters</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>GDPR compliance certified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <Lock className="w-4 h-4" />
                  <span>Annual security audits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>This privacy policy was last updated on November 2024</span>
        </div>
        <p className="mt-2">We encourage you to review this policy periodically for any changes.</p>
      </div>
    </LegalLayout>
  );
}