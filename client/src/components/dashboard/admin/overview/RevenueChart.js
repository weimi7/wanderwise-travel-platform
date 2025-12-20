"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Eye, 
  MoreHorizontal, 
  Target,
  Zap,
  Award,
  TrendingDown,
  Percent,
  ChevronRight,
  PieChart as PieChartIcon,
  Crown,
  Star,
  Wallet,
  CreditCard,
  ShoppingBag,
  Coffee,
  Car,
  Home
} from "lucide-react";

// Custom tooltip component with enhanced design
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / data.total) * 100).toFixed(1);
    const isTopCategory = percentage > 30;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-4 min-w-[200px] z-50"
        style={{
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
        }}
      >
        {/* Tooltip pointer */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-t border-l border-gray-200/50 dark:border-gray-700/50 rotate-45 rounded-tl"></div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {data.name}
            </span>
          </div>
          {isTopCategory && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-4 h-4 text-yellow-500" />
            </motion.div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${data.value.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              revenue
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: data.color }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[45px]">
              {percentage}%
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {percentage > 30 ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Top performing category</span>
                </>
              ) : percentage > 15 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>Growing steadily</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>Stable performance</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

// Animated pie segment with enhanced effects
const AnimatedPieSegment = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, stroke, strokeWidth, index, isActive } = props;
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.g
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        scale: isHovered ? 1.05 : 1,
        filter: isHovered ? "brightness(1.2) saturate(1.2)" : "none"
      }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow on hover */}
      {isHovered && (
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          d={`
            M ${cx + (outerRadius + 8) * Math.cos((startAngle * Math.PI) / 180)}
            ${cy + (outerRadius + 8) * Math.sin((startAngle * Math.PI) / 180)}
            A ${outerRadius + 8} ${outerRadius + 8} 0 
            ${endAngle - startAngle > 180 ? 1 : 0} 1
            ${cx + (outerRadius + 8) * Math.cos((endAngle * Math.PI) / 180)}
            ${cy + (outerRadius + 8) * Math.sin((endAngle * Math.PI) / 180)}
            L ${cx} ${cy}
            Z
          `}
          fill={fill}
          filter="url(#glow)"
        />
      )}
      
      {/* Main segment */}
      <path
        d={`
          M ${cx + outerRadius * Math.cos((startAngle * Math.PI) / 180)}
          ${cy + outerRadius * Math.sin((startAngle * Math.PI) / 180)}
          A ${outerRadius} ${outerRadius} 0 
          ${endAngle - startAngle > 180 ? 1 : 0} 1
          ${cx + outerRadius * Math.cos((endAngle * Math.PI) / 180)}
          ${cy + outerRadius * Math.sin((endAngle * Math.PI) / 180)}
          L ${cx} ${cy}
          Z
        `}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className="transition-all duration-300 cursor-pointer"
      />
      
      {/* Segment label on hover */}
      {isHovered && (
        <motion.text
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          x={cx + (innerRadius + outerRadius) / 2 * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
          y={cy + (innerRadius + outerRadius) / 2 * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold text-xs fill-white pointer-events-none"
          filter="url(#shadow)"
        >
          {((props.percent) * 100).toFixed(0)}%
        </motion.text>
      )}
    </motion.g>
  );
};

// Category icons mapping
const CATEGORY_ICONS = {
  "Accommodation": Home,
  "Activities": Zap,
  "Transportation": Car,
  "Dining": Coffee,
  "Shopping": ShoppingBag,
  "Other": CreditCard,
};

// Sample data with enhanced details
const sampleData = [
  { 
    name: "Accommodation", 
    value: 125000, 
    color: "#3b82f6",
    trend: "+12.5%",
    icon: Home
  },
  { 
    name: "Activities", 
    value: 75000, 
    color: "#22c55e",
    trend: "+8.3%",
    icon: Zap
  },
  { 
    name: "Transportation", 
    value: 50000, 
    color: "#f59e0b",
    trend: "+5.7%",
    icon: Car
  },
  { 
    name: "Dining", 
    value: 40000, 
    color: "#8b5cf6",
    trend: "+15.2%",
    icon: Coffee
  },
  { 
    name: "Other", 
    value: 25000, 
    color: "#ec4899",
    trend: "+3.4%",
    icon: CreditCard
  },
];

