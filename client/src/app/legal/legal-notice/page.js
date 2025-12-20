'use client';

import React, { useState } from "react";
import LegalLayout from "@/components/common/LegalLayout";
import { 
  Scale, 
  Building, 
  Copyright, 
  Mail, 
  Globe, 
  Phone, 
  MapPin, 
  Shield, 
  AlertCircle, 
  FileText,
  CheckCircle,
  Download,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Users,
  BookOpen,
  PenTool,
  Eye,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LegalNoticePage() {
  const [expandedSections, setExpandedSections] = useState(["company-info", "contact"]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: "company-info",
      title: "Company Information",
      icon: Building,
      color: "from-blue-500 to-cyan-500",
      content: `WanderWise Travel Platform is operated by WanderWise Technologies Ltd., a registered company providing online travel booking services worldwide.`,
      details: {
        "Legal Name": "WanderWise Technologies Ltd.",
        "Registration Number": "PV 1234567",
        "VAT Number": "VAT123456789",
        "Company Type": "Private Limited Company",
        "Incorporation Date": "January 15, 2020"
      }
    },
    {
      id: "registered-office",
      title: "Registered Office",
      icon: MapPin,
      color: "from-emerald-500 to-green-500",
      content: `The official registered office address for all legal correspondence and formal notices is:`,
      address: {
        street: "34th Floor, World Trade Center",
        city: "Echelon Square",
        state: "Colombo 01",
        country: "Sri Lanka",
        postal: "00100"
      }
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: Mail,
      color: "from-amber-500 to-orange-500",
      content: `For general inquiries, customer support, and business communications:`,
      contacts: [
        {
          type: "General Inquiries",
          email: "info@wanderwise.com",
          phone: "+94 (11) 234-5678"
        },
        {
          type: "Customer Support",
          email: "support@wanderwise.com",
          phone: "+94 (77) 297-6988"
        },
        {
          type: "Business Partnerships",
          email: "partners@wanderwise.com",
          phone: "+94 (11) 234-5679"
        },
        {
          type: "Legal Matters",
          email: "legal@wanderwise.com",
          phone: "+94 (11) 234-5680"
        }
      ]
    },
    {
      id: "governing-law",
      title: "Governing Law & Jurisdiction",
      icon: Scale,
      color: "from-purple-500 to-pink-500",
      content: `These legal notices and all matters arising out of or relating to these notices shall be governed by and construed in accordance with the laws of Sri Lanka.`,
      jurisdiction: {
        country: "Sri Lanka",
        court: "Commercial High Court of Colombo",
        arbitration: "Arbitration shall be conducted in accordance with the Arbitration Act of Sri Lanka"
      }
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: Copyright,
      color: "from-indigo-500 to-violet-500",
      content: `All content, trademarks, logos, and service marks displayed on this platform are the property of WanderWise Technologies Ltd. or their respective owners.`,
      rights: [
        "© 2020-2025 WanderWise Technologies Ltd. All rights reserved.",
        "WanderWise® is a registered trademark.",
        "All website design, text, graphics, and software are proprietary.",
        "Unauthorized use may violate copyright, trademark, and other laws."
      ]
    },
    {
      id: "liability",
      title: "Liability Disclaimer",
      icon: Shield,
      color: "from-rose-500 to-red-500",
      content: `WanderWise provides travel booking services as an intermediary platform. We are not liable for services provided by third-party accommodation providers, tour operators, or activity hosts.`,
      disclaimers: [
        "Information on this platform is provided 'as is' without warranty.",
        "We are not responsible for inaccuracies in third-party listings.",
        "Prices and availability are subject to change without notice.",
        "Travel restrictions and requirements are the traveler's responsibility."
      ]
    },
    {
      id: "external-links",
      title: "External Links",
      icon: ExternalLink,
      color: "from-teal-500 to-cyan-500",
      content: `This platform may contain links to external websites. We have no control over the content of these sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.`,
      warning: "Links to external sites do not imply endorsement or approval."
    },
    {
      id: "accessibility",
      title: "Accessibility Statement",
      icon: Eye,
      color: "from-yellow-500 to-amber-500",
      content: `WanderWise is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying relevant accessibility standards.`,
      compliance: ["WCAG 2.1 Level AA", "ADA Compliance", "Regular Accessibility Audits"]
    }
  ];

  const downloadLegalNotice = () => {
    const content = `
WanderWise Legal Notice
========================
Effective Date: ${new Date().getFullYear()}

${sections.map(section => `
${section.title}
${'='.repeat(section.title.length)}
${section.content}

${section.details ? Object.entries(section.details).map(([key, value]) => `${key}: ${value}`).join('\n') : ''}
${section.address ? `Address:\n${Object.values(section.address).join(', ')}` : ''}
${section.contacts ? section.contacts.map(c => `${c.type}:\nEmail: ${c.email}\nPhone: ${c.phone}`).join('\n\n') : ''}
${section.jurisdiction ? `Jurisdiction:\n${Object.entries(section.jurisdiction).map(([key, value]) => `${key}: ${value}`).join('\n')}` : ''}
${section.rights ? section.rights.map(r => `• ${r}`).join('\n') : ''}
${section.disclaimers ? section.disclaimers.map(d => `• ${d}`).join('\n') : ''}
${section.compliance ? `Compliance: ${section.compliance.join(', ')}` : ''}
${section.warning ? `Note: ${section.warning}` : ''}
`).join('\n\n')}

Last Updated: November 2025
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderwise-legal-notice-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LegalLayout
      title="Legal Notice"
      description="Official legal information, company details, and formal notices for WanderWise"
      lastUpdated="Nov 2025"
    >
      {/* Header Card */}
      <div className="mb-12">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Official Legal Notice</h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  This document contains formal legal information required by law. It provides transparency about our company structure and legal framework.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadLegalNotice}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Notice
            </motion.button>
          </div>
        </div>
      </div>

      {/* Legal Information Sections */}
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

                      {/* Company Details */}
                      {section.details && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Company Details:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(section.details).map(([key, value]) => (
                              <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400">{key}</div>
                                <div className="font-medium text-gray-800 dark:text-white">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      {section.address && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Address:</h4>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <MapPin className="w-4 h-4" />
                                <span>{section.address.street}</span>
                              </div>
                              <div className="ml-6">
                                <div>{section.address.city}</div>
                                <div>{section.address.state}</div>
                                <div>{section.address.country}</div>
                                <div className="text-gray-500 dark:text-gray-400">{section.address.postal}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Information */}
                      {section.contacts && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Contact Channels:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.contacts.map((contact, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <h5 className="font-medium text-gray-800 dark:text-white mb-2">{contact.type}</h5>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <a href={`mailto:${contact.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                      {contact.email}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-500" />
                                    <span className="text-gray-700 dark:text-gray-300">{contact.phone}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Jurisdiction */}
                      {section.jurisdiction && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Jurisdiction Details:</h4>
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                            {Object.entries(section.jurisdiction).map(([key, value]) => (
                              <div key={key} className="mb-2 last:mb-0">
                                <div className="text-sm font-medium text-purple-700 dark:text-purple-300 capitalize">{key}:</div>
                                <div className="text-purple-600 dark:text-purple-400">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rights List */}
                      {section.rights && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Intellectual Property Rights:</h4>
                          <ul className="space-y-2">
                            {section.rights.map((right, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{right}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Disclaimers */}
                      {section.disclaimers && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Important Disclaimers:</h4>
                          <ul className="space-y-2">
                            {section.disclaimers.map((disclaimer, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{disclaimer}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Compliance */}
                      {section.compliance && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Compliance Standards:</h4>
                          <div className="flex flex-wrap gap-2">
                            {section.compliance.map((standard, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm"
                              >
                                {standard}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warning */}
                      {section.warning && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            <strong>Note:</strong> {section.warning}
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

      {/* Important Notice */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 mb-12">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Legal Notice Information</h4>
            <p className="text-amber-700 dark:text-amber-400">
              This legal notice fulfills statutory disclosure requirements under applicable laws. It is intended to provide transparency about our corporate structure and legal framework. For specific legal advice, please consult with qualified legal counsel.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mb-12">
        <div className="p-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Quick Legal Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Company Details</h4>
              </div>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                WanderWise Technologies Ltd. • Registered in Sri Lanka • VAT: VAT123456789
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Contact Points</h4>
              </div>
              <div className="text-purple-700 dark:text-purple-400 text-sm space-y-2">
                <div>Support: support@wanderwise.com</div>
                <div>Legal: legal@wanderwise.com</div>
                <div>Business: partners@wanderwise.com</div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-3">
                <PenTool className="w-5 h-5 text-emerald-500" />
                <h4 className="font-medium text-emerald-800 dark:text-emerald-300">Updates</h4>
              </div>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm">
                This legal notice is reviewed annually. Last updated: November 2025. Changes are effective immediately upon posting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="w-4 h-4" />
          <span>This legal notice was last updated on November 2025</span>
        </div>
        <p>We recommend checking this page periodically for any updates to our legal information.</p>
      </div>
    </LegalLayout>
  );
}