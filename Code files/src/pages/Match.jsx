import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Navigation, Shield, Users, ArrowRight, Loader2,
  ShieldCheck, MapPin, Clock, Star, Check, X, Bell,
  GraduationCap, Upload, Camera, BadgeCheck, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SOSButton from '../components/session/SOSButton';
import ActiveSession from '../components/session/ActiveSession';
import InviteDialog from '../components/companions/InviteDialog';
import MatchSuccess from '../components/companions/MatchSuccess';
import CompanionProfileDialog from '../components/companions/CompanionProfileDialog';

const MOCK_COMPANIONS = [
  { id: 1, name: 'Emma L.', trust_score: 96, route_overlap: 82, departure: 4, distance: 300, role: 'Verified Student', avatar: 'https://media.base44.com/images/public/69eca68c61c24f2affe6c0c0/d63975399_ac6e05d121467790b4146f245f418748.jpg' },
  { id: 2, name: 'Daniel W.', trust_score: 92, route_overlap: 74, departure: 7, distance: 450, role: 'Verified Student', avatar: 'https://media.base44.com/images/public/69eca68c61c24f2affe6c0c0/4baa6e298_8c7875986d35ae6d2806703700244032.jpg' },
  { id: 3, name: 'Sarah K.', trust_score: 89, route_overlap: 68, departure: 10, distance: 520, role: 'Verified Staff', avatar: 'https://media.base44.com/images/public/69eca68c61c24f2affe6c0c0/c7573ed66_185a13c5c119ade47707d6226bd002bf.jpg' },
  { id: 4, name: 'Michael R.', trust_score: 94, route_overlap: 91, departure: 3, distance: 180, role: 'Verified Student', avatar: 'https://media.base44.com/images/public/69eca68c61c24f2affe6c0c0/6a413404e_6b16e861a7cd708defff420c8bb2eac7.jpg' },
];

const SIMULATED_INVITER = {
  id: 99, name: 'Alex M.', verified: true, trust_score: 91, route_overlap: 78, departure: 5, role: 'Verified Student', avatar: 'https://media.base44.com/images/public/69eca68c61c24f2affe6c0c0/eb38044cb_7c57dfe0f80f91301e15689814049585.jpg'
};

const STEPS = ['setup', 'verify', 'companions', 'active'];

