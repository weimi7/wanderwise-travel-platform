"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export default function ConfirmDialog({ 
  open, 
  title, 
  message, 
  confirmLabel = "Delete", 
  cancelLabel = "Cancel", 
  onConfirm, 
  onCancel, 
  loading = false 
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200 dark:border-gray-700"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
        >
          {/* Header */}
          <div className="p-6 text-center">
            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h3 
              id="confirm-title" 
              className="text-lg font-semibold text-gray-800 dark:text-white mb-2"
            >
              {title}
            </h3>

            {/* Message */}
            <p 
              id="confirm-desc" 
              className="text-sm text-gray-600 dark:text-gray-300 mb-4"
            >
              {message}
            </p>

            {/* Danger warning */}
            <div className="mb-4 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                This action cannot be undone
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Actions */}
          <div className="p-6">
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer"
                disabled={loading}
              >
                {cancelLabel}
              </button>
              
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}