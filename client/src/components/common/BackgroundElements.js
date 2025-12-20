"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function BackgroundElements() {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // Run only on client, so SSR and hydration match
    const newPositions = [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setPositions(newPositions);
  }, []);

  if (positions.length === 0) return null; // Prevent mismatch on first SSR render

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-300 dark:bg-blue-700 rounded-full opacity-30"
          style={pos}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
