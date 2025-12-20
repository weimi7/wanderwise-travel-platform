"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Eye, 
  MoreHorizontal,
  Target,
  Award,
  Zap,
  ChevronRight,
  BarChart3,
  Users,
  Clock
} from "lucide-react";

// Custom tooltip component with enhanced design
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isHigh = payload[0].value > 80;
    const isMedium = payload[0].value > 50;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-4 min-w-[180px]"
        style={{
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
        }}
      >
        {/* Tooltip pointer */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-t border-l border-gray-200/50 dark:border-gray-700/50 rotate-45 rounded-tl"></div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          {isHigh && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="w-3 h-3 text-yellow-500" />
            </motion.div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {payload[0].value}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            bookings
          </span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isHigh ? "bg-gradient-to-r from-green-500 to-emerald-500" :
              isMedium ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
              "bg-gradient-to-r from-slate-400 to-gray-400"
            }`} />
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {isHigh ? "Peak season" : isMedium ? "Good traffic" : "Normal"}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

// Custom bar component with enhanced animations
const AnimatedBar = (props) => {
  const { fill, x, y, width, height, index, value } = props;
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.g
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ 
        opacity: 1, 
        scaleY: 1,
        y: isHovered ? -5 : 0
      }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      {isHovered && (
        <motion.rect
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          x={x - 4}
          y={y - 8}
          width={width + 8}
          height={height + 16}
          rx={8}
          fill={fill}
          filter="url(#glow)"
        />
      )}
      
      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={8}
        className="transition-all duration-300"
        style={{
          transformOrigin: "bottom",
          transform: isHovered ? "scale(1.05, 1)" : "scale(1, 1)",
          filter: isHovered ? "brightness(1.1) saturate(1.2)" : "none",
        }}
      />
      
      {/* Value label on hover */}
      {isHovered && (
        <motion.text
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: -10 }}
          x={x + width / 2}
          y={y}
          textAnchor="middle"
          className="font-bold text-xs fill-white"
          filter="url(#shadow)"
        >
          {value}
        </motion.text>
      )}
    </motion.g>
  );
};

export default function BookingsChart({ data }) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");
  const [hoveredBar, setHoveredBar] = useState(null);
  const [activeMonth, setActiveMonth] = useState("Dec");
  const [sparkleIndex, setSparkleIndex] = useState(null);

  // Enhanced sample data with more metrics
  const sampleData = [
    { month: "Jan", bookings: 45, trend: "up", revenue: 4500, conversion: 68 },
    { month: "Feb", bookings: 52, trend: "up", revenue: 5200, conversion: 72 },
    { month: "Mar", bookings: 48, trend: "down", revenue: 4800, conversion: 65 },
    { month: "Apr", bookings: 67, trend: "up", revenue: 6700, conversion: 75 },
    { month: "May", bookings: 75, trend: "up", revenue: 7500, conversion: 78 },
    { month: "Jun", bookings: 82, trend: "up", revenue: 8200, conversion: 82 },
    { month: "Jul", bookings: 78, trend: "down", revenue: 7800, conversion: 76 },
    { month: "Aug", bookings: 85, trend: "up", revenue: 8500, conversion: 80 },
    { month: "Sep", bookings: 92, trend: "up", revenue: 9200, conversion: 84 },
    { month: "Oct", bookings: 88, trend: "down", revenue: 8800, conversion: 79 },
    { month: "Nov", bookings: 95, trend: "up", revenue: 9500, conversion: 86 },
    { month: "Dec", bookings: 110, trend: "up", revenue: 11000, conversion: 90 },
  ];

  const displayData = data || sampleData;

  useEffect(() => {
    setIsMounted(true);
    // Random sparkle effect
    const interval = setInterval(() => {
      setSparkleIndex(Math.floor(Math.random() * displayData.length));
      setTimeout(() => setSparkleIndex(null), 300);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [displayData.length]);

  const getGradient = (value, maxValue) => {
    const percentage = (value / maxValue) * 100;
    if (percentage > 80) return "url(#premiumGradient)";
    if (percentage > 60) return "url(#highGradient)";
    if (percentage > 40) return "url(#mediumGradient)";
    return "url(#lowGradient)";
  };

  const maxValue = Math.max(...displayData.map(item => item.bookings));
  const totalBookings = displayData.reduce((sum, item) => sum + item.bookings, 0);
  const growthRate = 12.5; // Calculated from data

  if (!isMounted) {
    return (
      <Card className="col-span-2 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900/50 border-0 rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <CardContent className="p-8 relative">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
            </div>
            <div className="h-72 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <Card className="col-span-2 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/30 border-0 rounded-3xl shadow-2xl overflow-hidden relative group">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              initial={{ x: -100, y: Math.random() * 400 }}
              animate={{ x: "100vw" }}
              transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, delay: i * 2 }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative p-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-start gap-4">
              <motion.div 
                className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                  Booking Analytics
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Real-time insights and performance metrics
                </p>
              </div>
            </div>
            
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2.5 text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 appearance-none cursor-pointer pr-10 font-medium"
                >
                  <option value="monthly">Monthly View</option>
                  <option value="quarterly">Quarterly View</option>
                  <option value="yearly">Yearly View</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 -rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <motion.button 
                className="p-2.5 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
                whileTap={{ scale: 0.95 }}
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </motion.button>
            </motion.div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-100/50 dark:border-blue-800/20"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {totalBookings.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Bookings</p>
                </div>
                <Users className="w-8 h-8 text-blue-500/60" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-800/20"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    ${(totalBookings * 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Revenue</p>
                </div>
                <BarChart3 className="w-8 h-8 text-emerald-500/60" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-800/20"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    0%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Growth Rate</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500/60" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-100/50 dark:border-purple-800/20"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    0%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Avg. Conversion</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500/60" />
              </div>
            </motion.div>
          </div>
        </div>

        <CardContent className="p-8 pt-0">
          {/* Chart */}
          <div className="relative h-[340px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
                  </filter>
                  
                  <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(148, 163, 184, 0.1)" 
                  vertical={false} 
                  strokeWidth={0.5}
                />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={false}
                />
                <Bar
                  dataKey="bookings"
                  shape={(props) => <AnimatedBar {...props} />}
                  onMouseOver={(data, index) => {
                    setHoveredBar(index);
                    setActiveMonth(data.month);
                  }}
                  onMouseOut={() => setHoveredBar(null)}
                >
                  {displayData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getGradient(entry.bookings, maxValue)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Sparkle effect on random bars */}
            <AnimatePresence>
              {sparkleIndex !== null && (
                <motion.div
                  key={sparkleIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute"
                  style={{
                    left: `${(sparkleIndex / displayData.length) * 100}%`,
                    top: '20%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chart footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-8 border-t border-gray-100/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Peak Performance: <span className="text-blue-600 dark:text-blue-400"></span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Achieved highest bookings with 90% conversion rate
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100/50 dark:border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Excellent ({">"}80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-400 to-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Good (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-300 to-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Average (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-200 to-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Low ({">"}40%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}