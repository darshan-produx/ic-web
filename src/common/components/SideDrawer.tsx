"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '../../app/assests/icons/icons';
import ReactMarkdown from 'react-markdown';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  zIndex?: number;
  /** When false, prevents closing the drawer via backdrop click or escape key */
  canClose?: boolean;
}

// Animation variants for smoother transitions
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: {
    x: '100%',
    opacity: 0.8,
  },
  visible: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: '100%',
    opacity: 0.8,
  },
};

const handleClose = (onClose: () => void, onCancel?: () => void, onUpdateCancel?: () => void) => {
  onClose();
  if (onCancel) onCancel();
  if (onUpdateCancel) onUpdateCancel();
}

const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'w-[800px]',
  zIndex = 1049,
  canClose = true
}) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && canClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, canClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{
              duration: 0.25,
              ease: 'easeInOut'
            }}
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: zIndex - 1 }}
            onClick={() => canClose && handleClose(onClose)}
          />

          {/* Side Drawer */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: 'tween',
              duration: 0.3,
              ease: [0.32, 0.72, 0, 1] // Custom easing for smooth feel
            }}
            className={`fixed top-[0px] right-[0px] bottom-[0px] ${width} bg-white rounded-l-[12px]`}
            style={{ zIndex }}
          >
            {/* Header - Keeping your exact structure */}
            <div className="h-[56px] flex items-center justify-between p-4 border-b-[1px] border-gray-200 box-border">
              <div className="flex-1 min-w-0 overflow-hidden">
                <ReactMarkdown
                  className="text-[16px] font-normal text-[#202B37] [&>p]:truncate [&>p]:m-0"
                  components={{
                    p: ({ children }) => (
                      <p className="truncate m-0" title={typeof children === 'string' ? children : undefined} 
                      >
                        {children}
                      </p>
                    )
                  }}
                >
                  {title}
                </ReactMarkdown>
              </div>
              <button
                onClick={() => canClose && handleClose(onClose)}
                className={`p-1 text-[#202B37] rounded-md transition-colors flex-shrink-0 ml-2 ${canClose ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <XIcon className="text-[#97A1AF]" stroke='#97A1AF' />
              </button>
            </div>

            {/* Content - Keeping your exact structure */}
            <div className="w-full h-full min-h-screen overflow-x-hidden">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;