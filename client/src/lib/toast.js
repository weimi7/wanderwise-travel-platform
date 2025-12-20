export function showToast(message, { duration = 3000, type = "info" } = {}) {
  if (typeof window === "undefined") return;
  const existing = document.getElementById("ww-toast");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.id = "ww-toast";
  el.textContent = message;
  Object.assign(el.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%) translateY(12px)",
    background:
      type === "error"
        ? "linear-gradient(90deg,#ef4444,#dc2626)"
        : type === "success"
        ? "linear-gradient(90deg,#10b981,#059669)"
        : "linear-gradient(90deg,#111827,#374151)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    zIndex: 99999,
    fontSize: "14px",
    boxShadow: "0 6px 18px rgba(2,6,23,0.2)",
    opacity: "0",
    transition: "opacity 200ms ease, transform 200ms ease",
    pointerEvents: "auto",
  });

  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(12px)";
    setTimeout(() => {
      el.remove();
    }, 250);
  }, duration);
}