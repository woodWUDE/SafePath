import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin, Clock, Shield, ShieldCheck, CheckCircle2,
  Phone, XCircle, Navigation, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import SOSButton from './SOSButton';
import LiveMap from './LiveMap';

export default function ActiveSession({ trip }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const updateTrip = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SafeTrip.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });

  const confirmArrival = () => {
    updateTrip.mutate({
      id: trip.id,
      data: { status: 'completed', arrival_confirmed: true, safety_status: 'normal' },
    });
    navigate('/arrival');
  };

  const endWalk = () => {
    updateTrip.mutate({
      id: trip.id,
      data: { status: 'cancelled' },
    });
    navigate('/');
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const est = trip.estimated_duration_minutes || 12;
  const progress = Math.min((elapsed / 60 / est) * 100, 100);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-semibold mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Walk Active
        </div>
        <h1 className="text-lg font-bold text-foreground">{trip.start_point} → {trip.destination}</h1>
      </motion.div>

      {/* Live Map */}
      <LiveMap />

      {/* Progress */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Elapsed: {formatTime(elapsed)}</span>
            </div>
            <span className="text-sm font-medium text-primary">~{est} min</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {trip.start_point}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {trip.destination} <MapPin className="w-3 h-3" />
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className={`w-5 h-5 mx-auto mb-1 ${trip.guardian_mode ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-xs font-medium">{trip.guardian_mode ? 'Guardian Active' : 'Guardian Off'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-xs font-medium">Route Normal</p>
          </CardContent>
        </Card>
      </div>

      {/* Companions */}
      {trip.companions && trip.companions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Walking With</span>
            </div>
            {trip.companions.map((c, i) => (
              <div key={i} className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {c.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Trust: {c.trust_score}/100</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={confirmArrival} className="w-full h-12 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          I Have Arrived Safely
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate('/contacts')} className="rounded-xl">
            <Phone className="w-4 h-4 mr-1" /> Contact Guardian
          </Button>
          <Button variant="outline" onClick={endWalk} className="rounded-xl text-muted-foreground">
            <XCircle className="w-4 h-4 mr-1" /> End Walk
          </Button>
        </div>
      </div>

      {/* SOS */}
      <div className="flex justify-center pt-2">
        <SOSButton />
      </div>
    </div>
  );
}