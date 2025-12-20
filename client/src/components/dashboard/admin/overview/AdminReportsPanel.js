'use client';

import { useState } from 'react';
import axios from 'axios';
import { Download, FileText, DollarSign, Users } from 'lucide-react';

// Small toast helper
function showToast(message, duration = 3000) {
  if (typeof window === 'undefined') return;
  const existing = document.getElementById('ww-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'ww-toast';
  el.innerText = message;
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.85)',
    color: 'white',
    padding: '10px 14px',
    borderRadius: '8px',
    zIndex: 99999,
    fontSize: '14px',
    opacity: '0',
    transition: 'opacity 200ms ease, transform 200ms ease',
    pointerEvents: 'none',
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => el.remove(), 250);
  }, duration);
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminReportsPanel({ apiBase = '' }) {
  const [loading, setLoading] = useState(false);
  const base = apiBase || (process.env.NEXT_PUBLIC_API_BASE_URL || '') || 'http://localhost:5000';

  const download = async (path, params = {}, filenameHint = 'report.csv') => {
    setLoading(true);
    try {
      const url = `${base.replace(/\/$/, '')}${path}`;
      const res = await axios.get(url, {
        headers: getAuthHeaders(),
        responseType: 'blob',
        params,
      });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filenameHint;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      showToast('Download started');
    } catch (err) {
      console.error('Report download failed', err?.response || err);
      showToast('Failed to download report. Check permissions and backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Export Reports</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          disabled={loading}
          onClick={() => download('/api/admin/reports/users', {}, `users_${Date.now()}.csv`)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 transition cursor-pointer"
        >
          <Users className="w-4 h-4" /> Users (non-admin)
        </button>

        <button
          disabled={loading}
          onClick={() => download('/api/admin/reports/bookings', {}, `bookings_${Date.now()}.csv`)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-95 transition cursor-pointer"
        >
          <FileText className="w-4 h-4" /> Bookings
        </button>

        <button
          disabled={loading}
          onClick={() => download('/api/admin/reports/revenue', {}, `revenue_${Date.now()}.csv`)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-95 transition cursor-pointer"
        >
          <DollarSign className="w-4 h-4" /> Revenue Summary
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
        Tip: use query parameters (status, date_from, date_to) on the bookings endpoint to restrict export.
      </p>
    </div>
  );
}