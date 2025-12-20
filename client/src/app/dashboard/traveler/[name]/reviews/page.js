'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Star, MessageSquare, ThumbsUp, BarChart3, Search, Filter } from 'lucide-react';
import ReviewsList from '@/components/dashboard/traveler/reviews/ReviewsList';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function DashboardReviewsPage() {
  const { name } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth() || {};

  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    draft: 0,
    hidden: 0,
    averageRating: 0,
    helpfulVotes: 0,
  });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // Request up to 100 reviews for summary calculations
      const res = await axios.get(`${API_BASE.replace(/\/$/, '')}/api/reviews/mine?page=1&limit=100`, {
        headers: getAuthHeaders(),
      });
      const data = res.data || {};
      const list = Array.isArray(data.reviews) ? data.reviews : data.data?.reviews || [];
      const total = list.length;
      const published = list.filter((r) => r.status === 'published').length;
      const pending = list.filter((r) => r.status === 'pending').length;
      const draft = list.filter((r) => r.status === 'draft').length;
      const hidden = list.filter((r) => r.status === 'hidden').length;
      const ratings = list.map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
      const averageRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

      // helpfulVotes: sum of helpful_count if backend provided it
      const helpfulVotes = list.reduce((acc, r) => acc + (Number(r.helpful_count) || 0), 0);

      setStats({
        total,
        published,
        pending,
        draft,
        hidden,
        averageRating,
        helpfulVotes,
      });
    } catch (err) {
      console.error('Failed to fetch my reviews (summary)', err?.response?.data ?? err);
      // If unauthorized, redirect to login
      const status = err?.response?.status;
      if (status === 401) {
        showToast('Please login to view your reviews', { type: 'error' });
        setTimeout(() => router.push('/auth/login'), 700);
      } else {
        showToast(err?.response?.data?.message || 'Failed to load review stats', { type: 'error' });
      }
      setStats((s) => ({ ...s, total: 0 }));
    } finally {
      setLoadingStats(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) {
      // if not authenticated, send to login
      router.push('/auth/login');
      return;
    }
    if (user) fetchStats();
  }, [user, authLoading, fetchStats, router]);

  const filters = [
    { id: 'all', label: 'All Reviews', count: stats.total },
    { id: 'published', label: 'Published', count: stats.published },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'draft', label: 'Drafts', count: stats.draft },
    { id: 'hidden', label: 'Hidden', count: stats.hidden },
  ];

  const statsCards = [
    {
      label: 'Total Reviews',
      value: loadingStats ? '…' : String(stats.total),
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Average Rating',
      value: loadingStats ? '…' : (stats.averageRating ? stats.averageRating.toFixed(1) : '—'),
      icon: Star,
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Helpful Votes',
      value: loadingStats ? '…' : String(stats.helpfulVotes || 0),
      icon: ThumbsUp,
      color: 'from-emerald-500 to-green-500',
    },
    {
      label: 'Reviewed Items',
      value: loadingStats ? '…' : String(new Set([]).size), // placeholder; could compute distinct reviewable targets if needed
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-blue-600 dark:from-white dark:to-blue-300">
                  My Reviews
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                Manage your submitted reviews. Published reviews are visible to others and cannot be edited.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/reviews/new')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Write New Review
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{s.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${s.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Reviews list (component fetches and paginates user's reviews itself) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
          <ReviewsList />
        </motion.div>
      </div>
    </main>
  );
}