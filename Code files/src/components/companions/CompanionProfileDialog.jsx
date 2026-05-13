import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MapPin, Star, GraduationCap, Calendar, Phone, Mail, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const PROFILES = {
  1: {
    name: 'Emma L.',
    age: 21,
    major: 'Computer Science',
    year: '3rd Year',
    phone: '+1 (555) 012-3456',
    email: 'emma.l@university.edu',
    hometown: 'San Francisco, CA',
    bio: 'Love hiking and late-night study sessions. Always happy to walk with fellow students!',
    walks_completed: 47,
    rating: 4.9,
    member_since: 'Sep 2023',
    interests: ['Hiking', 'Photography', 'Coffee'],
  },
  2: {
    name: 'Daniel W.',
    age: 23,
    major: 'Mechanical Engineering',
    year: '4th Year',
    phone: '+1 (555) 234-5678',
    email: 'daniel.w@university.edu',
    hometown: 'Austin, TX',
    bio: 'Engineering student who commutes daily between the library and dorms. Reliable walking buddy!',
    walks_completed: 31,
    rating: 4.7,
    member_since: 'Jan 2024',
    interests: ['Music', 'Cycling', 'Gaming'],
  },
  3: {
    name: 'Sarah K.',
    age: 29,
    major: 'Administrative Staff',
    year: 'Staff Member',
    phone: '+1 (555) 345-6789',
    email: 'sarah.k@university.edu',
    hometown: 'Portland, OR',
    bio: 'Campus staff dedicated to student safety. I walk to and from the admin building daily.',
    walks_completed: 112,
    rating: 5.0,
    member_since: 'Mar 2022',
    interests: ['Yoga', 'Reading', 'Cooking'],
  },
  4: {
    name: 'Michael R.',
    age: 20,
    major: 'Biology',
    year: '2nd Year',
    phone: '+1 (555) 456-7890',
    email: 'michael.r@university.edu',
    hometown: 'Seattle, WA',
    bio: 'Pre-med student always heading to the science building. Very punctual — never late!',
    walks_completed: 28,
    rating: 4.8,
    member_since: 'Aug 2024',
    interests: ['Running', 'Chess', 'Volunteering'],
  },
};

export default function CompanionProfileDialog({ companion, onClose }) {
  if (!companion) return null;
  const profile = PROFILES[companion.id] || {};

  return (
    <Dialog open={!!companion} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-5 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white shadow">
              <img src={companion.avatar} alt={companion.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-foreground">{companion.name}</span>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{companion.role}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold">{profile.rating}</span>
                <span className="text-xs text-muted-foreground">· {profile.walks_completed} walks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Bio */}
          <p className="text-sm text-muted-foreground italic">"{profile.bio}"</p>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-foreground font-medium">{profile.major}</span>
              <span className="text-muted-foreground">· {profile.year}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{profile.hometown}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Member since {profile.member_since}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{profile.email}</span>
            </div>
          </div>

          {/* Interests */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interests</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests?.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: 'Trust Score', value: `${companion.trust_score}/100` },
              { label: 'Route Overlap', value: `${companion.route_overlap}%` },
              { label: 'Departs In', value: `${companion.departure} min` },
            ].map(stat => (
              <div key={stat.label} className="bg-muted rounded-xl p-2.5 text-center">
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}