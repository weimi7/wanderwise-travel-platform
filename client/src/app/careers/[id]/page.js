'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, DollarSign, Users,
  CheckCircle, Send, Briefcase, Calendar, Award,
  Heart, Rocket, Zap, Globe, Shield, Loader2,
  BookOpen, Code, Star, Target, Users2, AlertCircle,
  MessageSquare, Sparkles, GraduationCap, Coffee,
  TrendingUp, Building, Share2, Bookmark, BookmarkCheck
} from 'lucide-react';
import ApplyJobModal from '@/components/careers/modals/ApplyJobModal';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Fetch job details from API
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE}/api/careers/jobs/${jobId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setJob(data.job);
          
          // Update page metadata
          document.title = `${data.job.title} - Careers at WanderWise`;
        } else {
          setError(data.message || 'Job not found');
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details.  Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Initialize bookmark and share URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
      
      // Check if job is bookmarked
      const bookmarks = JSON.parse(localStorage.getItem('jobBookmarks') || '[]');
      setIsBookmarked(bookmarks. includes(jobId));
    }
  }, [jobId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('jobBookmarks') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(id => id !== jobId);
      localStorage.setItem('jobBookmarks', JSON. stringify(newBookmarks));
      toast.success('Removed from bookmarks');
    } else {
      bookmarks.push(jobId);
      localStorage.setItem('jobBookmarks', JSON.stringify(bookmarks));
      toast.success('Added to bookmarks');
    }
    setIsBookmarked(!isBookmarked);
  };

  const shareJob = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity at WanderWise:  ${job.title}`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard! ');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'requirements', label: 'Requirements', icon: CheckCircle },
    { id:  'benefits', label: 'Benefits', icon: Heart },
    { id: 'process', label: 'Process', icon: Rocket }
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading job details... </p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center pt-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y:  0 }}
          className="text-center max-w-md"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The job you\'re looking for doesn\'t exist or has been removed. '}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/careers')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all cursor-pointer"
            >
              View All Jobs
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </motion. div>
      </div>
    );
  }

  // Parse array fields if they're strings
  const skills = Array.isArray(job. skills) ? job.skills : [];
  const perks = Array.isArray(job.perks) ? job.perks : [];
  const responsibilities = Array.isArray(job. responsibilities) ? job.responsibilities : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const niceToHave = Array.isArray(job.nice_to_have) ? job.nice_to_have : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];
  const applicationProcess = Array.isArray(job. application_process) ? job.application_process : [];

  return (
    <>
      {/* SEO Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title":  job.title,
            "description": job.description || job.overview,
            "datePosted": job.posted_date || job.created_at,
            "employmentType": job.type,
            "hiringOrganization": {
              "@type": "Organization",
              "name": "WanderWise",
              "sameAs": "https://wanderwise.com"
            },
            "jobLocation": {
              "@type":  "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location
              }
            },
            "baseSalary": job.salary_range ?  {
              "@type": "MonetaryAmount",
              "currency": "LKR",
              "value": {
                "@type": "QuantitativeValue",
                "value": job.salary_range
              }
            } : undefined
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-20 px-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y:  [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat:  Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/careers">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:shadow-xl transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Careers</span>
              </motion.button>
            </Link>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleBookmark}
                className={`p-3 rounded-2xl ${isBookmarked 
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                } transition-all cursor-pointer`}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareJob}
                className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity:  1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Job Header */}
            <div className="p-8 md:p-12 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-blue-200 dark:border-blue-800">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold">
                      {job.department}
                    </span>
                    {job.urgency === 'high' && (
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs font-bold animate-pulse">
                        ⚡ URGENT HIRING
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    {job.title}
                  </h1>

                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    {job.description}
                  </p>

                  {/* Job Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">{job.location}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">{job.type}</div>
                    </div>
                    {job.salary_range && (
                      <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Salary</span>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">{job.salary_range}</div>
                      </div>
                    )}
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Posted</span>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {job.posted_date ?  new Date(job.posted_date).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  {skills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Required Skills: </p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity:  0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:scale-105 transition-transform cursor-default"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Card */}
                <div className="lg:w-96">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 lg:sticky lg:top-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Ready to Apply?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Join our team of innovators</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {job.team_size && (
                        <div className="flex items-center gap-3">
                          <Users2 className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Team Size</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{job.team_size}</div>
                          </div>
                        </div>
                      )}
                      {job.experience_required && (
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Experience</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{job.experience_required}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Openings</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{job.openings || 1} position(s)</div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowApplyModal(true)}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 group cursor-pointer"
                    >
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Apply for this Position
                    </motion.button>

                    <button
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full mt-3 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover: bg-gray-50 dark: hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      Have Questions? 
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-8 py-4 font-medium transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === tab. id
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8 md:p-12">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {job.overview && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                        Role Overview
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                        {job.overview}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    {responsibilities.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                          <Target className="w-5 h-5 text-purple-500" />
                          Key Responsibilities
                        </h3>
                        <ul className="space-y-3">
                          {responsibilities.map((item, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity:  0, x: -20 }}
                              animate={{ opacity:  1, x: 0 }}
                              transition={{ delay:  i * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                            >
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {perks.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                          <Zap className="w-5 h-5 text-amber-500" />
                          Perks & Benefits
                        </h3>
                        <ul className="space-y-3">
                          {perks.map((item, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl"
                            >
                              <Star className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'requirements' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    {requirements.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          Must-Have Requirements
                        </h3>
                        <ul className="space-y-3">
                          {requirements.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {niceToHave.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          Nice to Have
                        </h3>
                        <ul className="space-y-3">
                          {niceToHave.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion. div>
              )}

              {activeTab === 'benefits' && benefits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <Heart className="w-6 h-6 text-red-500" />
                      Why You&apos;ll Love Working Here
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {benefits.map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                            {i % 6 === 0 ?  <DollarSign className="w-6 h-6 text-white" /> : 
                             i % 6 === 1 ? <Heart className="w-6 h-6 text-white" /> :
                             i % 6 === 2 ?  <Coffee className="w-6 h-6 text-white" /> : 
                             i % 6 === 3 ? <Globe className="w-6 h-6 text-white" /> : 
                             i % 6 === 4 ? <GraduationCap className="w-6 h-6 text-white" /> :
                             <TrendingUp className="w-6 h-6 text-white" />}
                          </div>
                          <p className="text-gray-800 dark:text-white font-medium">{benefit}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'process' && applicationProcess.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <Rocket className="w-6 h-6 text-amber-500" />
                      Application Process
                    </h2>
                    <div className="relative">
                      <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                      
                      <div className="space-y-8">
                        {applicationProcess.map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity:  0, x: i % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity:  1, x: 0 }}
                            transition={{ delay:  i * 0.2 }}
                            className={`relative flex flex-col md:flex-row ${i % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center gap-6`}
                          >
                            <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-4 border-blue-500 rounded-full z-10" />
                            
                            <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 text-right' : 'md:pl-12'}`}>
                              <div className={`p-6 rounded-2xl ${i % 2 === 0 
                                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' 
                                : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
                              }`}>
                                <div className="flex items-center gap-3 mb-2">
                                  {i % 6 === 0 ? <MessageSquare className="w-5 h-5 text-blue-500" /> :
                                   i % 6 === 1 ? <Code className="w-5 h-5 text-purple-500" /> :
                                   i % 6 === 2 ?  <Users className="w-5 h-5 text-emerald-500" /> :
                                   i % 6 === 3 ? <Building className="w-5 h-5 text-amber-500" /> :
                                   i % 6 === 4 ? <Heart className="w-5 h-5 text-red-500" /> :
                                   <CheckCircle className="w-5 h-5 text-green-500" />}
                                  <h3 className="font-bold text-gray-900 dark:text-white">Step {i + 1}</h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{step}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="p-8 md:p-12 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Ready to Start Your Journey?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Join a team that values innovation, collaboration, and making a real impact. 
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowApplyModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group cursor-pointer"
                  >
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Apply Now
                  </motion.button>

                  <button
                    onClick={() => router.push('/careers')}
                    className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover: bg-gray-50 dark: hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    View Other Positions
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <div id="contact" className="mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-800">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-4">
                    Questions About This Role? 
                  </h3>
                  <p className="text-blue-700 dark:text-blue-400 mb-6">
                    Our recruitment team is here to help.  Reach out with any questions about the position, requirements, or application process.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Email</div>
                        <a href="mailto:careers@wanderwise.com" className="font-medium text-blue-800 dark:text-blue-300 hover:underline">
                          careers@wanderwise.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Before You Apply</h4>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Update your resume and portfolio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Prepare for technical discussions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Review our company values</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Job Modal */}
      {job && (
        <ApplyJobModal 
          isOpen={showApplyModal} 
          onClose={() => setShowApplyModal(false)} 
          job={job} 
        />
      )}
    </>
  );
}