'use client';

import { useEffect, useState } from 'react';
import { X, Star, Save, Globe, Lock, AlertCircle, Sparkles, ThumbsUp, MessageSquare, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
function getAuthHeaders() { 
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
  return token ? { Authorization: `Bearer ${token}` } : {}; 
}

export default function EditReviewModal({ review, onClose, onSaved }) {
  const [title, setTitle] = useState(review.title || '');
  const [rating, setRating] = useState(review.rating || 5);
  const [content, setContent] = useState(review.content || '');
  const [saving, setSaving] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [tags, setTags] = useState(review.tags || []);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setTitle(review.title || '');
    setRating(review.rating || 5);
    setContent(review.content || '');
    setCharacterCount(review.content?.length || 0);
    setTags(review.tags || []);
  }, [review]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Please add review content');
      return;
    }
    if (content.trim().length < 20) {
      toast.error('Review content should be at least 20 characters');
      return;
    }

    setSaving(true);
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/reviews/${review.review_id}`;
      const payload = { 
        title: title.trim(), 
        rating, 
        content: content.trim(),
        tags
      };
      
      const res = await axios.put(url, payload, { headers: getAuthHeaders() });
      const updated = res.data.review || res.data.data?.review || { ...review, title, rating, content, tags };
      
      onSaved && onSaved(updated);
      toast.success('Review updated successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to save review', err);
      toast.error(err?.response?.data?.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  // Do not allow edit if published or rejected/hidden - Show readonly modal
  const nonEditableStatuses = new Set(['published', 'rejected', 'hidden']);
  if (nonEditableStatuses.has(String(review.status || '').toLowerCase())) {
    const status = String(review.status || '').toLowerCase();
    const titleText = status === 'published' ? 'Review Published' : status === 'rejected' ? 'Review Rejected' : 'Review Locked';
    const subtitle = status === 'published'
      ? 'Published reviews cannot be edited to maintain authenticity and trust within our community.'
      : status === 'rejected'
      ? 'This review has been rejected by moderators and cannot be edited. If you believe this was a mistake contact support.'
      : 'This review is locked and cannot be edited.';

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{titleText}</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{titleText}</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {subtitle}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Got It
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Edit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Edit Your Review</h3>
                  <p className="text-blue-100 text-sm mt-1">Update your feedback and rating</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>Your review is currently {review.status}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{review.helpful_count || (review.up_count - review.down_count) || 0} helpful votes</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Review Title
                </label>
                <div className="relative">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience..."
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  A good title helps others quickly understand your experience
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Star className="w-4 h-4" />
                  Rating
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-white">
                    {rating}.0 / 5.0
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Edit className="w-4 h-4" />
                  Review Content
                </label>
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setCharacterCount(e.target.value.length);
                    }}
                    rows={6}
                    placeholder="Share your detailed experience... What did you like? What could be improved?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
                    {characterCount} / 2000 characters
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Be specific and mention both positives and areas for improvement
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TagIcon className="w-4 h-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag (e.g., friendly staff, great location)"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || tags.length >= 5}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Add up to 5 tags to categorize your review (optional)
                </p>
              </div>

              {/* Guidelines */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Review Guidelines</h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                      <li>• Be honest and specific about your experience</li>
                      <li>• Focus on facts rather than emotions</li>
                      <li>• Mention both positives and areas for improvement</li>
                      <li>• Keep it respectful and constructive</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Lock className="w-4 h-4 inline mr-2" />
                Your review will be saved as a draft
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Custom Tag Icon component
function TagIcon(props) {
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
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}