import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield, Eye, MapPin, Clock, Users, Lock, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const principles = [
  { icon: MapPin, title: 'Location Hidden Before Trips', desc: 'Your exact location is not shown to anyone before a trip is confirmed.' },
  { icon: Clock, title: 'Temporary Sharing Only', desc: 'Location sharing is temporary and ends automatically after arrival.' },
  { icon: Eye, title: 'You Control Sharing', desc: 'You can stop sharing your location at any time with one tap.' },
  { icon: Users, title: 'Verified Users Only', desc: 'Only verified community members can be matched with you as companions.' },
  { icon: Lock, title: 'Address Blurring', desc: 'Your home or dorm address can be blurred to protect your privacy.' },
  { icon: Shield, title: 'Not a Tracking App', desc: 'SafePath never tracks you without your active consent and session.' },
];

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Privacy & Trust</h1>
          <p className="text-sm text-muted-foreground">How SafePath protects you</p>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Privacy-First Design</p>
            <p className="text-xs text-muted-foreground mt-1">
              SafePath is designed with privacy-first protection. We never share your data
              without your explicit consent and all location sharing is temporary.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {principles.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <p.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}