'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Briefcase, MapPin, Clock, DollarSign, Award, 
  ArrowRight 
} from 'lucide-react';

export default function JobCard({ job, index }) {
  // Safely access nested properties
  const skills = Array.isArray(job.skills) ? job.skills : [];
  const perks = Array.isArray(job.perks) ? job.perks : [];
  
  return (
    <motion. div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration:  0.6, delay: index * 0.1 }}
      viewport={{ once:  true }}
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all border border-gray-100 dark:border-gray-700 group relative overflow-hidden"
    >
      {/* Urgent Badge */}
      {job. urgency === 'high' && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
          ⚡ URGENT
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-start gap-6 mb-6">
            {/* Department Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              {/* Title & Openings */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job. urgency === 'high' ?  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                  job.urgency === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                }`}>
                  {job.openings || 1} {job.openings === 1 ? 'opening' : 'openings'}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {job.overview || job.description}
              </p>

              {/* Job Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{job.type}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{job. salary_range}</span>
                  </div>
                )}
                {job.experience_required && (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{job.experience_required}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 6).map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium border border-blue-100 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 6 && (
                      <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium">
                        +{skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Perks */}
              {perks. length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Perks:</p>
                  <div className="flex flex-wrap gap-2">
                    {perks.slice(0, 4).map((perk, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium"
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Apply Button & Posted Date */}
        <div className="flex flex-col gap-4 lg:items-end">
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">Posted</span>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {job.posted_date ?  new Date(job.posted_date).toLocaleDateString() : 'Recently'}
            </div>
          </div>

          <Link href={`/careers/${job.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group/btn cursor-pointer"
            >
              Apply Now
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}