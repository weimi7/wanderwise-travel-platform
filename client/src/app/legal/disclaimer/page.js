'use client';

import React, { useState } from "react";
import LegalLayout from "@/components/common/LegalLayout";
import { 
  AlertTriangle, 
  Shield, 
  Globe, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  Download,
  ChevronRight,
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Info,
  BookOpen,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DisclaimerPage() {
  const [expandedSections, setExpandedSections] = useState(["general-disclaimer", "travel-risks"]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: "general-disclaimer",
      title: "General Disclaimer",
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-500",
      content: `WanderWise operates as an online travel marketplace and booking platform. We do not own, operate, or manage any of the accommodations, tours, activities, or transportation services listed on our platform.`,
      important: "We act as an intermediary between travelers and service providers."
    },
    {
      id: "travel-risks",
      title: "Travel Risks & Responsibilities",
      icon: Shield,
      color: "from-rose-500 to-red-500",
      content: `Travel involves inherent risks including but not limited to health risks, political instability, natural disasters, and transportation delays. You acknowledge and accept these risks when booking travel through our platform.`,
      responsibilities: [
        "Research destination travel advisories and requirements",
        "Obtain appropriate travel insurance",
        "Ensure you have valid travel documents (passport, visa, etc.)",
        "Follow local laws, customs, and health guidelines",
        "Make reasonable safety assessments for all activities"
      ]
    },
    {
      id: "third-party-services",
      title: "Third-Party Services",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      content: `We provide access to services offered by independent third parties (hotels, tour operators, airlines, etc.). We are not responsible for the quality, safety, legality, or any other aspect of these services.`,
      note: "All bookings are subject to the terms and conditions of the specific service provider."
    },
    {
      id: "pricing-availability",
      title: "Pricing & Availability",
      icon: CreditCard,
      color: "from-emerald-500 to-green-500",
      content: `All prices displayed are subject to change and availability. We make reasonable efforts to ensure accuracy but errors may occur. Final pricing is confirmed at the time of booking.`,
      guarantees: [
        "We display real-time availability where possible",
        "Prices are guaranteed only after booking confirmation",
        "Additional fees (taxes, service charges) may apply",
        "Currency conversion rates are approximate"
      ]
    },
    {
      id: "content-accuracy",
      title: "Content Accuracy",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      content: `While we strive for accuracy, we do not warrant that descriptions, photos, ratings, or other content on our platform are accurate, complete, reliable, current, or error-free. Service providers are responsible for their own content.`,
      warnings: [
        "Photos are for illustrative purposes only",
        "Amenities and features may change without notice",
        "Reviews reflect personal opinions, not our endorsement",
        "Check directly with service providers for current information"
      ]
    },
    {
      id: "health-safety",
      title: "Health & Safety",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      content: `We do not provide medical advice or guarantee health and safety standards at listed properties or activities. You are responsible for assessing your own health capabilities and safety requirements.`,
      considerations: [
        "Check vaccination and health requirements",
        "Disclose any medical conditions to service providers",
        "Follow safety instructions provided by operators",
        "Carry necessary medications and medical information"
      ]
    },
    {
      id: "cancellation-changes",
      title: "Cancellations & Changes",
      icon: Calendar,
      color: "from-indigo-500 to-violet-500",
      content: `Cancellation policies vary by service provider and are displayed during booking. We are not responsible for provider cancellations, schedule changes, or modifications. Travel insurance is recommended.`,
      policies: [
        "Review cancellation policies before booking",
        "Contact providers directly for changes",
        "We may assist with rebooking where possible",
        "Refunds processed according to provider terms"
      ]
    },
    {
      id: "legal-jurisdiction",
      title: "Legal Jurisdiction",
      icon: Globe,
      color: "from-teal-500 to-cyan-500",
      content: `This disclaimer shall be governed by and construed in accordance with the laws of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction of the courts in Colombo, Sri Lanka.`,
      jurisdiction: {
        country: "Sri Lanka",
        city: "Colombo",
        court: "Commercial High Court of Colombo"
      }
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: Shield,
      color: "from-gray-600 to-gray-800",
      warning: true,
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, WANDERWISE SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR TRAVEL SERVICES BOOKED THROUGH IT.`,
      limits: [
        "Maximum liability limited to booking amount",
        "No liability for third-party actions or omissions",
        "No liability for force majeure events",
        "You waive certain legal rights by using our platform"
      ]
    }
  ];

  const downloadDisclaimer = () => {
    const content = `
WanderWise Travel Platform Disclaimer
======================================
Effective Date: ${new Date().getFullYear()}

${sections.map(section => `
${section.title}
${'='.repeat(section.title.length)}
${section.content}

${section.important ? `Important: ${section.important}` : ''}
${section.responsibilities ? section.responsibilities.map(r => `• ${r}`).join('\n') : ''}
${section.guarantees ? section.guarantees.map(g => `• ${g}`).join('\n') : ''}
${section.warnings ? section.warnings.map(w => `• ${w}`).join('\n') : ''}
${section.considerations ? section.considerations.map(c => `• ${c}`).join('\n') : ''}
${section.policies ? section.policies.map(p => `• ${p}`).join('\n') : ''}
${section.jurisdiction ? `Jurisdiction: ${Object.values(section.jurisdiction).join(', ')}` : ''}
${section.limits ? section.limits.map(l => `• ${l}`).join('\n') : ''}
${section.note ? `Note: ${section.note}` : ''}
`).join('\n\n')}

IMPORTANT: This disclaimer limits your legal rights. By using our platform, you acknowledge and accept these terms.

Contact Information
===================
Email: support@wanderwise.com
Phone: +94 (77) 297-6988
Address: 34th Floor, World Trade Center, Colombo 01, Sri Lanka

Last Updated: November 2025
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderwise-disclaimer-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const acceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    alert("Disclaimer acknowledged. You may proceed to use our platform.");
  };

  return (
    <LegalLayout
      title="Disclaimer"
      description="Important limitations, risks, and responsibilities for using our travel platform"
      lastUpdated="Nov 2025"
    >
      {/* Warning Banner */}
      <div className="mb-12">
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Legal Notice</h3>
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  This disclaimer contains critical information about limitations, risks, and responsibilities associated with using our travel platform. Please read carefully.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadDisclaimer}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Disclaimer
            </motion.button>
          </div>
        </div>
      </div>

      {/* Disclaimer Sections */}
      <div className="space-y-4 mb-12">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <motion.div
              key={section.id}
              layout
              className={`bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden hover:shadow-md transition-shadow ${section.warning ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-gray-700'}`}
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
                    {section.warning && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">Critical Information</span>
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

                      {/* Important Note */}
                      {section.important && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                          <p className="text-blue-700 dark:text-blue-400">
                            <strong>Important:</strong> {section.important}
                          </p>
                        </div>
                      )}

                      {/* Responsibilities */}
                      {section.responsibilities && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Your Responsibilities:</h4>
                          <ul className="space-y-2">
                            {section.responsibilities.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Guarantees */}
                      {section.guarantees && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Pricing Guarantees:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {section.guarantees.map((guarantee, idx) => (
                              <div key={idx} className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg">
                                <div className="text-sm text-emerald-700 dark:text-emerald-400">{guarantee}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {section.warnings && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Important Warnings:</h4>
                          <ul className="space-y-2">
                            {section.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Considerations */}
                      {section.considerations && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Health & Safety Considerations:</h4>
                          <div className="space-y-3">
                            {section.considerations.map((consideration, idx) => (
                              <div key={idx} className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg">
                                <div className="text-sm text-pink-700 dark:text-pink-400">{consideration}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Policies */}
                      {section.policies && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Cancellation Policies:</h4>
                          <ul className="space-y-2">
                            {section.policies.map((policy, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{policy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Jurisdiction */}
                      {section.jurisdiction && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Legal Jurisdiction:</h4>
                          <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                            {Object.entries(section.jurisdiction).map(([key, value]) => (
                              <div key={key} className="mb-2 last:mb-0">
                                <div className="text-sm font-medium text-teal-700 dark:text-teal-300 capitalize">{key}:</div>
                                <div className="text-teal-600 dark:text-teal-400">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Limits */}
                      {section.limits && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Liability Limits:</h4>
                          <ul className="space-y-2">
                            {section.limits.map((limit, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Shield className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{limit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Note */}
                      {section.note && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
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
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acknowledge Disclaimer</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  By using our platform, you acknowledge that you have read, understood, and accept this disclaimer.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">What Acknowledgment Means:</h4>
              <ul className="text-emerald-700 dark:text-emerald-400 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You understand and accept the risks associated with travel</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You acknowledge we act as an intermediary, not a service provider</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You accept the limitations of liability outlined above</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You agree to take responsibility for your own travel decisions</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={acceptDisclaimer}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <CheckCircle className="w-5 h-5" />
                I Acknowledge This Disclaimer
              </motion.button>
              <button
                onClick={downloadDisclaimer}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Download className="w-5 h-5" />
                Download for Reference
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mb-12">
        <div className="p-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Key Points</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Travel Risks</p>
                    <p className="font-medium text-gray-800 dark:text-white">You assume all travel risks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Third Parties</p>
                    <p className="font-medium text-gray-800 dark:text-white">We are intermediaries only</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Liability</p>
                    <p className="font-medium text-gray-800 dark:text-white">Limited as described above</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-4">Recommended Actions</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Read terms before booking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <Lock className="w-4 h-4" />
                  <span>Purchase travel insurance</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <Globe className="w-4 h-4" />
                  <span>Research destination requirements</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <Mail className="w-4 h-4" />
                  <span>Contact providers with questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact for Clarification */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Need Clarification?</h4>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              If any part of this disclaimer is unclear or you have questions about its implications, please contact our support team before making travel arrangements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:support@wanderwise.com"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Mail className="w-4 h-4" />
                support@wanderwise.com
              </a>
              <a
                href="tel:+94772976988"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Phone className="w-4 h-4" />
                +94 (77) 297-6988
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="w-4 h-4" />
          <span>This disclaimer was last updated on November 2025</span>
        </div>
        <p>We recommend reviewing this disclaimer before each booking as terms may change.</p>
      </div>
    </LegalLayout>
  );
}