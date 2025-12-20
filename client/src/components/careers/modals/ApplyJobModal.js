'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, FileText, User, Mail, Phone, MapPin,
  Briefcase, Github, Linkedin, Globe, CheckCircle,
  AlertCircle, Loader2, Trash2, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import ApplicationSuccess from './ApplicationSuccess';

export default function ApplyJobModal({ isOpen, onClose, job }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    location: '',
    
    // Professional Info
    currentRole: '',
    experience: '',
    expectedSalary: '',
    noticePeriod: '',
    
    // Links
    portfolio: '',
    linkedin: '',
    github: '',
    website: '',
    
    // Additional
    coverLetter: '',
    howDidYouHear: '',
    
    // Files
    resume: null,
    resumeName: '',
    resumeSize: 0
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ... prev, [name]: '' }));
    }
  };

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd. openxmlformats-officedocument.wordprocessingml. document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 8MB)
    const maxSize = 8 * 1024 * 1024; // 8MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 8MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      resume: file,
      resumeName:  file.name,
      resumeSize: file.size
    }));
    toast.success('Resume uploaded successfully! ');
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      resume: null,
      resumeName: '',
      resumeSize: 0
    }));
    if (fileInputRef.current) {
      fileInputRef.current. value = '';
    }
  };

  // Validation
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName. trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData. email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData. location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.currentRole.trim()) {
      newErrors.currentRole = 'Current role is required';
    }
    
    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    }
    
    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (formData.coverLetter.trim().length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      currentRole: '',
      experience: '',
      expectedSalary: '',
      noticePeriod:  '',
      portfolio: '',
      linkedin: '',
      github: '',
      website: '',
      coverLetter: '',
      howDidYouHear: '',
      resume: null,
      resumeName: '',
      resumeSize:  0
    });
    setStep(1);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current. value = '';
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append form fields with correct backend naming
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('location', formData.location);
      submitData.append('currentRole', formData. currentRole);
      submitData.append('experience', formData.experience);
      submitData.append('expectedSalary', formData. expectedSalary || '');
      submitData.append('noticePeriod', formData.noticePeriod || '');
      submitData.append('portfolio', formData.portfolio || '');
      submitData.append('linkedin', formData.linkedin || '');
      submitData.append('github', formData.github || '');
      submitData.append('website', formData.website || '');
      submitData.append('coverLetter', formData. coverLetter);
      submitData.append('howDidYouHear', formData.howDidYouHear || '');
      
      // Append resume file
      if (formData.resume) {
        submitData.append('resume', formData.resume);
      }
      
      // Add job details
      submitData.append('jobId', job.id);
      submitData.append('jobTitle', job.title);
      submitData.append('jobDepartment', job.department || 'General');

      // API call
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/careers/apply`, {
        method: 'POST',
        body:  submitData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Get application ID from response
        const appId = result.applicationId || result.data?. applicationId || 
                     'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        setApplicationId(appId);
        
        // Close apply modal
        onClose();
        
        // Reset form
        resetForm();
        
        // Show success modal after short delay
        setTimeout(() => {
          setShowSuccess(true);
        }, 300);
        
        toast.success('Application submitted successfully! ');
      } else {
        toast.error(result.message || 'Failed to submit application');
        console.error('Application error:', result);
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen || !job) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity:  1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale:  1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden my-8"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="pr-12">
                    <h2 className="text-2xl font-bold mb-2">Apply for {job.title}</h2>
                    <p className="text-blue-100">{job.department || 'Position'} · {job.location || 'Remote'}</p>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center gap-2 mt-6">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex-1">
                        <div className={`h-2 rounded-full transition-all ${
                          step >= s ? 'bg-white' : 'bg-white/30'
                        }`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-blue-100">
                    <span className={step === 1 ? 'text-white font-semibold' : ''}>Personal Info</span>
                    <span className={step === 2 ?  'text-white font-semibold' : ''}>Professional</span>
                    <span className={step === 3 ? 'text-white font-semibold' : ''}>Final Details</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x:  -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Personal Information
                      </h3>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData. fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                              errors.fullName ?  'border-red-500' : 'border-gray-200 dark:border-gray-600'
                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white`}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example. com"
                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                              errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                            } rounded-xl focus: ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white`}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone & Location */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData. phone}
                              onChange={handleChange}
                              placeholder="+94 77 123 4567"
                              className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                                errors. phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                              } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white`}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location *
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="Colombo, Sri Lanka"
                              className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                                errors.location ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                              } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white`}
                            />
                          </div>
                          {errors.location && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Professional Information */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Professional Information
                      </h3>

                      {/* Current Role */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Role *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="currentRole"
                            value={formData.currentRole}
                            onChange={handleChange}
                            placeholder="Senior Developer"
                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                              errors.currentRole ? 'border-red-500' :  'border-gray-200 dark:border-gray-600'
                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white`}
                          />
                        </div>
                        {errors.currentRole && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.currentRole}
                          </p>
                        )}
                      </div>

                      {/* Experience & Salary */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Years of Experience *
                          </label>
                          <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                              errors.experience ? 'border-red-500' :  'border-gray-200 dark:border-gray-600'
                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white`}
                          >
                            <option value="">Select experience</option>
                            <option value="0-1">0-1 years</option>
                            <option value="1-3">1-3 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-7">5-7 years</option>
                            <option value="7-10">7-10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                          {errors. experience && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.experience}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Expected Salary (Optional)
                          </label>
                          <input
                            type="text"
                            name="expectedSalary"
                            value={formData.expectedSalary}
                            onChange={handleChange}
                            placeholder="LKR 200,000 - 300,000"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Notice Period */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notice Period (Optional)
                        </label>
                        <select
                          name="noticePeriod"
                          value={formData.noticePeriod}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                        >
                          <option value="">Select notice period</option>
                          <option value="immediate">Immediate</option>
                          <option value="2-weeks">2 weeks</option>
                          <option value="1-month">1 month</option>
                          <option value="2-months">2 months</option>
                          <option value="3-months">3 months</option>
                        </select>
                      </div>

                      {/* Resume Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Resume/CV *
                        </label>
                        
                        {! formData.resume ?  (
                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed ${
                              dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                              errors.resume ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,. doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              PDF, DOC, DOCX (max 8MB)
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{formData.resumeName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(formData.resumeSize)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {errors.resume && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.resume}
                          </p>
                        )}
                      </div>

                      {/* Links */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Professional Links (Optional)</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              LinkedIn
                            </label>
                            <div className="relative">
                              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="url"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              GitHub
                            </label>
                            <div className="relative">
                              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="url"
                                name="github"
                                value={formData. github}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Portfolio
                            </label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="url"
                                name="portfolio"
                                value={formData.portfolio}
                                onChange={handleChange}
                                placeholder="https://myportfolio.com"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Website
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="url"
                                name="website"
                                value={formData. website}
                                onChange={handleChange}
                                placeholder="https://mywebsite.com"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Final Details */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Final Details
                      </h3>

                      {/* Cover Letter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cover Letter *
                        </label>
                        <textarea
                          name="coverLetter"
                          value={formData.coverLetter}
                          onChange={handleChange}
                          rows={8}
                          placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                            errors.coverLetter ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white resize-none`}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-sm ${
                            formData.coverLetter.length < 100 ? 'text-gray-500' : 'text-green-500'
                          }`}>
                            {formData.coverLetter.length} / 100 characters minimum
                          </p>
                        </div>
                        {errors.coverLetter && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.coverLetter}
                          </p>
                        )}
                      </div>

                      {/* How did you hear about us */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          How did you hear about this position?  (Optional)
                        </label>
                        <select
                          name="howDidYouHear"
                          value={formData.howDidYouHear}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                        >
                          <option value="">Select an option</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="indeed">Indeed</option>
                          <option value="company-website">Company Website</option>
                          <option value="referral">Referral</option>
                          <option value="social-media">Social Media</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-4">Application Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-400">Position:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-200">{job.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-400">Department:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-200">{job.department || 'General'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-400">Name:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-200">{formData.fullName || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-400">Email:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-200 text-right break-all">{formData.email || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-400">Experience:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-200">{formData.experience || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-400">Resume:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-200">{formData.resumeName || 'Not uploaded'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between gap-4">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                    )}

                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        Next Step
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Submit Application
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <ApplicationSuccess 
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        jobTitle={job?. title || 'Position'}
        applicationId={applicationId}
      />
    </>
  );
}