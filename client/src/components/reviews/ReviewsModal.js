'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  X, Star, MessageCircle, User, Calendar,
  Loader2, AlertCircle, CheckCircle,
  ThumbsUp as ThumbsUpIcon, ThumbsDown as ThumbsDownIcon,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const collectionForType = (type) => {
  if (!type) return null;
  const t = type.toLowerCase();
  const map = {
    destination: 'destinations',
    activity: 'activities',
    accommodation: 'accommodations'
  };
  return map[t] || `${t}s`;
};

export default function ReviewsModal({ reviewableType, reviewableId, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('reviews');
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 } });

  // maps: reviewId -> { up_count, down_count, my_vote }
  const [votesMap, setVotesMap] = useState({});
  // maps: reviewId -> replies array
  const [repliesMap, setRepliesMap] = useState({});
  // toggles: which review id's replies UI are open
  const [openRepliesFor, setOpenRepliesFor] = useState(null);
  // posting reply state per reviewId
  const [postingReplyFor, setPostingReplyFor] = useState({});
  // reply input per reviewId
  const [replyInputFor, setReplyInputFor] = useState({});

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const buildUrl = useCallback((path) => {
    return API_BASE ? `${API_BASE.replace(/\/$/, '')}${path}` : path;
  }, [API_BASE]);

  const calculateStats = (reviewsList) => {
    if (!Array.isArray(reviewsList) || reviewsList.length === 0) {
      return { average: 0, total: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 } };
    }
    const total = reviewsList.length;
    const average = reviewsList.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total;
    const distribution = { 5:0,4:0,3:0,2:0,1:0 };
    reviewsList.forEach(r => {
      const rr = Number(r.rating);
      if (rr >= 1 && rr <= 5) distribution[rr] = (distribution[rr] || 0) + 1;
    });
    return { average: Number(average.toFixed(1)), total, distribution };
  };

  const fetchRepliesFor = async (reviewId) => {
    try {
      const res = await axios.get(buildUrl(`/api/reviews/${reviewId}/replies`));
      const list = res?.data?.replies || [];
      setRepliesMap(prev => ({ ...prev, [reviewId]: list }));
      return list;
    } catch (err) {
      console.error('fetchReplies error', err?.response?.data || err);
      // set to empty so we don't keep retrying on open
      setRepliesMap(prev => ({ ...prev, [reviewId]: [] }));
      return [];
    }
  };

  const fetchReviews = useCallback(async () => {
    if (!reviewableType || !reviewableId) {
      setReviews([]); setLoading(false); return;
    }
    setLoading(true);
    setError('');
    try {
      const collection = collectionForType(reviewableType);
      if (!collection) throw new Error('Invalid reviewable type');
      const url = buildUrl(`/api/${collection}/${reviewableId}/reviews`);
      const res = await axios.get(url);

      // Accept multiple shapes
      const data = res?.data;
      let reviewsList = [];
      if (Array.isArray(data)) reviewsList = data;
      else if (data && Array.isArray(data.reviews)) reviewsList = data.reviews;
      else {
        const possible = Object.values(data || {}).find(v => Array.isArray(v));
        reviewsList = Array.isArray(possible) ? possible : [];
      }

      // build votesMap from returned reviews if included (backend attaches up_count/down_count/my_vote)
      const initialVotes = {};
      reviewsList.forEach(r => {
        initialVotes[r.review_id] = {
          up_count: Number(r.up_count ?? r.up_count ?? 0),
          down_count: Number(r.down_count ?? r.down_count ?? 0),
          my_vote: Number(r.my_vote ?? 0)
        };
      });

      setReviews(reviewsList);
      setVotesMap(initialVotes);
      setStats(calculateStats(reviewsList));
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      if (err.response && err.response.status === 404) {
        setError('Reviews endpoint not found (404). Ensure backend routes are registered.');
        setReviews([]);
      } else {
        setError('Failed to fetch reviews. See console for details.');
      }
    } finally {
      setLoading(false);
    }
  }, [reviewableType, reviewableId, buildUrl]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    if (!rating || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5.'); return;
    }
    if (!body.trim() && !title.trim()) {
      setError('Please provide a review or title.'); return;
    }
    setPosting(true);
    try {
      const collection = collectionForType(reviewableType);
      if (!collection) throw new Error('Invalid reviewable type');
      const url = buildUrl(`/api/${collection}/${reviewableId}/reviews`);
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      await axios.post(url, { rating, title, body }, { headers });

      setSuccessMsg('Thanks — your review has been submitted and is pending approval.');
      setTitle(''); setBody(''); setRating(5);

      // refresh
      setTimeout(() => { fetchReviews(); setActiveTab('reviews'); }, 800);
    } catch (err) {
      console.error('post review failed', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to post review. Please login and try again.';
      setError(msg);
    } finally { setPosting(false); }
  };

  const voteForReview = async (reviewId, action) => {
    // action: 'up' | 'down'
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('You must be logged in to vote'); return;
    }

    // read current from state (most recent)
    const current = votesMap[reviewId] || { up_count: 0, down_count: 0, my_vote: 0 };
    // determine server action
    let serverAction = action;
    if (action === 'up' && current.my_vote === 1) serverAction = 'remove';
    if (action === 'down' && current.my_vote === -1) serverAction = 'remove';

    // optimistic update based on serverAction
    setVotesMap(prev => {
      const cur = prev[reviewId] || { up_count: 0, down_count: 0, my_vote: 0 };
      let up = cur.up_count, down = cur.down_count, my = cur.my_vote;
      if (serverAction === 'remove') {
        if (my === 1) up = Math.max(0, up - 1);
        if (my === -1) down = Math.max(0, down - 1);
        my = 0;
      } else if (serverAction === 'up') {
        if (my === -1) { down = Math.max(0, down - 1); }
        if (my !== 1) up = up + 1;
        my = 1;
      } else if (serverAction === 'down') {
        if (my === 1) { up = Math.max(0, up - 1); }
        if (my !== -1) down = down + 1;
        my = -1;
      }
      return { ...prev, [reviewId]: { up_count: up, down_count: down, my_vote: my } };
    });

    try {
      const res = await axios.post(buildUrl(`/api/reviews/${reviewId}/vote`), { vote: serverAction }, { headers: getAuthHeaders() });
      if (res.data && res.data.success) {
        setVotesMap(prev => ({ ...prev, [reviewId]: { up_count: Number(res.data.up_count || 0), down_count: Number(res.data.down_count || 0), my_vote: Number(res.data.my_vote || 0) } }));
      } else {
        // fallback: refetch to reconcile
        fetchReviews();
      }
    } catch (err) {
      console.error('vote error', err);
      if (err.response && err.response.status === 404) {
        toast.error('Vote endpoint not found on server (404). Backend may not be configured.');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to register vote');
      }
      // revert by refetching
      fetchReviews();
    }
  };

  const toggleReplies = async (reviewId) => {
    if (openRepliesFor === reviewId) {
      setOpenRepliesFor(null);
      return;
    }
    setOpenRepliesFor(reviewId);
    // load replies if not loaded
    if (!repliesMap[reviewId]) {
      await fetchRepliesFor(reviewId);
    }
  };

  const submitReply = async (reviewId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { toast.error('Sign in to reply'); return; }
    const content = (replyInputFor[reviewId] || '').trim();
    if (!content) { toast.error('Please enter a reply'); return; }

    setPostingReplyFor(prev => ({ ...prev, [reviewId]: true }));
    try {
      const res = await axios.post(buildUrl(`/api/reviews/${reviewId}/replies`), { content }, { headers: getAuthHeaders() });
      if (res.data && res.data.success) {
        // refresh replies
        await fetchRepliesFor(reviewId);
        setReplyInputFor(prev => ({ ...prev, [reviewId]: '' }));
        toast.success('Reply posted');
      } else {
        toast.error('Failed to post reply');
      }
    } catch (err) {
      console.error('post reply', err);
      const msg = err?.response?.data?.message || 'Failed to post reply';
      toast.error(msg);
    } finally {
      setPostingReplyFor(prev => ({ ...prev, [reviewId]: false }));
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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{String(reviewableType || 'Item').replace(/^\w/, c => c.toUpperCase())} Reviews</h2>
                  <p className="text-blue-100 text-sm">Share your experience and read what others think</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Stats bar */}
            {!loading && stats.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-4"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.average}</div>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(stats.average) ? 'text-yellow-400' : 'text-white/40'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/30" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-blue-100">Total Reviews</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 text-sm font-medium transition-all cursor-pointer ${activeTab === 'reviews' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Reviews ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`flex-1 py-3 text-sm font-medium transition-all cursor-pointer ${activeTab === 'write' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Write Review
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Loading state */}
                  {loading ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading reviews...</p>
                    </div>
                  ) : (
                    <>
                      {/* Error state */}
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/30">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                          </div>
                        </motion.div>
                      )}

                      {/* Success message */}
                      {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800/30">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            {successMsg}
                          </div>
                        </motion.div>
                      )}

                      {/* Reviews list */}
                      {reviews.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No reviews yet</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to share your experience!</p>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('write')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                            Write First Review
                          </motion.button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((review, index) => {
                            const v = votesMap[review.review_id] || { up_count: 0, down_count: 0, my_vote: 0 };
                            return (
                              <motion.div
                                key={review.review_id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.06 }}
                                className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800 dark:text-white">{review.author_name || 'Anonymous'}</span>
                                        {review.verified && <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</span>}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                          <div className="flex items-center">
                                            <Star className="w-4 h-4 text-amber-400" />
                                            <span className="ml-1">{review.rating || 0}.0</span>
                                          </div>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(review.created_at).toLocaleDateString()}</div>
                                      </div>
                                    </div>

                                    {review.title && <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{review.title}</h4>}
                                    {review.body && <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{review.body}</p>}

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={() => voteForReview(review.review_id, 'up')}
                                          className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer ${v.my_vote === 1 ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                        >
                                          <ThumbsUpIcon className="w-4 h-4" />
                                          <span className="text-sm">{v.up_count}</span>
                                        </button>

                                        <button
                                          onClick={() => voteForReview(review.review_id, 'down')}
                                          className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer ${v.my_vote === -1 ? 'bg-rose-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                        >
                                          <ThumbsDownIcon className="w-4 h-4" />
                                          <span className="text-sm">{v.down_count}</span>
                                        </button>

                                        <button
                                          onClick={() => toggleReplies(review.review_id)}
                                          className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
                                        >
                                          <MessageSquare className="w-4 h-4" />
                                          <span className="text-sm">{(repliesMap[review.review_id] || []).length}</span>
                                        </button>
                                      </div>

                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {review.context?.type || ''}
                                      </div>
                                    </div>

                                    {/* Replies area */}
                                    {openRepliesFor === review.review_id && (
                                      <div className="mt-4 space-y-3">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                          {(repliesMap[review.review_id] || []).length === 0 ? (
                                            <p className="text-sm text-gray-500">No replies yet.</p>
                                          ) : (
                                            (repliesMap[review.review_id] || []).map(r => (
                                              <div key={r.reply_id} className="mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                                                <div className="flex items-center justify-between">
                                                  <div className="text-sm font-medium">{r.author_name || 'User'}</div>
                                                  <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
                                                </div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{r.content}</div>
                                              </div>
                                            ))
                                          )}
                                        </div>

                                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                          <textarea
                                            value={replyInputFor[review.review_id] || ''}
                                            onChange={(e) => setReplyInputFor(prev => ({ ...prev, [review.review_id]: e.target.value }))}
                                            placeholder="Write a reply..."
                                            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 resize-none"
                                            rows={3}
                                          />
                                          <div className="flex items-center justify-end gap-2 mt-2">
                                            <button onClick={() => setReplyInputFor(prev => ({ ...prev, [review.review_id]: '' }))} className="px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                                            <button onClick={() => submitReply(review.review_id)} disabled={postingReplyFor[review.review_id]} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
                                              {postingReplyFor[review.review_id] ? 'Posting...' : 'Post Reply'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'write' && (
                <motion.div key="write" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title (optional)</label>
                      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                      <div className="flex items-center gap-2 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setRating(s)} className={`p-2 rounded-md ${s <= rating ? 'bg-amber-400 text-white' : 'bg-gray-100 dark:bg-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'} transition-colors cursor-pointer`}>
                            <Star className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Review</label>
                      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Share your detailed experience..." className="w-full mt-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => { setTitle(''); setBody(''); setRating(5); }} className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Reset</button>
                      <button type="submit" disabled={posting} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-colors">
                        {posting ? 'Posting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">All reviews are moderated. Reviews will appear after approval.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}