"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Copy,
  FileText,
  Share2,
  Printer,
  CheckCircle,
  Loader2,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  generateItineraryPDF,
  copyItineraryToClipboard,
  downloadItineraryText,
} from "@/utils/itineraryPDF";

export default function ItineraryActions({ itinerary, cleanedItinerary }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      toast.loading("Generating PDF...", { id: "pdf-download" });

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      generateItineraryPDF(itinerary, cleanedItinerary);

      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", { id: "pdf-download" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadText = () => {
    try {
      downloadItineraryText(itinerary, cleanedItinerary);
      toast.success("Text file downloaded successfully!");
    } catch (error) {
      console.error("Text download error:", error);
      toast.error("Failed to download text file");
    }
  };

  const handleCopy = async () => {
    try {
      const result = await copyItineraryToClipboard(cleanedItinerary);
      if (result. success) {
        setCopied(true);
        toast.success(result.message);
        setTimeout(() => setCopied(false), 3000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy itinerary");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary.title || "My Sri Lanka Itinerary",
          text: `Check out my ${itinerary.days}-day trip to Sri Lanka! `,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share error:", err);
        }
      }
    } else {
      toast.error("Sharing is not supported on this device");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const actions = [
    // {
    //   id: "pdf",
    //   label: "PDF",
    //   icon: Download,
    //   onClick: handleDownloadPDF,
    //   color: "from-red-500 to-pink-500",
    // },
    {
      id: "text",
      label: "TXT",
      icon: FileText,
      onClick:  handleDownloadText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "copy",
      label: copied ? "Copied!" : "Copy",
      icon: copied ? CheckCircle : Copy,
      onClick: handleCopy,
      color: "from-emerald-500 to-green-500",
    },
    {
      id: "share",
      label: "Share",
      icon: Share2,
      onClick: handleShare,
      color: "from-purple-500 to-indigo-500",
    },
    {
      id: "print",
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          Export Your Itinerary
        </h3>
        <p className="text-gray-400">
          Download, share, or print your personalized travel plan
        </p>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions. map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y:  20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              disabled={loading && action.id === "pdf"}
              className={`relative group p-6 bg-white/5 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-white/10 overflow-hidden ${
                loading && action.id === "pdf"
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon */}
                <div
                  className={`w-12 h-12 mb-3 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform`}
                >
                  {loading && action.id === "pdf" ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Label */}
                <h4 className="text-sm font-bold text-white mb-1">
                  {action.label}
                </h4>
              </div>

              {/* Hover effect line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform`}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}