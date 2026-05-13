import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SOSButton({ size = 'normal' }) {
  const navigate = useNavigate();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(intervalRef.current);
        navigate('/sos');
      }
    }, 30);
  };

  const endHold = () => {
    setHolding(false);
    setProgress(0);
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
  };

  const isSmall = size === 'small';

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        className={`relative ${isSmall ? 'w-14 h-14' : 'w-20 h-20'} rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/25 active:scale-95 transition-transform`}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence>
          {holding && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`absolute inset-0 rounded-full bg-destructive`}
            />
          )}
        </AnimatePresence>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeDasharray={`${progress * 2.83} 283`}
            className="transition-all duration-75"
            opacity={holding ? 0.6 : 0}
          />
        </svg>
        <AlertTriangle className={`${isSmall ? 'w-6 h-6' : 'w-8 h-8'} text-destructive-foreground relative z-10`} />
      </motion.button>
      <p className="text-xs text-muted-foreground font-medium">
        {holding ? 'Keep holding...' : 'Hold for SOS'}
      </p>
    </div>
  );
}