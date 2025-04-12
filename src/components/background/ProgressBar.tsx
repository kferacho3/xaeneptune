"use client";

import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaCompactDisc } from "react-icons/fa";

interface CombinedProgressPromptProps {
  onComplete: () => void;
  mobile: boolean;
}

const progressMessages = [
  "Loading Tracks...",
  "Sampling Beats...",
  "Boosting Bass...",
  "Slapping Drums...",
  "Polishing Hooks..."
];
export default function CombinedProgressPrompt({ onComplete, mobile }: CombinedProgressPromptProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(progressMessages[0]);

  // Define circle dimensions
  const radius = 50; // px
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  // Auto-progress until 100%.
  useEffect(() => {
    if (progress >= 100) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = Math.min(p + Math.random() * 5, 100);
        if (newProgress < 20) {
          setMessage(progressMessages[0]);
        } else if (newProgress < 40) {
          setMessage(progressMessages[1]);
        } else if (newProgress < 60) {
          setMessage(progressMessages[2]);
        } else if (newProgress < 80) {
          setMessage(progressMessages[3]);
        } else {
          setMessage(progressMessages[4]);
        }
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progress]);

  // When loading is complete, update the prompt text.
  const promptText = mobile
    ? "Tap here or anywhere to enter"
    : "Click here or anywhere to enter";

  // Handler when the user clicks the interactive area.
  const handleClick = () => {
    if (progress >= 100) {
      onComplete();
    }
  };

  return (
    <Html fullscreen>
    <div
      onClick={handleClick}
      className={`absolute inset-0 flex flex-col items-center justify-center z-[9999] ${
        progress >= 100 ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* While loading, show the progress message above the circle */}
      {progress < 100 && (
        <div className="mb-4 text-center">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-lg font-mono text-blue-300 drop-shadow-lg"
          >
            {message}
          </motion.p>
        </div>
      )}

      {/* The circle container */}
      <motion.div
        className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl ${
          progress >= 100
            ? "hover:shadow-[0_0_20px_rgba(220,20,60,0.8)]"
            : ""
        }`}
        animate={
          progress >= 100
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={
          progress >= 100
            ? {
                ease: "easeInOut",
                duration: 1,
                repeat: Infinity,
              }
            : {}
        }
        style={{
          background: "linear-gradient(135deg, #000, #4b0082, #8b0000)",
        }}
      >
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B0000" /> {/* Dark red */}
              <stop offset="100%" stopColor="#4B0082" /> {/* Indigo */}
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            stroke="#2d3748"
            fill="transparent"
            strokeWidth="8"
            r={radius}
            cx="64"
            cy="64"
          />
          {/* Animated progress arc */}
          {progress < 100 && (
            <motion.circle
              stroke="url(#progressGradient)"
              fill="transparent"
              strokeWidth="8"
              r={radius}
              cx="64"
              cy="64"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ ease: "easeOut", duration: 0.1 }}
            />
          )}
        </svg>
        {/* Record icon */}
        <motion.div
          className="absolute flex items-center justify-center"
          animate={progress >= 100 ? { rotate: -360 } : { rotate: 0 }}
          transition={progress >= 100 ? { ease: "linear", duration: 2, repeat: Infinity } : {}}
        >
          <FaCompactDisc className="w-12 h-12 text-blue-300 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      {/* When progress is complete, show the prompt text below the icon */}
      {progress >= 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4 text-center text-white font-bold"
        >
          {promptText}
        </motion.div>
      )}
    </div>
    </Html>
  );
}
