import React from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
  {
    icon: Users,
    label: 'Match & Walk',
    description: 'Plan route & find verified companions',
    path: '/match',
    gradient: 'from-primary/10 to-blue-500/10',
    iconBg: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: AlertTriangle,
    label: 'SOS',
    description: 'Emergency help & contacts',
    path: '/sos',
    gradient: 'from-red-500/10 to-rose-500/10',
    iconBg: 'bg-red-500/10 text-red-600',
    border: 'hover:border-red-300/50',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link
            to={action.path}
            className={`flex flex-col gap-3 p-5 bg-gradient-to-br ${action.gradient} rounded-2xl border border-border ${action.border} hover:shadow-md transition-all duration-200`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.iconBg}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}