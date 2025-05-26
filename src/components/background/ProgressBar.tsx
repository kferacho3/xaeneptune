"use client";

import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaCompactDisc } from "react-icons/fa";

interface CombinedProgressPromptProps {
  /** mark progress bar complete (parent sets progressComplete) */
  onComplete: () => void;
  /** fire the moment the user clicks (parent sets hasInteracted) */
  onEnter: () => void;
  mobile: boolean;
}

/* fun / themed progress texts */
const progressMessages = [
  "Loading Tracks...",
  "Sampling Beats...",
  "Boosting Bass...",
  "Slapping Drums...",
  "Polishing Hooks...",
];

export default function CombinedProgressPrompt({
  onComplete,
  onEnter,
  mobile,
}: CombinedProgressPromptProps) {
  /* -------------------------------------------------- */
  /* STATE                                              */
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(progressMessages[0]);
  const [fadeOut, setFadeOut] = useState(false);

  /* -------------------------------------------------- */
  /* SIMULATED PROGRESS                                 */
  useEffect(() => {
    if (progress >= 100) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.random() * 5, 100);
        setMessage(progressMessages[Math.min(Math.floor(next / 20), 4)]);
        if (next >= 100) clearInterval(id);
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [progress]);

  /* -------------------------------------------------- */
  /* CLICK → IMMEDIATE FLUID START + OVERLAY FADE       */
  const handleClick = () => {
    if (progress < 100 || fadeOut) return;

    /** 1️⃣ tell the parent we've interacted */
    onEnter();

    /** 2️⃣ mark the progress as complete *right away* so
        FluidTransitionEffect can begin immediately, independent
        of this overlay's fade-out duration */
    onComplete();

    /** 3️⃣ now play our own fade-out animation */
    setFadeOut(true);
  };

  /* -------------------------------------------------- */
  /* ARC MATH                                           */
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  /* -------------------------------------------------- */
  /* RENDER                                             */
  return (
    <Html fullscreen>
      <motion.div
        /* whole overlay */
        initial={{ opacity: 1 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={{ duration: 1.8 }}     
        onClick={handleClick}
        className={`
          absolute inset-0 flex flex-col items-center justify-center z-[9999]
          ${progress >= 100 ? "cursor-pointer" : "cursor-none"}
        `}
      >
        {/* ——— STATUS TEXT ——— */}
        <div className="mb-4 min-h-[1.25rem] flex items-center justify-center">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: progress < 100 ? 1 : 0, y: progress < 100 ? 0 : -8 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-mono text-blue-300 drop-shadow-lg text-center"
          >
            {message}
          </motion.p>
        </div>

        {/* ——— RECORD + PROGRESS ARC ——— */}
        <motion.div
          className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
          animate={progress >= 100 ? { scale: [1, 1.07, 1] } : undefined}
          transition={
            progress >= 100
              ? { duration: 1, ease: "easeInOut", repeat: Infinity }
              : undefined
          }
          style={{ background: "linear-gradient(135deg,#000,#4b0082,#8b0000)" }}
        >
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B0000" />
                <stop offset="100%" stopColor="#4B0082" />
              </linearGradient>
            </defs>

            {/* static grey ring */}
            <circle
              stroke="#2d3748"
              fill="transparent"
              strokeWidth="8"
              r={radius}
              cx="64"
              cy="64"
            />

            {/* progress arc */}
            <motion.circle
              stroke="url(#progressGradient)"
              fill="transparent"
              strokeWidth="8"
              r={radius}
              cx="64"
              cy="64"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              initial={false}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
          </svg>

          {/* spinning disc icon */}
          <motion.div
            animate={progress >= 100 ? { rotate: -360 } : { rotate: 0 }}
            transition={
              progress >= 100
                ? { duration: 2, ease: "linear", repeat: Infinity }
                : undefined
            }
          >
            <FaCompactDisc className="w-12 h-12 text-blue-300 drop-shadow-lg" />
          </motion.div>
        </motion.div>

        {/* ——— TAP / CLICK PROMPT ——— */}
        {progress >= 100 && !fadeOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="mt-4 text-center text-white font-bold"
          >
            {mobile ? "Tap to enter" : "Click to enter"}
          </motion.div>
        )}
      </motion.div>
    </Html>
  );
}
