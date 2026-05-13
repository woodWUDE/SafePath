import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin, Navigation, Clock, Shield, Users, CheckCircle2,
  ArrowRight, Loader2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SOSButton from '../components/session/SOSButton';
import ActiveSession from '../components/session/ActiveSession';

export default function WalkingSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const guardianDefault = urlParams.get('guardian') === 'true';

  const [step, setStep] = useState('setup');
  const [form, setForm] = useState({
    start_point: '',
    destination: '',
    guardian_mode: guardianDefault,
    companion_matching: false,
  });
  const [activeTrip, setActiveTrip] = useState(null);

  const createTrip = useMutation({
    mutationFn: (data) => base44.entities.SafeTrip.create(data),
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setActiveTrip(trip);
      setStep('active');
    },
  });

  const handleStart = () => {
    if (!form.start_point || !form.destination) return;
    createTrip.mutate({
      ...form,
      status: 'active',
      safety_status: 'normal',
      departure_time: new Date().toISOString(),
      estimated_duration_minutes: Math.floor(Math.random() * 10) + 8,
    });
  };

  if (step === 'active' && activeTrip) {
    return <ActiveSession trip={activeTrip} />;
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground">Start Safe Walk</h1>
        <p className="text-sm text-muted-foreground mt-1">Plan your route and safety preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Route */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Route</span>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Starting Point</Label>
                <Input
                  placeholder="e.g., Library, Building A"
                  value={form.start_point}
                  onChange={(e) => setForm({ ...form, start_point: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Destination</Label>
                <Input
                  placeholder="e.g., Dormitory, Parking Lot"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Options */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Safety Options</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Guardian Mode</p>
                <p className="text-xs text-muted-foreground">Share route with a guardian</p>
              </div>
              <Switch
                checked={form.guardian_mode}
                onCheckedChange={(v) => setForm({ ...form, guardian_mode: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Find Companion</p>
                <p className="text-xs text-muted-foreground">Match with verified walkers</p>
              </div>
              <Switch
                checked={form.companion_matching}
                onCheckedChange={(v) => setForm({ ...form, companion_matching: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={!form.start_point || !form.destination || createTrip.isPending}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          {createTrip.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Shield className="w-5 h-5 mr-2" />
          )}
          Start Safe Walk
        </Button>

        {/* SOS */}
        <div className="flex justify-center pt-2">
          <SOSButton size="small" />
        </div>
      </motion.div>
    </div>
  );
}