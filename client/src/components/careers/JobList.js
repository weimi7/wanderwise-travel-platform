'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import { departments, jobTypes } from './data/jobsData';

export default function JobList() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE}/api/careers/jobs? status=active`);
        const data = await response.json();
        
        if (data.success) {
          setJobs(data. jobs || []);
        } else {
          setError('Failed to load jobs');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs.  Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesDept = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesDept && matchesType && matchesSearch;
  });

  const displayedJobs = showAllJobs ? filteredJobs : filteredJobs.slice(0, 4);

  return (
    <section id="open-positions" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Team
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {loading ? 'Loading.. .' : `${filteredJobs.length} exciting position${filteredJobs.length !== 1 ? 's' :  ''} waiting for you`}
          </p>
        </motion.div>

        {/* Filters */}
        {! loading && ! error && (
          <JobFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading job opportunities...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400 text-xl mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Job Cards */}
        {! loading && !error && (
          <div className="space-y-6">
            {displayedJobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}

            {/* No Results */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-16">
                <Briefcase className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">
                  No positions found matching your criteria. 
                </p>
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSelectedType('all');
                    setSearchTerm('');
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Show More Button */}
            {! showAllJobs && filteredJobs.length > 4 && (
              <div className="text-center pt-8">
                <button
                  onClick={() => setShowAllJobs(true)}
                  className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:shadow-xl transition-all flex items-center gap-3 mx-auto cursor-pointer"
                >
                  View All {filteredJobs.length} Positions
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}