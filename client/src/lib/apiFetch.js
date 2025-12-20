export async function apiFetch(url, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // clear token and redirect to login
    try { localStorage.removeItem("token"); } catch(e) {}
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login?returnTo=${returnTo}`;
    throw new Error("Session expired");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}