export default function Match() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState('setup');
  const [form, setForm] = useState({
    start_point: '',
    destination: '',
    guardian_mode: false,
    companion_matching: true,
  });
  // inviteStatus: { [id]: 'pending' | 'success' | 'failed' }
  const [inviteStatus, setInviteStatus] = useState({});
  const [activeTrip, setActiveTrip] = useState(null);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [matchedCompanion, setMatchedCompanion] = useState(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [verifyForm, setVerifyForm] = useState({ student_id: '', name: '', school: '', uploaded: false });
  const [verifying, setVerifying] = useState(false);

  const createTrip = useMutation({
    mutationFn: (data) => base44.entities.SafeTrip.create(data),
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setActiveTrip(trip);
      if (form.companion_matching) {
        setStep('companions');
        // Simulate receiving an invite 4s after entering companions step
        setTimeout(() => {
          setPendingInvite(SIMULATED_INVITER);
        }, 4000);
      } else {
        setStep('active');
      }
    },
  });

  const handleVerifySubmit = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      toast.success('Student identity verified!', { description: 'Welcome to SafePath companion matching' });
      handleCreateTrip();
    }, 1500);
  };

  const geocode = async (placeName) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1&countrycodes=cn&accept-language=zh`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' } });
    const data = await res.json();
    if (data.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    // fallback without country restriction
    const res2 = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`);
    const data2 = await res2.json();
    if (data2.length) return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
    return null;
  };

  const handleSetupNext = () => {
    if (!form.start_point || !form.destination) return;
    if (form.companion_matching) {
      setStep('verify');
    } else {
      handleCreateTrip();
    }
  };

  const handleCreateTrip = async () => {
    const [fromCoords, toCoords] = await Promise.all([
      geocode(form.start_point),
      geocode(form.destination),
    ]);
    createTrip.mutate({
      ...form,
      status: 'active',
      safety_status: 'normal',
      departure_time: new Date().toISOString(),
      estimated_duration_minutes: Math.floor(Math.random() * 10) + 8,
      ...(fromCoords && { start_lat: fromCoords.lat, start_lng: fromCoords.lng }),
      ...(toCoords && { dest_lat: toCoords.lat, dest_lng: toCoords.lng }),
    });
  };

  const invite = (companion) => {
    setInviteStatus(prev => ({ ...prev, [companion.id]: 'pending' }));
    // Simulate response after 2.5s — 60% success, 40% fail
    setTimeout(() => {
      const success = Math.random() > 0.4;
      setInviteStatus(prev => ({ ...prev, [companion.id]: success ? 'success' : 'failed' }));
      if (success) {
        setMatchedCompanion(companion);
      } else {
        toast.error(`${companion.name} declined your invitation.`, {
          description: 'Try inviting someone else on a similar route.',
        });
      }
    }, 2500);
  };

  const handleAcceptInvite = () => {
    const accepted = pendingInvite;
    setPendingInvite(null);
    setShowInviteDialog(false);
    setMatchedCompanion(accepted);
  };

  const handleDeclineInvite = () => {
    toast.info(`Invitation from ${pendingInvite.name} declined.`);
    setPendingInvite(null);
    setShowInviteDialog(false);
  };

  const handleLaterInvite = () => {
    toast('Reminder set — you can respond later.');
    setShowInviteDialog(false);
  };

  const startWalk = async () => {
    const acceptedIds = Object.entries(inviteStatus)
      .filter(([, s]) => s === 'success')
      .map(([id]) => Number(id));

    const outgoingCompanions = MOCK_COMPANIONS
      .filter(c => acceptedIds.includes(c.id))
      .map(c => ({ name: c.name, trust_score: c.trust_score, route_overlap: c.route_overlap, verified: true }));

    // Also include any inbound invite that was accepted
    const inboundCompanion = matchedCompanion && !acceptedIds.includes(matchedCompanion.id)
      ? [{ name: matchedCompanion.name, trust_score: matchedCompanion.trust_score, route_overlap: matchedCompanion.route_overlap, verified: true }]
      : [];

    const allCompanions = [...outgoingCompanions, ...inboundCompanion];

    if (activeTrip && allCompanions.length > 0) {
      await base44.entities.SafeTrip.update(activeTrip.id, { companions: allCompanions });
      setActiveTrip(prev => ({ ...prev, companions: allCompanions }));
    }
    setStep('active');
  };

  // Active session view
  if (step === 'active' && activeTrip) {
    return <ActiveSession trip={{ ...activeTrip, companions: activeTrip.companions || [] }} />;
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Match & Walk</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'setup' ? 'Plan your route and safety preferences' :
             step === 'verify' ? 'Confirm your student identity to enable safe matching' :
             'Choose verified companions for your walk'}
          </p>
        </div>
        {step === 'companions' && (
          <button
            onClick={() => pendingInvite && setShowInviteDialog(true)}
            className="relative w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {pendingInvite && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</span>
            )}
          </button>
        )}
      </motion.div>

      {/* Step Indicators */}
      <div className="flex items-center gap-1">
        {['Route', 'Verify', 'Match', 'Walk'].map((label, i) => {
          const stepKey = STEPS[i];
          const isCurrent = step === stepKey;
          const isDone = STEPS.indexOf(step) > i;
          return (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isCurrent ? 'bg-primary text-primary-foreground' :
                isDone ? 'bg-emerald-500/10 text-emerald-600' :
                'bg-muted text-muted-foreground'
              }`}>
                {isDone && <Check className="w-3 h-3" />}
                {label}
              </div>
              {i < 3 && <div className="flex-1 h-px bg-border" />}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Route Setup */}
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSetupNext(); }}>
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

            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Safety Options</span>
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
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={!form.start_point || !form.destination || createTrip.isPending}
              className="w-full h-12 text-base font-semibold rounded-xl mt-4"
            >
              {createTrip.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-5 h-5 mr-2" />
              )}
              {form.companion_matching ? 'Next: Find Companions' : 'Start Walk'}
            </Button>
            </form>

            <div className="flex justify-center pt-1">
              <SOSButton size="small" />
            </div>
          </motion.div>
        )}

        {/* STEP 2: Student Verification */}
        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Demo skip banner */}
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1">Demo mode — this verification step is for demonstration only</span>
              <button
                onClick={() => handleCreateTrip()}
                className="font-semibold underline underline-offset-2 whitespace-nowrap hover:text-amber-900 transition-colors"
              >
                Skip verification →
              </button>
            </div>

            {/* Verification card */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Student Identity Verification</span>
                  <Badge variant="outline" className="ml-auto text-xs text-primary border-primary/30 bg-primary/5">Required</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To ensure the safety of all walkers, please confirm your student status before each match. Your information is only used for this trip and will not be shared.
                </p>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <Input
                      placeholder="Enter your full name"
                      value={verifyForm.name}
                      onChange={(e) => setVerifyForm({ ...verifyForm, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Student ID</Label>
                    <Input
                      placeholder="Enter your student ID"
                      value={verifyForm.student_id}
                      onChange={(e) => setVerifyForm({ ...verifyForm, student_id: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">School / University</Label>
                    <Input
                      placeholder="Enter your school name"
                      value={verifyForm.school}
                      onChange={(e) => setVerifyForm({ ...verifyForm, school: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Upload student card */}
                <button
                  onClick={() => setVerifyForm({ ...verifyForm, uploaded: !verifyForm.uploaded })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all text-sm ${
                    verifyForm.uploaded
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'
                  }`}
                >
                  {verifyForm.uploaded ? (
                    <><BadgeCheck className="w-4 h-4" /><span className="font-medium">Student card uploaded</span></>
                  ) : (
                    <><Upload className="w-4 h-4" /><span>Upload student card photo (click to simulate)</span></>
                  )}
                </button>

                <Button
                  onClick={handleVerifySubmit}
                  disabled={!verifyForm.name || !verifyForm.student_id || !verifyForm.school || !verifyForm.uploaded || verifying}
                  className="w-full h-11 rounded-xl font-semibold"
                >
                  {verifying ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4 mr-2" />Submit Verification</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setStep('setup')} className="w-full rounded-xl">
              Back to Route Setup
            </Button>
          </motion.div>
        )}

        {/* STEP 3: Companion Matching */}
        {step === 'companions' && (
          <motion.div
            key="companions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-sm text-muted-foreground">
              Route: <span className="font-medium text-foreground">{form.start_point} → {form.destination}</span>
            </div>

            <div className="space-y-3">
              {MOCK_COMPANIONS.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Card className={`overflow-hidden transition-all ${inviteStatus[c.id] === 'success' ? 'border-primary/30 bg-primary/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedProfile(c)}
                              className="font-semibold text-sm text-foreground hover:text-primary hover:underline transition-colors text-left"
                            >
                              {c.name}
                            </button>
                            <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.role}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                              <MapPin className="w-2.5 h-2.5" /> {c.route_overlap}% overlap
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                              <Star className="w-2.5 h-2.5" /> {c.trust_score}/100
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                              <Clock className="w-2.5 h-2.5" /> in {c.departure} min
                            </Badge>
                          </div>
                          {inviteStatus[c.id] === 'pending' && <p className="text-xs text-muted-foreground mt-1">Waiting for response...</p>}
                          {inviteStatus[c.id] === 'failed' && <p className="text-xs text-destructive mt-1">Invitation declined</p>}
                          {inviteStatus[c.id] === 'success' && <p className="text-xs text-emerald-600 mt-1">Invitation accepted!</p>}
                        </div>
                        {(() => {
                          const status = inviteStatus[c.id];
                          if (status === 'pending') return (
                            <Button size="sm" variant="outline" disabled className="rounded-lg text-xs h-8 px-3 flex-shrink-0 text-muted-foreground min-w-[80px]">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Waiting
                            </Button>
                          );
                          if (status === 'success') return (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium min-w-[80px] justify-end">
                              <Check className="w-3.5 h-3.5" /> Accepted
                            </div>
                          );
                          if (status === 'failed') return (
                            <Button size="sm" variant="outline" onClick={() => invite(c)} className="rounded-lg text-xs h-8 px-3 flex-shrink-0 text-destructive border-destructive/30 min-w-[80px]">
                              <X className="w-3 h-3 mr-1" /> Retry
                            </Button>
                          );
                          return (
                            <Button size="sm" onClick={() => invite(c)} className="rounded-lg text-xs h-8 px-3 flex-shrink-0 min-w-[80px]">
                              Invite
                            </Button>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={() => setStep('setup')} className="flex-1 rounded-xl">
                Back
              </Button>
              <Button onClick={startWalk} className="flex-1 h-11 rounded-xl font-semibold">
                <Shield className="w-4 h-4 mr-2" />
                Start Walk
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Only verified community members are shown.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <InviteDialog
        invite={showInviteDialog ? pendingInvite : null}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
        onLater={handleLaterInvite}
        onViewProfile={() => toast(`${pendingInvite?.name} · Trust: ${pendingInvite?.trust_score}/100`, { description: `${pendingInvite?.route_overlap}% route overlap`, duration: 4000 })}
      />

      <CompanionProfileDialog
        companion={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

      <MatchSuccess
        match={matchedCompanion}
        onDismiss={() => setMatchedCompanion(null)}
      />
    </div>
  );
}