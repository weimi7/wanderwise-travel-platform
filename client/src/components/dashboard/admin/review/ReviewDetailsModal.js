'use client';
import { 
  X, Star, User, Calendar, Hash, MessageSquare, 
  CheckCircle, XCircle, Clock, AlertCircle, Copy, 
  TrendingUp, FileText, Globe, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ReviewDetailsModal({ review, onClose, onPublish, onReject }) {
  const [copied, setCopied] = useState(false);

  if (!review) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock, label: 'Pending Review' };
      case 'published':
        return { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle, label: 'Published' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle, label: 'Rejected' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', icon: AlertCircle, label: status };
    }
  };

  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'destination':
        return { icon: Globe, color: 'text-purple-500', label: 'Destination Review', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50' };
      case 'activity':
        return { icon: TrendingUp, color: 'text-blue-500', label: 'Activity Review', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50' };
      case 'accommodation':
        return { icon: Hash, color: 'text-green-500', label: 'Accommodation Review', badge: 'bg-green-100 text-green-800 dark:bg-green-900/50' };
      default:
        return { icon: FileText, color: 'text-gray-500', label: 'Review', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700' };
    }
  };

  const statusConfig = getStatusConfig(review.status);
  const typeConfig = getTypeConfig(review.reviewable_type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const dateInfo = formatDate(review.created_at);

  const copyReviewId = async () => {
    try {
      await navigator.clipboard.writeText(review.review_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ID:', err);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="mt-15 relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Review #{review.review_id}
                    </h2>
                    <button
                      onClick={copyReviewId}
                      className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Copy Review ID"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submitted on {dateInfo.date} at {dateInfo.time}
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Review Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Review Content Card */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Review Content
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {review.rating}/5
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        Overall Rating
                      </span>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</h4>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {review.title}
                        </p>
                      </div>
                    )}

                    {/* Body */}
                    {review.body && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Review</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {review.body}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Card */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Review Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Review Type</p>
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                        <span className="font-medium text-gray-800 dark:text-white capitalize">
                          {review.reviewable_type}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Item ID</p>
                      <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-800 dark:text-white font-mono">
                          {review.reviewable_id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Actions & Status */}
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                    Review Status
                  </h3>
                  
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${statusConfig.bg} mb-4`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                    <span className={`font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {review.status === 'pending' && 'This review is awaiting moderation.'}
                    {review.status === 'published' && 'This review has been published and is visible to users.'}
                    {review.status === 'rejected' && 'This review has been rejected and is not visible to users.'}
                  </div>
                </div>

                {/* Author Card */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" />
                    Author Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Author</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {review.author_name || 'Anonymous User'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submitted</p>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        {dateInfo.date} at {dateInfo.time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Moderation Actions</h3>
                  
                  <div className="space-y-3">
                    {onPublish && review.status !== 'published' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onPublish}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg cursor-pointer"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        Approve & Publish
                      </motion.button>
                    )}

                    {onReject && review.status !== 'rejected' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onReject}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg cursor-pointer"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        Reject Review
                      </motion.button>
                    )}

                    <button
                      onClick={onClose}
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      Close Details
                    </button>
                  </div>

                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-center text-sm text-green-600 cursor-pointer"
                    >
                      Review ID copied to clipboard!
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Review ID: <span className="font-mono text-gray-700 dark:text-gray-300">{review.review_id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className={`px-2 py-1 rounded-full text-xs ${typeConfig.badge}`}>
                {typeConfig.label}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}