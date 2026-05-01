import React from "react";
import { motion } from "framer-motion";

export const Skeleton: React.FC<{ 
  count?: number; 
  width?: string; 
  height?: string; 
  className?: string;
  // createEventType?: { label: string; value: string };
  // setCreateEventType?: (type: any) => void;
  // CreateEventTypeOptions?: { label: string; value: string }[];
}> = ({
  count = 3,
  width = '283px',
  height = '66px',
  className = '',
  // createEventType,
  // setCreateEventType,
  // CreateEventTypeOptions,
}) => {

  const colors = ['#D9F2E5', '#FFEECC', '#FCCFCF']; // 3 colors

  // Animation variants for the skeleton item
  const skeletonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Pulse animation for the loading effect
  const pulseVariants = {
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Stagger animation for container
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center mt-6 w-full"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {count > 0 && Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`mt-[21px] p-[16px] dark:bg-gray-700 rounded-[16px] mb-2 border border-[#E4E7EC] ${className}`}
          style={{ width, height }}
          variants={skeletonVariants}
        >
          {/* First line with pulse animation */}
          <motion.div
            className="bg-[#E4E7EC] h-[12px] rounded-[40px]"
            variants={pulseVariants}
            animate="animate"
          />

          {/* Second line with dynamic color and pulse animation */}
          <motion.div
            className="w-[108px] mt-[10px] h-[12px] rounded-[40px]"
            style={{ backgroundColor: colors[index % colors.length] }}
            variants={pulseVariants}
            animate="animate"
          />
        </motion.div>
      ))}
    </motion.div>
  );
};