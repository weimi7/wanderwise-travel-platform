"use client";

export default function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group cursor-pointer"
      aria-label="Scroll to top"
    >
      <svg
        className="w-6 h-6 text-white transform group-hover:-translate-y-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
