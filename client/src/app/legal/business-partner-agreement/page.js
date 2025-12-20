'use client';

import React, { useState } from "react";
import LegalLayout from "@/components/common/LegalLayout";
import { 
  FileText, 
  Handshake, 
  Calendar, 
  CheckCircle, 
  DollarSign, 
  Shield, 
  Copyright, 
  AlertTriangle,
  Building2,
  Users,
  CreditCard,
  Database,
  Scale,
  Mail,
  PenTool,
  Download,
  ChevronRight,
  ExternalLink,
  BookOpen,
  FileCheck,
  Lock,
  Globe,
  Target,
  Briefcase,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EFFECTIVE_DATE = new Date().toISOString().split('T')[0];

export default function BusinessPartnerAgreementPage() {
  const [expandedSections, setExpandedSections] = useState(["parties", "purpose"]);
  const [signatureData, setSignatureData] = useState({
    partnerName: "",
    signature: "",
    date: EFFECTIVE_DATE
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: "parties",
      title: "1. Parties",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      content: `This Business Partner Agreement ("Agreement") is entered into between WanderWise ("Platform", "we", "us") and the business partner identified during the partner onboarding process ("Partner", "you"). Collectively, the Platform and the Partner are the "Parties".`
    },
    {
      id: "purpose",
      title: "2. Purpose",
      icon: Target,
      color: "from-emerald-500 to-green-500",
      content: `The Platform operates an online travel marketplace to list, promote and enable bookings for accommodations, tours, activities, and related services. The Partner provides accommodation, tours or activity services and desires to list its offerings on the Platform under the terms of this Agreement.`
    },
    {
      id: "term",
      title: "3. Term",
      icon: Calendar,
      color: "from-amber-500 to-orange-500",
      content: `The Agreement begins on the Effective Date and continues until terminated by either Party in accordance with Section 14 (Termination).`
    },
    {
      id: "partner-responsibilities",
      title: "4. Partner Responsibilities",
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      items: [
        { 
          title: "Accurate Information", 
          content: "Provide and maintain accurate, complete and up-to-date information about property or activity, including amenities, descriptions, availability, pricing, photos, policies and license details.",
          icon: FileCheck
        },
        { 
          title: "Compliance", 
          content: "Comply with all applicable laws, permits, licenses, safety standards, and industry regulations in the jurisdictions where it operates.",
          icon: Shield
        },
        { 
          title: "Booking Fulfillment", 
          content: "Honor confirmed bookings, provide services, and ensure a safe and satisfactory guest experience.",
          icon: CheckCircle
        },
        { 
          title: "Customer Service", 
          content: "Provide timely responses to guest inquiries and cooperate on customer support issues and dispute resolution.",
          icon: Users
        },
        { 
          title: "Insurance", 
          content: "Maintain appropriate insurance coverage (liability, property, workers' compensation) and provide proof upon request.",
          icon: Shield
        }
      ]
    },
    {
      id: "platform-responsibilities",
      title: "5. Platform Responsibilities",
      icon: Zap,
      color: "from-indigo-500 to-violet-500",
      items: [
        { 
          title: "Listing & Promotion", 
          content: "List Partner's offerings, display provided information, and make reasonable efforts to market Partner's services to users.",
          icon: Globe
        },
        { 
          title: "Booking Infrastructure", 
          content: "Provide booking infrastructure, payment routing, confirmation delivery, and basic customer support.",
          icon: Briefcase
        },
        { 
          title: "Payment Handling", 
          content: "Process customer payments on behalf of Partner or route to third-party providers. Payments subject to commission terms.",
          icon: CreditCard
        }
      ]
    },
    {
      id: "rates-availability",
      title: "6. Rates, Availability & Policies",
      icon: DollarSign,
      color: "from-rose-500 to-red-500",
      content: `The Partner is solely responsible for setting prices, availability calendars, minimum stay rules, check-in / check-out policies, cancellation and refund policies. The Partner authorizes the Platform to display those policies to guests at booking time.`
    },
    {
      id: "commission-fees",
      title: "7. Commission, Fees & Payments",
      icon: CreditCard,
      color: "from-green-500 to-emerald-500",
      items: [
        { 
          title: "Commission", 
          content: "Platform retains a commission or fee for each booking made through the Platform. Rates agreed during onboarding and may be updated with prior notice.",
          icon: PercentIcon
        },
        { 
          title: "Settlement", 
          content: "Net payouts to Partner (revenue less commission and fees) paid on agreed schedule, subject to successful payment capture and any holds required.",
          icon: Calendar
        },
        { 
          title: "Taxes", 
          content: "Each Party responsible for its own tax reporting. Partner responsible for collecting and remitting local occupancy or tourism taxes where applicable.",
          icon: Scale
        }
      ]
    },
    {
      id: "data-sharing",
      title: "8. Data Sharing & Privacy",
      icon: Database,
      color: "from-cyan-500 to-blue-500",
      content: `Parties share data necessary to complete and manage bookings (guest names, contact details, reservation data). Each Party processes personal data in accordance with applicable privacy laws and Platform's Privacy Policy. Partner only uses guest data for booking and service delivery unless additional consent provided.`
    },
    {
      id: "intellectual-property",
      title: "9. Intellectual Property",
      icon: Copyright,
      color: "from-violet-500 to-purple-500",
      content: `Partner grants Platform a non-exclusive, worldwide, royalty-free license to use, reproduce, display and promote Partner's listing content. Partner represents and warrants ownership or right to license such content without violating third-party rights.`
    },
    {
      id: "representations-warranties",
      title: "10. Representations & Warranties",
      icon: Shield,
      color: "from-orange-500 to-amber-500",
      content: `Each Party represents full right and authority to enter into this Agreement. Partner further represents offerings meet all safety and legal requirements and will promptly disclose any material changes affecting the listing.`
    },
    {
      id: "indemnification",
      title: "11. Indemnification",
      icon: Scale,
      color: "from-red-500 to-rose-500",
      content: `Partner agrees to indemnify, defend and hold Platform, its affiliates, officers and employees harmless from claims, losses, liabilities, damages, and expenses arising from Partner's breach, negligence, willful misconduct, or failure to provide services as promised.`
    },
    {
      id: "limitation-liability",
      title: "12. Limitation of Liability",
      icon: AlertTriangle,
      color: "from-yellow-500 to-amber-500",
      warning: true,
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY WILL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES ARISING OUT OF THIS AGREEMENT. THE PLATFORM'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT WILL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE TO THE PLATFORM IN THE SIX (6) MONTHS PRECEDING THE EVENT.`
    },
    {
      id: "confidentiality",
      title: "13. Confidentiality",
      icon: Lock,
      color: "from-gray-600 to-gray-800",
      content: `Each Party keeps confidential the other Party's non-public information designated confidential or reasonably understood to be confidential. Information only used to perform obligations and not disclosed except to permitted parties bound to protect information.`
    },
    {
      id: "termination",
      title: "14. Termination",
      icon: Calendar,
      color: "from-pink-500 to-rose-500",
      content: `Either Party may terminate for convenience with prior written notice. Platform may suspend or remove listings immediately for breach, illegal conduct, or risk to guests. Termination doesn't relieve obligations incurred before termination.`
    },
    {
      id: "dispute-resolution",
      title: "15. Dispute Resolution & Governing Law",
      icon: Scale,
      color: "from-blue-500 to-indigo-500",
      content: `Disputes first resolved through good faith negotiation. If unresolved, governed by laws of Platform's jurisdiction and resolved in appropriate courts or via arbitration if agreed.`
    },
    {
      id: "miscellaneous",
      title: "16. Miscellaneous",
      icon: FileText,
      color: "from-gray-500 to-gray-700",
      items: [
        { title: "Independent Contractors", content: "Parties are independent contractors. Nothing creates an employment relationship." },
        { title: "Assignment", content: "Partner may not assign this Agreement without Platform's prior written consent." },
        { title: "Notices", content: "Notices delivered to contact details provided during onboarding or via Platform." },
        { title: "Entire Agreement", content: "Constitutes entire agreement between Parties, supersedes prior agreements." }
      ]
    }
  ];

  const handleSignatureSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would submit to your backend
    alert("Agreement submitted! A copy has been sent to your email.");
    
    // Generate downloadable PDF
    const content = `
WanderWise Business Partner Agreement
======================================
Effective Date: ${EFFECTIVE_DATE}

Partner: ${signatureData.partnerName}
Signature: ${signatureData.signature}
Date: ${signatureData.date}

${sections.map(s => `
${s.title}
${'='.repeat(s.title.length)}
${s.content || ''}
${s.items ? s.items.map(i => `${i.title}: ${i.content}`).join('\n') : ''}
`).join('\n\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderwise-partner-agreement-${signatureData.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAgreement = () => {
    const content = sections.map(s => `
${s.title}
${'='.repeat(s.title.length)}
${s.content || ''}
${s.items ? s.items.map(i => `• ${i.title}: ${i.content}`).join('\n') : ''}
`).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderwise-partner-agreement-${EFFECTIVE_DATE}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LegalLayout
      title="Business Partner Agreement"
      description="Comprehensive partnership terms for hotels, activity operators, and accommodation providers"
      lastUpdated={EFFECTIVE_DATE}
    >
      {/* Agreement Header */}
      <div className="mb-12">
        <div className="p-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <Handshake className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">Partnership Agreement</h3>
                <p className="text-blue-700 dark:text-blue-400">
                  This Agreement is effective as of <strong>{EFFECTIVE_DATE}</strong> and governs the relationship between WanderWise and our valued business partners.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    Legally Binding
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-sm">
                    Mutually Beneficial
                  </span>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                    Commission Based
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadAgreement}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Download Agreement
            </motion.button>
          </div>
        </div>
      </div>

      {/* Agreement Sections */}
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
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-left">{section.title}</h3>
                    {section.warning && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-600 dark:text-amber-400">Important Legal Notice</span>
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
                        <div className={`text-gray-700 dark:text-gray-300 mb-4 leading-relaxed ${section.warning ? 'bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800' : ''}`}>
                          {section.content}
                        </div>
                      )}

                      {/* Items List */}
                      {section.items && (
                        <div className="space-y-3">
                          {section.items.map((item, idx) => {
                            const ItemIcon = item.icon || FileText;
                            return (
                              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg mt-1">
                                    <ItemIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{item.title}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.content}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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

      {/* Signature Section */}
      <div className="mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Signature</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  By registering as a Partner and/or performing activities under a Partner account, you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSignatureSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Partner Name / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signatureData.partnerName}
                    onChange={(e) => setSignatureData({...signatureData, partnerName: e.target.value})}
                    placeholder="Enter your business name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signature *
                  </label>
                  <input
                    type="text"
                    required
                    value={signatureData.signature}
                    onChange={(e) => setSignatureData({...signatureData, signature: e.target.value})}
                    placeholder="Type your full name as signature"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-signature"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={signatureData.date}
                    onChange={(e) => setSignatureData({...signatureData, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Important Notice</h4>
                    <ul className="text-emerald-700 dark:text-emerald-400 text-sm space-y-2">
                      <li>• This Agreement constitutes a legally binding contract between you and WanderWise</li>
                      <li>• By signing, you confirm you have read, understood, and agree to all terms</li>
                      <li>• A signed copy will be emailed to you for your records</li>
                      <li>• For questions, contact partners@wanderwise.com before signing</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  Accept & Sign Agreement
                </motion.button>

                <button
                  type="button"
                  onClick={() => setSignatureData({
                    partnerName: "",
                    signature: "",
                    date: EFFECTIVE_DATE
                  })}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-12">
        <div className="p-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Partner Support</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                For questions about this Agreement, partnership terms, or to notify us of changes, please contact our Partner Relations team.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href="mailto:partners@wanderwise.com" className="font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      partners@wanderwise.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Partner Portal</p>
                    <a href="/partners/dashboard" className="font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      Access Partner Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">Partner Benefits</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                  <span>Access to millions of travelers worldwide</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <DollarSign className="w-4 h-4" />
                  <span>Competitive commission rates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <Globe className="w-4 h-4" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Legal Note</h4>
            <p className="text-amber-700 dark:text-amber-400">
              This document is provided for informational purposes and as a template for partnership agreements. It does not constitute legal advice. You should consult with qualified legal counsel to tailor this Agreement to your specific business needs and local legal requirements before execution. WanderWise is not responsible for any modifications made to this template.
            </p>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}

// Custom icon for percentage
function PercentIcon(props) {
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
      <line x1="19" y1="5" x2="5" y2="19"></line>
      <circle cx="6.5" cy="6.5" r="2.5"></circle>
      <circle cx="17.5" cy="17.5" r="2.5"></circle>
    </svg>
  );
}