import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Zap, 
  Star, 
  Heart, 
  Crown,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Play,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  TrendingUp
} from "lucide-react";

export function Card({ 
  children, 
  className = "", 
  hoverable = false, 
  variant = "default",
  interactive = false,
  glowing = false,
  shimmer = false,
  borderGlow = false,
  onClick,
  disabled = false,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.current.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const node = cardRef.current;
    if (node) {
      observer.current.observe(node);
    }

    return () => {
      if (observer.current && node) {
        observer.current.unobserve(node);
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const variants = {
    default: "bg-white dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50",
    elevated: "bg-white dark:bg-gray-800/95 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/5 dark:shadow-black/20",
    glass: "bg-white/15 dark:bg-gray-800/25 backdrop-blur-xl border-white/30 dark:border-gray-700/30",
    gradient: "bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 border-blue-200/30 dark:border-blue-800/30",
    premium: "bg-gradient-to-br from-white via-amber-50/50 to-yellow-50/50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20 border-amber-200/30 dark:border-amber-800/30",
    dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700",
    neon: "bg-gray-900 border-gray-800",
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 30,
        scale: isVisible ? 1 : 0.95,
        scale: isPressed ? 0.98 : 1
      }}
      transition={{ 
        duration: 0.5, 
        type: "spring", 
        stiffness: 100,
        delay: Math.random() * 0.2 
      }}
      whileHover={hoverable && !disabled ? { 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2, type: "spring", stiffness: 200 }
      } : {}}
      whileTap={interactive && !disabled ? { scale: 0.98 } : {}}
      onMouseEnter={() => hoverable && !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        hoverable && !disabled && setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={handleClick}
      className={`
        relative rounded-3xl border transition-all duration-300 overflow-hidden
        ${variants[variant]}
        ${hoverable && !disabled ? "cursor-pointer transform-gpu active:scale-98" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
        group
      `}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        boxShadow: isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.5)" : "",
      }}
      {...props}
    >
      {/* Mouse spotlight effect */}
      {hoverable && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.15), transparent 80%)`
          }}
          transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
        />
      )}

      {/* Border glow effect */}
      {borderGlow && !disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
          className="absolute -inset-px rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-sm"
        />
      )}

      {/* Shimmer effect */}
      {shimmer && !disabled && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ 
            x: isHovered ? "200%" : "-100%", 
            opacity: isHovered ? 0.8 : 0 
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12"
        />
      )}

      {/* Glowing effect */}
      {glowing && !disabled && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
      )}

      {/* Interactive buttons overlay */}
      {interactive && !disabled && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
            />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </motion.button>
        </div>
      )}

      {/* Premium badge */}
      {variant === "premium" && !disabled && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -top-2 -right-2 z-20"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-sm" />
            <div className="relative p-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Lock overlay for disabled */}
      {disabled && (
        <div className="absolute inset-0 bg-black/10 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Hover arrow indicator */}
      {hoverable && !disabled && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            x: isHovered ? 0 : -20 
          }}
          className="absolute bottom-4 right-4"
        >
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}

      {/* Pulse animation for interactive cards */}
      {interactive && !disabled && (
        <motion.div
          animate={{ 
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute inset-0 rounded-3xl border border-blue-300/30 pointer-events-none"
        />
      )}
    </motion.div>
  );
}

export function CardContent({ 
  children, 
  className = "", 
  padding = "default",
  background = "transparent",
  animated = false,
  ...props 
}) {
  const paddingVariants = {
    none: "p-0",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const backgroundVariants = {
    transparent: "",
    gradient: "bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50",
    pattern: "bg-gradient-to-br from-white via-blue-50/20 to-transparent",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        delay: 0.2,
        staggerChildren: 0.1 
      }}
      className={`
        ${paddingVariants[padding]} 
        ${backgroundVariants[background]}
        ${animated ? "transition-all duration-300 group-hover:bg-white/10 dark:group-hover:bg-gray-800/10" : ""}
        ${className}
      `}
      {...props}
    >
      {animated ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {children}
        </motion.div>
      ) : children}
    </motion.div>
  );
}

export function CardHeader({ 
  children, 
  className = "", 
  title,
  subtitle,
  action,
  icon,
  badge,
  animated = false,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`
        flex items-start justify-between p-6 border-b border-gray-100/50 dark:border-gray-700/50
        ${animated ? "group-hover:border-blue-200/50 dark:group-hover:border-blue-800/50 transition-colors duration-300" : ""}
        ${className}
      `}
      {...props}
    >
      <div className="flex-1">
        <div className="flex items-start gap-3">
          {icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring" }}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
            >
              {icon}
            </motion.div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {title && (
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h3>
              )}
              {badge}
            </div>
            
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-500 dark:text-gray-400 mt-2"
              >
                {subtitle}
              </motion.p>
            )}
            {children}
          </div>
        </div>
      </div>
      
      {action && (
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

export function CardFooter({ 
  children, 
  className = "", 
  variant = "default",
  animated = false,
  ...props 
}) {
  const variants = {
    default: "bg-gray-50/50 dark:bg-gray-800/30",
    gradient: "bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30",
    elevated: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`
        p-6 border-t border-gray-100/50 dark:border-gray-700/50
        ${animated ? "group-hover:border-blue-200/50 dark:group-hover:border-blue-800/50 transition-colors duration-300" : ""}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardImage({ 
  src, 
  alt, 
  className = "", 
  height = "auto",
  overlay = false,
  playable = false,
  animated = true,
  ...props 
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
      className={`relative overflow-hidden ${className} group/image`}
      {...props}
    >
      <Image
        src={src}
        alt={alt}
        className={`
          w-full h-full object-cover transition-all duration-700
          ${animated ? "group-hover/image:scale-110 group-hover/image:brightness-110" : ""}
        `}
        style={{ height }}
      />
      
      {/* Gradient overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
      )}

      {/* Play button for videos */}
      {playable && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full animate-ping" />
            <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-2xl">
              {isPlaying ? (
                <div className="w-6 h-6 bg-white rounded-sm" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </div>
          </div>
        </motion.button>
      )}

      {/* Shimmer effect on image */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/image:translate-x-[100%] transition-transform duration-1000" />
      )}
    </motion.div>
  );
}

export function CardBadge({ 
  children, 
  variant = "default",
  className = "",
  animated = false,
  icon,
  ...props 
}) {
  const variants = {
    default: "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300",
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    success: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
    warning: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
    error: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
    premium: "bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900",
    neon: "bg-gradient-to-r from-blue-400 to-purple-500 text-white",
  };

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={animated ? { scale: 1.05, y: -2 } : {}}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
        shadow-lg hover:shadow-xl transition-all duration-300
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {icon && (
        <motion.div
          animate={animated ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </motion.span>
  );
}

export function CardStats({ 
  value, 
  label, 
  trend = 0,
  icon,
  className = "",
  ...props 
}) {
  const isPositive = trend > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
        {icon && (
          <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
            {icon}
          </div>
        )}
      </div>
      {trend !== 0 && (
        <div className={`flex items-center gap-1 mt-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendIcon isPositive={isPositive} />
          <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          <span className="text-xs text-gray-500">from last month</span>
        </div>
      )}
    </motion.div>
  );
}

function TrendIcon({ isPositive }) {
  return isPositive ? (
    <TrendingUp className="w-4 h-4" />
  ) : (
    <TrendingDown className="w-4 h-4" />
  );
}

function TrendingDown(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}