// src/components/GoBackButton.tsx
'use client';

import { motion } from 'framer-motion';
import { IoMdArrowBack } from 'react-icons/io';

interface GoBackButtonProps {
  onClick: () => void;
}

export default function GoBackButton({ onClick }: GoBackButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, backgroundColor: 'var(--secondary-color)' }}
      className="fixed bottom-4 left-4 flex items-center px-4 py-2 bg-white border border-white text-black font-futuristic rounded-full shadow-lg z-40"
    >
      <IoMdArrowBack className="mr-2" />
      <span>Go Back</span>
    </motion.button>
  );
}