export default function RevenueChart({ data }) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [sparkleIndex, setSparkleIndex] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const processedData = (data || sampleData).map(item => ({
      ...item,
      total: (data || sampleData).reduce((sum, d) => sum + d.value, 0),
      percent: item.value / (data || sampleData).reduce((sum, d) => sum + d.value, 0)
    }));
    setChartData(processedData);
    setTotalRevenue(processedData.reduce((sum, item) => sum + item.value, 0));
    
    // Start animation sequence
    setTimeout(() => setAnimationComplete(true), 1000);
    
    // Random sparkle effect
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * processedData.length);
      setSparkleIndex(randomIndex);
      setTimeout(() => setSparkleIndex(null), 500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [data]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(0);
  };

  if (!isMounted) {
    return (
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/30 border-0 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <CardContent className="p-8 relative">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-48 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-10"></div>
            </div>
            <div className="h-64 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeData = chartData[activeIndex] || chartData[0];
  const topCategory = chartData.reduce((prev, current) => 
    (prev.value > current.value) ? prev : current
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      ref={containerRef}
    >
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/30 border-0 rounded-3xl shadow-2xl overflow-hidden relative group">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
              initial={{ x: -100, y: Math.random() * 400 }}
              animate={{ x: "100vw" }}
              transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, delay: i * 1.5 }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-start gap-4">
              <motion.div 
                className="p-3 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <PieChartIcon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  Revenue Analytics
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Category-wise revenue distribution
                </p>
              </div>
            </div>
            
            <motion.button 
              className="p-2.5 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
              whileTap={{ scale: 0.95 }}
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>

          {/* Total revenue highlight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/20 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
                Total Revenue
              </span>
            </motion.div>
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-gray-800 dark:text-white"
            >
              ${totalRevenue.toLocaleString()}
            </motion.p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Year-to-date revenue across all categories
            </p>
          </motion.div>
        </div>

        <CardContent className="p-8 pt-0">
          {/* Chart container */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
                  </filter>
                  
                  {chartData.map((entry, index) => (
                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  labelLine={false}
                  label={({ name, percent }) =>
                    activeIndex !== null ? null : `${(percent * 100).toFixed(0)}%`
                  }
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={`url(#gradient-${index})`}
                      stroke="#fff"
                      strokeWidth={activeIndex === index ? 4 : 3}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.8}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center display - Shows active or top category */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </motion.div>
                <motion.p
                  key={activeData?.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {activeData?.name || "Hover over"}
                </motion.p>
                <motion.p
                  key={activeData?.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  ${activeData?.value?.toLocaleString() || totalRevenue.toLocaleString()}
                </motion.p>
              </div>
            </motion.div>

            {/* Sparkle effects */}
            <AnimatePresence>
              {sparkleIndex !== null && (
                <motion.div
                  key={sparkleIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category breakdown */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white">Category Breakdown</h4>
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                <span>Top: {topCategory.name}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {chartData.map((item, index) => {
                const Icon = CATEGORY_ICONS[item.name] || CreditCard;
                const percentage = ((item.value / totalRevenue) * 100).toFixed(1);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer border ${
                      activeIndex === index 
                        ? 'bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 shadow-lg' 
                        : 'bg-white/50 dark:bg-gray-800/50 border-transparent hover:bg-white/70 dark:hover:bg-gray-800/70'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(0)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {item.trend}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white">
                        ${item.value.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: item.color }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[35px]">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-6 border-t border-gray-100/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Top Category: <span className="text-emerald-600 dark:text-emerald-400">{topCategory.name}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Contributes {((topCategory.value / totalRevenue) * 100).toFixed(1)}% to total revenue
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}