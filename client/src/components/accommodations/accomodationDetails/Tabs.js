"use client";

import { motion } from "framer-motion";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "booking", label: "Booking", icon: "📅" },
  ];

  return (
    <div className="flex justify-center gap-2 mt-8 mb-6 px-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full shadow-inner border border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 px-6 py-3 font-medium transition-all duration-300 rounded-full cursor-pointer
              ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </span>

            {activeTab === tab.id && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 z-0 border-3 border-blue-500 rounded-full shadow-md cursor-pointer"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}