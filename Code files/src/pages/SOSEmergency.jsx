import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle, Phone, MapPin, Shield, FileText,
  XCircle, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const emergencyActions = [
  { icon: Phone, label: 'Call Emergency Contact', description: 'Alert your primary contact', color: 'text-red-600' },
  { icon: MapPin, label: 'Share Current Location', description: 'Send location to trusted people', color: 'text-primary' },
  { icon: Shield, label: 'Contact Campus Security', description: 'Reach your campus security team', color: 'text-amber-600' },
  { icon: FileText, label: 'Save Evidence', description: 'Record current situation details', color: 'text-muted-foreground' },
];

export default function SOSEmergency() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setActivated(true);
    }
  }, [countdown]);

  const handleAction = (label) => {
    toast.info(`[Demo] ${label}`, {
      description: 'In a real deployment, this action would be executed.',
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      {/* SOS Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4 relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-destructive/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <AlertTriangle className="w-10 h-10 text-destructive relative z-10" />
        </div>
        <h1 className="text-2xl font-bold text-destructive">
          {activated ? 'SOS Mode Active' : `SOS Activating in ${countdown}...`}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
          If this is a real emergency, contact local emergency services immediately.
        </p>
      </motion.div>

      {/* Urgent Guidance */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-destructive mb-2">Immediate Safety Steps:</p>
          <ol className="text-sm text-foreground space-y-1.5 list-decimal list-inside">
            <li>Move to a public, well-lit area if possible</li>
            <li>Call local emergency services now</li>
            <li>Contact your emergency contact</li>
            <li>Stay on the line with someone you trust</li>
            <li>Do not go directly home if being followed</li>
          </ol>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        {emergencyActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <button
              onClick={() => handleAction(action.label)}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-destructive/20 hover:bg-destructive/5 transition-all text-left"
            >
              <action.icon className={`w-5 h-5 ${action.color} flex-shrink-0`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Demo Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>Demo Mode:</strong> In this prototype, emergency actions are simulated.
            In a real deployment, these would contact actual emergency services and guardians.
          </p>
        </CardContent>
      </Card>

      {/* Cancel */}
      <Button
        variant="outline"
        onClick={() => navigate('/')}
        className="w-full rounded-xl"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Cancel SOS
      </Button>
    </div>
  );
}