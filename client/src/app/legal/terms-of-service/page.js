'use client';

import React, { useState } from "react";
import LegalLayout from "@/components/common/LegalLayout";
import { 
  FileText, 
  UserCheck, 
  CreditCard, 
  MessageSquare, 
  Shield, 
  AlertTriangle, 
  Scale, 
  Mail, 
  Download,
  ChevronRight,
  CheckCircle,
  Calendar,
  Lock,
  Globe,
  Smartphone,
  ExternalLink,
  ThumbsUp,
  XCircle,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TermsOfServicePage() {
  const [expandedSections, setExpandedSections] = useState(["agreement", "using-service"]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: "agreement",
      title: "1. Agreement to Terms",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      content: `These Terms of Service ("Terms") govern your access to and use of the WanderWise Travel Platform (the "Service"). By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, you must not use the Service.`,
      highlights: ["Legally Binding", "Acceptance Required", "Updated Periodically"]
    },
    {
      id: "using-service",
      title: "2. Using the Service",
      icon: UserCheck,
      color: "from-emerald-500 to-green-500",
      items: [
        "You must be at least 18 years old to create an account and use the Service.",
        "You agree to provide accurate, current, and complete information during registration and to keep this information updated.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        "You agree to use the Service only for lawful purposes and in accordance with these Terms."
      ]
    },
    {
      id: "bookings-payments",
      title: "3. Bookings and Payments",
      icon: CreditCard,
      color: "from-amber-500 to-orange-500",
      subsections: [
        {
          title: "Booking Confirmation",
          icon: CheckCircle,
          content: "Booking requests become confirmed only after you receive a confirmation email from us. The specific terms shown during booking (cancellation policies, special requirements, etc.) form part of this agreement."
        },
        {
          title: "Payment Processing",
          icon: CreditCard,
          content: "All payments are processed by secure third-party payment processors. You agree to their terms as applicable. We do not store full payment card details on our servers."
        },
        {
          title: "Pricing & Taxes",
          icon: DollarSign,
          content: "Prices are displayed inclusive of applicable taxes unless otherwise specified. Prices are subject to change, but confirmed bookings will be honored at the booked rate."
        },
        {
          title: "Cancellations & Refunds",
          icon: Calendar,
          content: "Cancellation policies vary by property/activity and are clearly displayed during booking. Refunds, when applicable, are processed according to the relevant cancellation policy."
        }
      ]
    },
    {
      id: "user-content",
      title: "4. User Content",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      content: `You retain ownership of content you post, submit, or display ("User Content") on the Service, such as reviews, photos, and comments. By posting User Content, you grant WanderWise a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform that User Content in connection with the Service.`,
      note: "You are solely responsible for your User Content and its accuracy. We reserve the right to remove any User Content that violates these Terms."
    },
    {
      id: "prohibited-conduct",
      title: "5. Prohibited Conduct",
      icon: XCircle,
      color: "from-rose-500 to-red-500",
      items: [
        "Using the Service for any unlawful purpose or promoting illegal activities",
        "Impersonating any person or entity or falsely stating your affiliation",
        "Interfering with or disrupting the Service or servers/networks connected to the Service",
        "Posting harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content",
        "Attempting to gain unauthorized access to any portion of the Service",
        "Using bots, scrapers, or other automated means to access the Service"
      ],
      warning: true
    },
    {
      id: "disclaimers-liability",
      title: "6. Disclaimers & Limitation of Liability",
      icon: AlertTriangle,
      color: "from-yellow-500 to-amber-500",
      content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WANDERWISE DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
      liability: {
        title: "Limitation of Liability",
        content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, WANDERWISE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO WANDERWISE IN THE LAST 12 MONTHS.`
      }
    },
    {
      id: "governing-law",
      title: "7. Governing Law & Disputes",
      icon: Scale,
      color: "from-indigo-500 to-violet-500",
      content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where WanderWise is incorporated, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the appropriate courts of that jurisdiction.`,
      features: ["Jurisdiction: Sri Lanka", "Arbitration Available", "30-Day Resolution Period"]
    },
    {
      id: "changes-terms",
      title: "8. Changes to Terms",
      icon: Calendar,
      color: "from-teal-500 to-cyan-500",
      content: `We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on this page with an updated "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.`,
      note: "We encourage you to review these Terms periodically for any changes."
    },
    {
      id: "contact",
      title: "9. Contact Information",
      icon: Mail,
      color: "from-gray-500 to-gray-700",
      content: `For questions, concerns, or notices regarding these Terms of Service, please contact our support team.`,
      contactInfo: {
        email: "support@wanderwise.com",
        phone: "+94 (77) 297-6988",
        address: "34th Floor, World Trade Center, Echelon Square, Colombo 01, Sri Lanka"
      }
    }
  ];

  const downloadTerms = () => {
    const content = `
WanderWise Terms of Service
============================
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
${section.liability ? `
${section.liability.title}
${'-'.repeat(section.liability.title.length)}
${section.liability.content}
` : ''}
${section.contactInfo ? `
Contact Information:
Email: ${section.contactInfo.email}
Phone: ${section.contactInfo.phone}
Address: ${section.contactInfo.address}
` : ''}
`).join('\n\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderwise-terms-of-service-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    alert("Thank you for accepting the Terms of Service! You may now proceed to use our platform.");
    // In a real app, you would save this acceptance to the backend
  };

  return (
    <LegalLayout
      title="Terms of Service (TOS)"
      description="The rules and responsibilities for using the WanderWise Travel Platform"
      lastUpdated="Nov 2025"
    >
      {/* Quick Summary */}
      <div className="mb-12">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Understanding Our Terms</h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  These Terms of Service outline your rights and responsibilities when using WanderWise. Please read them carefully before using our platform.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadTerms}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Terms
            </motion.button>
          </div>
        </div>
      </div>

      {/* Interactive Sections */}
      <div className="space-y-4 mb-12">
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
                        <p className={`text-gray-700 dark:text-gray-300 mb-4 leading-relaxed ${section.warning ? 'bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800' : ''}`}>
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
                              {section.warning ? (
                                <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                              )}
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Liability */}
                      {section.liability && (
                        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">{section.liability.title}</h4>
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            {section.liability.content}
                          </p>
                        </div>
                      )}

                      {/* Features */}
                      {section.features && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Key Features:</h4>
                          <div className="flex flex-wrap gap-2">
                            {section.features.map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      {section.contactInfo && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Contact Details:</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{section.contactInfo.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Smartphone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{section.contactInfo.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{section.contactInfo.address}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Note */}
                      {section.note && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                          <p className="text-blue-700 dark:text-blue-400 text-sm">
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

      {/* Acceptance Section */}
      <div className="mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                <ThumbsUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Accept Terms</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  By accepting these Terms, you acknowledge that you have read, understood, and agree to be bound by them.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Your Acceptance Matters</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    By using WanderWise, you automatically agree to these Terms of Service. Click the button below to explicitly confirm your acceptance.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: acceptedTerms ? 1 : 1.05 }}
                whileTap={{ scale: acceptedTerms ? 1 : 0.95 }}
                onClick={handleAcceptTerms}
                disabled={acceptedTerms}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl hover:shadow-lg transition-all whitespace-nowrap cursor-pointer ${acceptedTerms
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {acceptedTerms ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Terms Accepted
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-5 h-5" />
                    Accept Terms of Service
                  </>
                )}
              </motion.button>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">What Happens Next?</h4>
              <ul className="text-emerald-700 dark:text-emerald-400 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You gain full access to all WanderWise features and services</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Your acceptance is recorded for compliance purposes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You can start booking travel experiences immediately</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Card */}
      <div className="mb-12">
        <div className="p-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Quick Reference</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Here are the most important points to remember from our Terms of Service:
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Age</p>
                    <p className="font-medium text-gray-800 dark:text-white">18 years or older</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payments</p>
                    <p className="font-medium text-gray-800 dark:text-white">Secure third-party processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Security</p>
                    <p className="font-medium text-gray-800 dark:text-white">You are responsible for your account</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">Need Help Understanding?</h4>
              <p className="text-blue-700 dark:text-blue-400 text-sm mb-4">
                If any part of these Terms is unclear, our support team is here to help explain them in plain language.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@wanderwise.com"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Mail className="w-4 h-4" />
                  support@wanderwise.com
                </a>
                <a
                  href="/help/legal-faq"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Legal FAQ
                </a>
                <a
                  href="/contact"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <BookOpen className="w-4 h-4" />
                  Schedule Legal Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>These Terms of Service were last updated on November 2025</span>
        </div>
        <p className="mt-2">We recommend reviewing these Terms periodically for any changes.</p>
      </div>
    </LegalLayout>
  );
}

// Custom DollarSign icon component
function DollarSign(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}