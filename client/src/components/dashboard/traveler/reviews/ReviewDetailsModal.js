'use client';

import { useEffect, useState } from 'react';
import { X, Download, Clipboard, Star, Calendar, Globe, Lock, MessageSquare, User, ThumbsUp, ThumbsDown, Eye, Share2, ExternalLink, Award, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ReviewDetailsModal({ review, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyInput, setReplyInput] = useState('');
  const [postingReply, setPostingReply] = useState(false);
  const [voteState, setVoteState] = useState({ up_count: review.up_count || 0, down_count: review.down_count || 0, my_vote: review.my_vote || 0 });

  useEffect(() => {
    const onKey = (e) => { 
      if (e.key === 'Escape') onClose?.(); 
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!review || !review.review_id) return;
    // load replies and refresh vote counts
    fetchReplies();
    // sync vote counts from review object when opened
    setVoteState({ up_count: review.up_count || 0, down_count: review.down_count || 0, my_vote: review.my_vote || 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review?.review_id]);

  if (!review) return null;

  const statusConfig = {
    published: { 
      label: 'Published', 
      icon: Globe, 
      color: 'from-emerald-500 to-green-500', 
      bgColor: 'bg-black', 
      textColor: 'text-emerald-700 dark:text-emerald-400' 
    },
    pending: { 
      label: 'Pending', 
      icon: Calendar, 
      color: 'from-amber-500 to-orange-500', 
      bgColor: 'bg-black', 
      textColor: 'text-amber-700 dark:text-amber-400' 
    },
    draft: { 
      label: 'Draft', 
      icon: MessageSquare, 
      color: 'from-blue-500 to-cyan-500', 
      bgColor: 'bg-black', 
      textColor: 'text-blue-700 dark:text-blue-400' 
    },
    hidden: { 
      label: 'Hidden', 
      icon: Lock, 
      color: 'from-gray-500 to-gray-500', 
      bgColor: 'bg-black', 
      textColor: 'text-gray-700 dark:text-gray-400' 
    },
    rejected: { 
      label: 'Rejected', 
      icon: Shield, 
      color: 'from-rose-500 to-red-500', 
      bgColor: 'bg-black', 
      textColor: 'text-rose-700 dark:text-rose-400' 
    }
  };

  const getStatusConfig = (status) => statusConfig[status] || statusConfig.draft;
  const StatusIcon = getStatusConfig(review.status).icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'}`}
          />
        ))}
        <span className="ml-2 text-lg font-bold text-gray-800 dark:text-white">{(review.rating || 0)}.0</span>
        <span className="text-gray-500 dark:text-gray-400 ml-1">/ 5.0</span>
      </div>
    );
  };

  const downloadJson = () => {
    try {
      const dataStr = JSON.stringify(review, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review_${review.review_id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Review details downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download');
    }
  };

  const copyLink = async () => {
    try {
      const share = `${window.location.origin}/reviews/${review.review_id}`;
      await navigator.clipboard.writeText(share);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // Votes
  const handleVote = async (type) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('You must be logged in to vote');
      return;
    }
    try {
      const body = { vote: type };
      const res = await axios.post(`${API_BASE.replace(/\/$/, '')}/api/reviews/${review.review_id}/vote`, body, { headers: getAuthHeaders() });
      if (res.data && res.data.success) {
        setVoteState({ up_count: res.data.up_count, down_count: res.data.down_count, my_vote: res.data.my_vote });
      }
    } catch (err) {
      console.error('vote error', err);
      toast.error(err?.response?.data?.message || 'Failed to register vote');
    }
  };

  // Replies
  const fetchReplies = async () => {
    try {
      const res = await axios.get(`${API_BASE.replace(/\/$/, '')}/api/reviews/${review.review_id}/replies`);
      setReplies(res.data.replies || []);
    } catch (err) {
      // Gracefully handle missing endpoint (404) or other errors
      if (err?.response?.status === 404) {
        // endpoint not available on backend - treat as no replies
        setReplies([]);
        return;
      }
      console.error('fetch replies', err);
      setReplies([]);
    }
  };

  const submitReply = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Sign in to reply');
      return;
    }
    if (!replyInput.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    setPostingReply(true);
    try {
      const res = await axios.post(`${API_BASE.replace(/\/$/, '')}/api/reviews/${review.review_id}/replies`, { content: replyInput.trim() }, { headers: getAuthHeaders() });
      if (res.data && res.data.success) {
        setReplyInput('');
        fetchReplies();
        toast.success('Reply posted');
      }
    } catch (err) {
      console.error('post reply', err);
      toast.error(err?.response?.data?.message || 'Failed to post reply');
    } finally {
      setPostingReply(false);
    }
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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-auto z-10"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getStatusConfig(review.status).color} p-6 text-white`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      Review #{review.review_id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusConfig(review.status).bgColor} ${getStatusConfig(review.status).textColor}`}>
                      <StatusIcon className="w-3 h-3" />
                      {getStatusConfig(review.status).label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold line-clamp-1">
                    {review.title || 'Untitled Review'}
                  </h3>
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

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(review.created_at)}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVote(voteState.my_vote === 1 ? 'remove' : 'up')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md ${voteState.my_vote === 1 ? 'bg-emerald-600 text-white' : 'bg-white/20 text-white'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{voteState.up_count}</span>
                </button>
                <button
                  onClick={() => handleVote(voteState.my_vote === -1 ? 'remove' : 'down')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md ${voteState.my_vote === -1 ? 'bg-rose-600 text-white' : 'bg-white/20 text-white'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm">{voteState.down_count}</span>
                </button>
              </div>

              {review.context?.type && (
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                    {review.context.type}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 px-6">
              <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'overview' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'}`}>Overview</button>
              <button onClick={() => setActiveTab('details')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'details' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'}`}>Details</button>
              <button onClick={() => setActiveTab('context')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'context' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'}`}>Context</button>
              <button onClick={() => setActiveTab('replies')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'replies' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'}`}>Replies ({replies.length})</button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-4">Rating</h4>
                    <div className="flex items-center justify-between">
                      {renderStars(review.rating || 0)}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-800 dark:text-white">{review.rating || 0}.0</div>
                        <div className="text-sm text-amber-700 dark:text-amber-400">Overall Rating</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Review Content</h4>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {review.content || 'No review content available.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'replies' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    {replies.length === 0 ? (
                      <p className="text-sm text-gray-500">No replies yet. Be the first to reply.</p>
                    ) : (
                      replies.map((r) => (
                        <div key={r.reply_id} className="border-b border-gray-100 dark:border-gray-700 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium">{r.author_name || 'User'}</div>
                              <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                            </div>
                            <div className="text-sm text-gray-100 break-words">{r.content}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Review Information</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Review ID</p>
                          <p className="font-mono font-medium text-gray-800 dark:text-white">{review.review_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                          <p className="font-medium text-gray-800 dark:text-white capitalize">{review.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                          <p className="font-medium text-gray-800 dark:text-white">{formatDate(review.created_at)}</p>
                        </div>
                        {review.updated_at && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                            <p className="font-medium text-gray-800 dark:text-white">{formatDate(review.updated_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-5 rounded-2xl">
                      <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-3">Engagement</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Helpful Votes</span>
                          <span className="font-bold text-gray-800 dark:text-white">{voteState.up_count - voteState.down_count}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Up</span>
                          <span className="font-bold text-gray-800 dark:text-white">{voteState.up_count}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Down</span>
                          <span className="font-bold text-gray-800 dark:text-white">{voteState.down_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'context' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">Review Context</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reviewed Item</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {review.context?.name || review.context?.type || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Item Type</p>
                        <p className="font-medium text-gray-800 dark:text-white capitalize">
                          {review.booking_type || review.context?.type || 'General'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reference ID</p>
                        <p className="font-mono font-medium text-gray-800 dark:text-white">
                          {review.context?.reference_id || review.reference_id || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Booking Reference</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {review.booking_reference || review.context?.booking_id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Additional Information</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
                      <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {JSON.stringify(review.context || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Award className="w-4 h-4" />
                <span>Thank you for contributing to our community!</span>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadJson}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyLink}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${copied ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'}`}
                >
                  <Clipboard className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}