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
      className="flex items-center px-4 py-2 bg-white border border-white text-black font-futuristic rounded-full shadow-lg"
    >
      <IoMdArrowBack className="mr-2" />
      <span>HOME</span>
    </motion.button>
  );
}
