import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Send, Loader2, Plus, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../components/chat/MessageBubble';
import ConversationList from '../components/chat/ConversationList';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [view, setView] = useState('list');
  const scrollRef = useRef(null);
  const unsubRef = useRef(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const convs = await base44.agents.listConversations({ agent_name: 'safepath_companion' });
    setConversations(convs);
  };

  // Subscribe to active conversation
  useEffect(() => {
    if (unsubRef.current) unsubRef.current();
    if (!activeConv) return;

    unsubRef.current = base44.agents.subscribeToConversation(activeConv.id, (data) => {
      setMessages(data.messages || []);
    });

    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [activeConv?.id]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'safepath_companion',
      metadata: { name: 'New Safety Chat' },
    });
    setActiveConv(conv);
    setMessages(conv.messages || []);
    setView('chat');
    loadConversations();
  };

  const openConversation = async (conv) => {
    const fullConv = await base44.agents.getConversation(conv.id);
    setActiveConv(fullConv);
    setMessages(fullConv.messages || []);
    setView('chat');
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);
    await base44.agents.addMessage(activeConv, { role: 'user', content: msg });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (view === 'list') {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">SafePath Chat</h1>
            <p className="text-sm text-muted-foreground mt-1">Your AI safety companion</p>
          </div>
          <Button size="sm" onClick={createConversation} className="rounded-xl">
            <Plus className="w-4 h-4 mr-1" /> New Chat
          </Button>
        </div>
        <ConversationList
          conversations={conversations}
          onSelect={openConversation}
          onCreate={createConversation}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <button onClick={() => setView('list')} className="text-sm text-primary font-medium">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">SafePath</p>
            <p className="text-[10px] text-muted-foreground">AI Safety Companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Start a conversation with SafePath</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Ask about starting a trip, finding companions, or safety tips
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MessageBubble message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className="rounded-xl"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            size="icon"
            className="rounded-xl flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}