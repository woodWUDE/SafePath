import React from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig = {
  safe: {
    icon: ShieldCheck,
    label: 'All Clear',
    subtitle: 'No active safety concerns',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    iconColor: 'text-emerald-500',
    ringColor: 'ring-emerald-500/20',
  },
  active: {
    icon: Shield,
    label: 'Walk Active',
    subtitle: 'Guardian mode monitoring',
    gradient: 'from-primary/10 to-primary/5',
    iconColor: 'text-primary',
    ringColor: 'ring-primary/20',
  },
  alert: {
    icon: ShieldAlert,
    label: 'Alert Active',
    subtitle: 'Safety concern detected',
    gradient: 'from-amber-500/10 to-amber-600/5',
    iconColor: 'text-amber-500',
    ringColor: 'ring-amber-500/20',
  },
};

export default function SafetyStatusCard({ status = 'safe' }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} p-5 ring-1 ${config.ringColor}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-card/60 backdrop-blur ${config.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{config.label}</p>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}