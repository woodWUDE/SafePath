import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MapPin, Star, Clock, User, Check, X, Clock3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InviteDialog({ invite, onAccept, onDecline, onLater, onViewProfile }) {
  if (!invite) return null;

  return (
    <Dialog open={!!invite} onOpenChange={() => onLater()}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">Companion Request</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Sender info */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              {invite.avatar
                ? <img src={invite.avatar} alt={invite.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{invite.name.charAt(0)}</div>
              }
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-semibold text-lg text-foreground">{invite.name}</span>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{invite.role}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <MapPin className="w-3 h-3" /> {invite.route_overlap}% route overlap
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Star className="w-3 h-3" /> Trust {invite.trust_score}/100
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="w-3 h-3" /> Departs in {invite.departure} min
              </Badge>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground bg-muted rounded-xl px-4 py-3">
            <span className="font-medium text-foreground">{invite.name}</span> wants to walk with you along a similar route.
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewProfile}
              className="rounded-xl flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> View Profile
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDecline}
              className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Decline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLater}
              className="rounded-xl text-muted-foreground flex items-center gap-1.5"
            >
              <Clock3 className="w-3.5 h-3.5" /> Later
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}