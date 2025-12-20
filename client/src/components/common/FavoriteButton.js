'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * FavoriteButton
 * - Toggles saved/unsaved (POST / DELETE)
 * - Shows inline toast messages instead of alerts
 * - Does not redirect by default (redirectToDashboard=false). If you want redirect, set prop to true.
 *
 * Props:
 *  - type: 'accommodation' | 'activity' | 'destination'
 *  - referenceId: numeric id
 *  - referenceSlug: optional slug string
 *  - redirectToDashboard: boolean (default false)
 *  - className: extra classes
 */
export default function FavoriteButton({
  type,
  referenceId,
  referenceSlug = null,
  redirectToDashboard = false,
  className = '',
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth() || {};
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  // Check whether this item is already favorited by the user
  useEffect(() => {
    let mounted = true;
    if (!user) {
      setSaved(false);
      return;
    }
    const check = async () => {
      try {
        // Use favorites list endpoint (limited) and check for existence.
        // listFavorites supports limit param (default 50). Request a reasonably sized page to include most recent.
        const res = await axios.get(`${API_BASE}/api/users/favorites`, {
          headers: getAuthHeaders(),
          params: { limit: 200 }, // adjust if necessary
        });
        if (!mounted) return;
        const favorites = res.data?.favorites || [];
        const exists = favorites.some(
          (f) =>
            f.favorite_type === type &&
            String(f.reference_id) === String(referenceId)
        );
        setSaved(Boolean(exists));
      } catch (err) {
        // Silent failure: just assume not saved
        console.warn('Could not check favorite status', err?.response || err);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [user, type, referenceId, API_BASE]);

  const onToggle = async (e) => {
    e && e.preventDefault();
    if (!user) {
      showToast('Please log in to save favorites', { type: 'error' });
      setTimeout(() => router.push('/'), 700);
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        // remove favorite
        await axios.delete(`${API_BASE}/api/users/favorites`, {
          headers: getAuthHeaders(),
          params: { favorite_type: type, reference_id: referenceId },
        });
        setSaved(false);
        showToast('Removed from favorites', { type: 'info' });
      } else {
        // add favorite
        await axios.post(
          `${API_BASE}/api/users/favorites`,
          {
            favorite_type: type,
            reference_id: referenceId,
            reference_slug: referenceSlug || null,
          },
          { headers: getAuthHeaders() }
        );
        setSaved(true);
        showToast('Saved to favorites', { type: 'success' });

        if (redirectToDashboard) {
          // small delay to allow toast to show
          const slug = (user.full_name || user.name || 'user').toString().toLowerCase().replace(/\s+/g, '-');
          setTimeout(() => router.push(`/dashboard/traveler/${slug}/favorites`), 700);
        }
      }
    } catch (err) {
      console.error('Favorite toggle failed', err?.response || err);
      showToast('Failed to update favorite', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full transition cursor-pointer ${className} ${
        saved ? 'bg-red-600 text-white' : 'bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200'
      }`}
      title={saved ? 'Remove from favorites' : 'Save to favorites'}
    >
      <span className={`p-2 ${saved ? '' : ''}`}>
        <Heart className={`w-4 h-4 ${saved ? 'text-white' : 'text-red-500'}`} />
      </span>
      <span className="pr-3 pl-1 text-sm">
        {loading ? '...' : saved ? 'Saved' : 'Favorite'}
      </span>
    </button>
  );
}