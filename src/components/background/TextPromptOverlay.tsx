"use client";

import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

interface Props {
  mobile: boolean;
}

export default function TextPromptOverlay({ mobile }: Props) {
  const prompt = mobile
    ? "Tap here or anywhere to enter"
    : "Click here or anywhere to enter";

  return (
    <Html fullscreen>
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
        {/* Circle container with dark gradient */}
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-black via-[#000080] to-indigo-900 flex flex-col items-center justify-center shadow-2xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`${mobile ? "text-xl" : "text-2xl"} font-bold text-white`}
          >
            {prompt}
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="mt-4"
          >
            <FiArrowDown className={`${mobile ? "w-6 h-6" : "w-8 h-8"} text-white`} />
          </motion.div>
        </div>
      </div>
    </Html>
  );
}
