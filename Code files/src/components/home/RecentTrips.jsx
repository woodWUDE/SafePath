import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusBadge = {
  completed: { label: 'Completed', variant: 'outline', className: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
  active: { label: 'Active', variant: 'outline', className: 'text-primary border-primary/20 bg-primary/5' },
  cancelled: { label: 'Cancelled', variant: 'outline', className: 'text-muted-foreground border-border' },
  sos: { label: 'SOS', variant: 'outline', className: 'text-red-600 border-red-200 bg-red-50' },
  planning: { label: 'Planning', variant: 'outline', className: 'text-amber-600 border-amber-200 bg-amber-50' },
};

export default function RecentTrips({ trips = [] }) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No recent trips</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start your first safe walk</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trips.slice(0, 3).map((trip, i) => {
        const badge = statusBadge[trip.status] || statusBadge.planning;
        return (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={trip.status === 'active' ? `/session?trip=${trip.id}` : `/trip/${trip.id}`}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/20 transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {trip.start_point} → {trip.destination}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {trip.created_date ? format(new Date(trip.created_date), 'MMM d, h:mm a') : 'Just now'}
                </p>
              </div>
              <Badge variant={badge.variant} className={badge.className}>
                {badge.label}
              </Badge>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}