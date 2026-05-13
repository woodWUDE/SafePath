import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, MapPin, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArrivalConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-4 flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold text-foreground">Safe Arrival Confirmed</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Your walking session has ended. Stay safe.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 w-full space-y-3 max-w-xs"
      >
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border text-left">
          <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Session Ended</p>
            <p className="text-xs text-muted-foreground">Walk completed successfully</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border text-left">
          <Eye className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Location Sharing Off</p>
            <p className="text-xs text-muted-foreground">Temporary sharing has stopped</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border text-left">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Guardian Notified</p>
            <p className="text-xs text-muted-foreground">Your guardian knows you arrived</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 w-full max-w-xs"
      >
        <Button onClick={() => navigate('/')} className="w-full h-12 rounded-xl text-base font-semibold">
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}