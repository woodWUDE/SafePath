import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, ShieldCheck, MapPin, Clock, Star, Check, Search, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import InviteDialog from '../components/companions/InviteDialog';
import MatchSuccess from '../components/companions/MatchSuccess';

const MOCK_COMPANIONS = [
  { id: 1, name: 'Emma L.', verified: true, trust_score: 96, route_overlap: 82, departure: 4, distance: 300, role: 'Verified Student' },
  { id: 2, name: 'Daniel W.', verified: true, trust_score: 92, route_overlap: 74, departure: 7, distance: 450, role: 'Verified Student' },
  { id: 3, name: 'Sarah K.', verified: true, trust_score: 89, route_overlap: 68, departure: 10, distance: 520, role: 'Verified Staff' },
  { id: 4, name: 'Michael R.', verified: true, trust_score: 94, route_overlap: 91, departure: 3, distance: 180, role: 'Verified Student' },
];

const SIMULATED_INVITER = {
  id: 99, name: 'Alex M.', verified: true, trust_score: 91, route_overlap: 78, departure: 5, role: 'Verified Student'
};

// invite status: null | 'pending' | 'success' | 'failed'
export default function Companions() {
  const [inviteStatus, setInviteStatus] = useState({}); // { [id]: 'pending' | 'success' | 'failed' }
  const [search, setSearch] = useState('');
  const [pendingInvite, setPendingInvite] = useState(null);
  const [matchedCompanion, setMatchedCompanion] = useState(null);
  const hasShownInvite = useRef(false);

  // Simulate receiving an invite 4s after this page mounts
  useEffect(() => {
    if (hasShownInvite.current) return;
    hasShownInvite.current = true;
    const timer = setTimeout(() => {
      setPendingInvite(SIMULATED_INVITER);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = MOCK_COMPANIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const invite = (companion) => {
    // Set to pending
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

  const handleAccept = () => {
    const accepted = pendingInvite;
    setPendingInvite(null);
    setMatchedCompanion(accepted);
  };

  const handleDecline = () => {
    toast.info(`Invitation from ${pendingInvite.name} declined.`);
    setPendingInvite(null);
  };

  const handleLater = () => {
    toast('Reminder set — you can respond later.');
    setPendingInvite(null);
  };

  const handleViewProfile = () => {
    toast(`${pendingInvite.name} · ${pendingInvite.role} · Trust score: ${pendingInvite.trust_score}/100`, {
      description: `Route overlap: ${pendingInvite.route_overlap}% · Departs in ${pendingInvite.departure} min`,
      duration: 5000,
    });
  };

  const renderInviteButton = (c) => {
    const status = inviteStatus[c.id];

    if (status === 'pending') {
      return (
        <Button size="sm" variant="outline" disabled className="rounded-xl text-muted-foreground min-w-[96px]">
          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Waiting...
        </Button>
      );
    }
    if (status === 'success') {
      return (
        <Button size="sm" variant="outline" disabled className="rounded-xl text-emerald-600 min-w-[96px]">
          <Check className="w-3.5 h-3.5 mr-1" /> Accepted!
        </Button>
      );
    }
    if (status === 'failed') {
      return (
        <Button size="sm" variant="outline" onClick={() => invite(c)} className="rounded-xl text-destructive border-destructive/30 min-w-[96px]">
          <X className="w-3.5 h-3.5 mr-1" /> Retry
        </Button>
      );
    }
    return (
      <Button size="sm" onClick={() => invite(c)} className="rounded-xl min-w-[96px]">
        <Users className="w-3.5 h-3.5 mr-1" /> Invite
      </Button>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground">Find Companions</h1>
        <p className="text-sm text-muted-foreground mt-1">Verified members with similar routes</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search companions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={`overflow-hidden transition-all ${inviteStatus[c.id] === 'success' ? 'border-emerald-400/40 bg-emerald-500/5' : inviteStatus[c.id] === 'failed' ? 'border-destructive/20' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{c.name}</span>
                      {c.verified && <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.role}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs gap-1">
                        <MapPin className="w-3 h-3" /> {c.route_overlap}% overlap
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Star className="w-3 h-3" /> {c.trust_score}/100
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Clock className="w-3 h-3" /> in {c.departure} min
                      </Badge>
                    </div>

                    {/* Status message under badges */}
                    <AnimatePresence>
                      {inviteStatus[c.id] === 'pending' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-muted-foreground mt-1.5"
                        >
                          Waiting for response...
                        </motion.p>
                      )}
                      {inviteStatus[c.id] === 'failed' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-xs text-destructive mt-1.5"
                        >
                          Invitation declined
                        </motion.p>
                      )}
                      {inviteStatus[c.id] === 'success' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-xs text-emerald-600 mt-1.5"
                        >
                          Invitation accepted!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  {renderInviteButton(c)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Only verified community members are shown.
        <br />Companions are matched by route similarity and trust score.
      </p>

      <InviteDialog
        invite={pendingInvite}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onLater={handleLater}
        onViewProfile={handleViewProfile}
      />

      <MatchSuccess
        match={matchedCompanion}
        onDismiss={() => setMatchedCompanion(null)}
      />
    </div>
  );
}