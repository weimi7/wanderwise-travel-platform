"use client";
import { motion, AnimatePresence } from "framer-motion";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis logic for better UX with many pages
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first page
    pages.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (currentPage <= 3) {
      endPage = 4;
    }
    
    if (currentPage >= totalPages - 2) {
      startPage = totalPages - 3;
    }
    
    if (startPage > 2) {
      pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex justify-center items-center gap-1 mt-8">
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm cursor-pointer"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </motion.button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 mx-2">
        <AnimatePresence mode="wait">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500 dark:text-gray-400">
                ...
              </span>
            ) : (
              <motion.button
                key={page}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg border transition-colors duration-200 cursor-pointer ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
                }`}
              >
                {page}
              </motion.button>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm cursor-pointer"
      >
        Next
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </div>
  );
};

export default Pagination;