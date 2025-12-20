import axios from 'axios';

// Default to backend dev server if NEXT_PUBLIC_API_BASE_URL is not set
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function authHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function savePreset(name, payload, is_public = false) {
  const res = await axios.post(`${API_BASE}/api/planner/presets`, { name, payload, is_public }, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
  return res.data;
}

export async function listPresets() {
  const res = await axios.get(`${API_BASE}/api/planner/presets`, { headers: authHeaders() });
  return res.data;
}

export async function getPreset(id) {
  const res = await axios.get(`${API_BASE}/api/planner/presets/${id}`, { headers: authHeaders() });
  return res.data;
}

export async function deletePreset(id) {
  const res = await axios.delete(`${API_BASE}/api/planner/presets/${id}`, { headers: authHeaders() });
  return res.data;
}

export async function createShare(presetId, opts = {}) {
  const res = await axios.post(`${API_BASE}/api/planner/presets/${presetId}/share`, opts, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
  return res.data;
}

export async function fetchSharedPreset(token) {
  const res = await axios.get(`${API_BASE}/share/${token}`);
  return res.data;
}

export async function downloadPdf(presetId) {
  const url = `${API_BASE}/api/planner/${presetId}/pdf`;
  const res = await axios.post(url, {}, {
    headers: { ...authHeaders() },
    responseType: 'blob',
    timeout: 120000
  });
  return res.data; // Blob
}