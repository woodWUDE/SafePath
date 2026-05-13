import React from 'react';
import { MessageCircle, ChevronRight, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ConversationList({ conversations = [], onSelect, onCreate }) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Start a chat with SafePath to plan safe walks, find companions, or get safety guidance.
        </p>
        <button
          onClick={onCreate}
          className="mt-4 text-sm text-primary font-medium hover:underline"
        >
          Start your first chat →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv, i) => (
        <motion.button
          key={conv.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(conv)}
          className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/20 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {conv.metadata?.name || 'Safety Chat'}
            </p>
            <p className="text-xs text-muted-foreground">
              {conv.updated_date ? format(new Date(conv.updated_date), 'MMM d, h:mm a') : 'New'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </motion.button>
      ))}
    </div>
  );
}