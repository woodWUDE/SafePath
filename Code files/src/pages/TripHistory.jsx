import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Shield, Users, CheckCircle2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusStyles = {
  completed: { label: 'Completed', className: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
  active: { label: 'Active', className: 'text-primary border-primary/20 bg-primary/5' },
  cancelled: { label: 'Cancelled', className: 'text-muted-foreground border-border' },
  sos: { label: 'SOS', className: 'text-red-600 border-red-200 bg-red-50' },
  planning: { label: 'Planning', className: 'text-amber-600 border-amber-200 bg-amber-50' },
};

export default function TripHistory() {
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.SafeTrip.list('-created_date', 20),
    initialData: [],
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Trip History</h1>
        <p className="text-sm text-muted-foreground mt-1">Your past walking sessions</p>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No trips yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Your completed walks will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip, i) => {
            const style = statusStyles[trip.status] || statusStyles.planning;
            return (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/trip/${trip.id}`} className="block">
                <Card className="hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">{trip.start_point} → {trip.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={style.className}>{style.label}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {trip.created_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(trip.created_date), 'MMM d, h:mm a')}
                        </span>
                      )}
                      {trip.guardian_mode && (
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Guardian
                        </span>
                      )}
                      {trip.companions && trip.companions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {trip.companions.length} companion{trip.companions.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {trip.arrival_confirmed && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Arrived safely
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}