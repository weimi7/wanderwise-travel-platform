'use client';
import { X, Copy, User, Calendar, FileText, Hash, Layers, AlertCircle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function AuditDetailsModal({ log, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const formattedDetails = log.details ? JSON.stringify(log.details, null, 2) : '';

  const getActionConfig = (action) => {
    switch (action) {
      case 'publish':
      case 'bulk_publish':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-100 dark:bg-green-900/30',
          label: 'Published',
          badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
        };
      case 'reject':
      case 'bulk_reject':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-100 dark:bg-red-900/30',
          label: 'Rejected',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-blue-500',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          label: action?.replace('_', ' '),
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
        };
    }
  };

  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'destination':
        return {
          icon: Layers,
          color: 'text-purple-500',
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          label: 'Destination'
        };
      case 'activity':
        return {
          icon: FileText,
          color: 'text-blue-500',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          label: 'Activity'
        };
      case 'accommodation':
        return {
          icon: Hash,
          color: 'text-green-500',
          bg: 'bg-green-100 dark:bg-green-900/30',
          label: 'Accommodation'
        };
      default:
        return {
          icon: Layers,
          color: 'text-gray-500',
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          label: type || 'Unknown'
        };
    }
  };

  const actionConfig = getActionConfig(log.action);
  const typeConfig = getTypeConfig(log.reviewable_type);
  const ActionIcon = actionConfig.icon;
  const TypeIcon = typeConfig.icon;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const dateInfo = formatDate(log.created_at);

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
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${actionConfig.bg} rounded-xl`}>
                  <ActionIcon className={`w-6 h-6 ${actionConfig.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Audit #{log.audit_id}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Detailed view of administrative action
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Action Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 ${actionConfig.bg} rounded-lg`}>
                    <ActionIcon className={`w-5 h-5 ${actionConfig.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Action</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${actionConfig.badge}`}>
                  {actionConfig.label}
                </span>
              </motion.div>

              {/* Actor Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <User className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Actor</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {log.actor_name || 'System'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {log.actor_name ? 'Administrator' : 'Automated System'}
                </p>
              </motion.div>

              {/* Type Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 ${typeConfig.bg} rounded-lg`}>
                    <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Resource Type</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300">
                  {typeConfig.label}
                </span>
              </motion.div>
            </div>

            {/* Review IDs Section */}
            {Array.isArray(log.review_ids) && log.review_ids.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-400" />
                  Review IDs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {log.review_ids.map((id, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-700"
                    >
                      #{id}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  {log.review_ids.length} item{log.review_ids.length !== 1 ? 's' : ''} affected
                </p>
              </motion.div>
            )}

            {/* Timestamp Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                Timestamp
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                  <p className="text-gray-800 dark:text-white font-medium">{dateInfo.date}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time (UTC)</p>
                  <p className="text-gray-800 dark:text-white font-medium">{dateInfo.time}</p>
                </div>
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Action Details
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy JSON'}
                </motion.button>
              </div>
              
              <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                {formattedDetails ? (
                  <pre className="p-4 text-sm text-gray-300 overflow-auto max-h-64">
                    {formattedDetails}
                  </pre>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">No additional details available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Audit ID: <span className="font-mono text-gray-700 dark:text-gray-300">{log.audit_id}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}