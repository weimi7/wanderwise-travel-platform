async function uploadAvatarToServer(file) {
  if (!file) return null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const fd = new FormData();
  fd.append("avatar", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/avatar`, {
    method: "POST",
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }
  const data = await res.json();
  return data.avatar_url; // save this to your user/profile
}