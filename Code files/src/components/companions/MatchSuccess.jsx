import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MatchSuccess({ match, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="bg-card rounded-3xl p-8 mx-6 flex flex-col items-center text-center shadow-2xl max-w-xs w-full"
          >
            {/* Animated avatars */}
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary"
              >
                Me
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div className="h-px w-10 bg-emerald-400/40 mt-1" />
              </motion.div>

              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary"
              >
                {match.name.charAt(0)}
              </motion.div>
            </div>

            {/* Burst rings */}
            <div className="relative mb-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 2 + i * 0.6, opacity: 0 }}
                  transition={{ delay: 0.4 + i * 0.2, duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
                />
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl font-bold text-foreground"
            >
              You're Matched!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="text-sm text-muted-foreground mt-2 mb-6"
            >
              You and <span className="font-semibold text-foreground">{match.name}</span> are now walking companions. Stay safe!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button onClick={onDismiss} className="rounded-xl px-8">
                Start Walk Together
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}