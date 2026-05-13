import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafetyStatusCard from '../components/home/SafetyStatusCard';
import QuickActions from '../components/home/QuickActions';
import RecentTrips from '../components/home/RecentTrips';

export default function Home() {
  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.SafeTrip.list('-created_date', 5),
    initialData: [],
  });

  const activeTrip = trips.find(t => t.status === 'active');
  const safetyStatus = activeTrip ? 'active' : 'safe';

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img src="https://media.base44.com/images/public/69eca68c61c24f2affe6c0c0/5844e88db_12264f71018fa419a92ec2e5d3222c4e.jpg" alt="SafePath" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">SafePath</h1>
            <p className="text-xs text-muted-foreground">Your trusted walking companion</p>
          </div>
        </div>
        <Link
          to="/chat"
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all"
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
        </Link>
      </motion.div>

      {/* Safety Status */}
      <SafetyStatusCard status={safetyStatus} />

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* Recent Trips */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Trips
        </h2>
        <RecentTrips trips={trips} />
      </div>
    </div>
  );
}