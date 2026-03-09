// 📁 F_TabWithTransition.js
import React, { useRef, useLayoutEffect } from 'react';
import { Box } from '@mui/joy';
import { motion, AnimatePresence } from 'framer-motion';

export default function TabWithTransition({ isActive, tabKey, children, onHeightChange }) {
  const ref = useRef();
  const MotionBox = motion.create(Box);

  useLayoutEffect(() => {
    if (isActive && ref.current && onHeightChange) {
      onHeightChange(ref.current.offsetHeight);
    }
  }, [isActive, children, onHeightChange]);

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <MotionBox
          key={tabKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            position: 'relative', // ⬅ שינוי מ-absolute כדי למנוע חפיפות
            willChange: 'opacity',
          }}
        >
          <div ref={ref}>
            {children}
          </div>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
