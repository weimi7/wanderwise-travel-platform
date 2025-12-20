"use client";

import { Users, Hotel, Calendar, DollarSign, TrendingUp, TrendingDown, Sparkles, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { useState } from "react";

const iconComponents = {
  Users,
  Hotel,
  Calendar,
  DollarSign
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown
};

export default function StatsCards({ stats }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Default stats if none provided
  const defaultStats = [
    { title: "Total Users", value: "1,234", icon: "Users", trend: "up", change: "12%", description: "From last week" },
    { title: "Bookings", value: "456", icon: "Calendar", trend: "up", change: "8%", description: "From last month" },
    { title: "Revenue", value: "$12,345", icon: "DollarSign", trend: "up", change: "15%", description: "From last quarter" },
    { title: "Properties", value: "89", icon: "Hotel", trend: "down", change: "3%", description: "From last year" }
  ];

  const displayStats = stats || defaultStats;

  const getGradient = (index) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600"
    ];
    return gradients[index % gradients.length];
  };

  const getTrendColor = (trend) => {
    return trend === "up" ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat, index) => {
        // Accept either a string key ('Users') or a component (Users)
        const IconComponent = typeof stat.icon === 'string'
          ? (iconComponents[stat.icon] || Users)
          : (stat.icon || Users);

        const TrendIcon = trendIcons[stat.trend] || TrendingUp;
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onHoverStart={() => setHoveredCard(stat.title)}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <Card
              className={`bg-gradient-to-br ${getGradient(index)} text-white overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full"></div>
                <div className="absolute -right-2 -top-2 w-16 h-16 bg-white rounded-full"></div>
              </div>

              {/* Shine effect on hover */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ 
                  x: hoveredCard === stat.title ? "200%" : "-100%", 
                  opacity: hoveredCard === stat.title ? 0.4 : 0 
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
              />

              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"
                  >
                    <IconComponent className="w-6 h-6" />
                  </motion.div>

                  {/* Trend indicator */}
                  {stat.trend && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs ${getTrendColor(stat.trend)}`}
                    >
                      <TrendIcon className="w-3 h-3" />
                      <span>{stat.change}</span>
                    </motion.div>
                  )}
                </div>

                {/* Main content */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium opacity-80 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>

                {/* Description */}
                {stat.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm opacity-70 mt-2"
                  >
                    {stat.description}
                  </motion.p>
                )}

                {/* Hover action */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: hoveredCard === stat.title ? 1 : 0,
                    y: hoveredCard === stat.title ? 0 : 10
                  }}
                  className="flex items-center justify-between mt-4 pt-3 border-t border-white/20"
                >
                  <span className="text-xs opacity-70">View details</span>
                  <motion.div
                    animate={{ x: hoveredCard === stat.title ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              </CardContent>

              {/* Decorative elements */}
              <div className="absolute bottom-0 right-0 w-16 h-16 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="80" cy="80" r="20" fill="white" />
                </svg>
              </div>
            </Card>
          </motion.div>
        );
      })}

      {/* Empty state for when no stats are provided */}
      {!stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-full text-center py-12"
        >
          <div className="inline-flex flex-col items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Demo Statistics
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              These are sample stats. Connect your data to see real metrics.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}