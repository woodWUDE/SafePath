import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Phone, Plus, Trash2, Star, Shield, Bell, AlertTriangle, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const PERMISSIONS = [
  { key: 'sos_alerts', label: 'SOS Alerts', icon: AlertTriangle },
  { key: 'arrival_notifications', label: 'Arrival Notifications', icon: Bell },
  { key: 'guardian_trips', label: 'Active Trip Viewing', icon: Eye },
  { key: 'abnormal_alerts', label: 'Abnormal Situation Alerts', icon: Shield },
];

export default function EmergencyContacts() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', relationship: '', phone: '', email: '',
    permissions: ['sos_alerts', 'arrival_notifications'],
    is_primary: false,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.EmergencyContact.list('-created_date'),
    initialData: [],
  });

  const createContact = useMutation({
    mutationFn: (data) => base44.entities.EmergencyContact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setOpen(false);
      setForm({ name: '', relationship: '', phone: '', email: '', permissions: ['sos_alerts', 'arrival_notifications'], is_primary: false });
      toast.success('Emergency contact added');
    },
  });

  const deleteContact = useMutation({
    mutationFn: (id) => base44.entities.EmergencyContact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact removed');
    },
  });

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Emergency Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">People who can help in emergencies</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Name</Label>
                <Input placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Relationship</Label>
                <Input placeholder="e.g., Roommate, Parent" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="mb-2 block">Permissions</Label>
                <div className="space-y-2">
                  {PERMISSIONS.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        checked={form.permissions.includes(key)}
                        onCheckedChange={() => togglePermission(key)}
                      />
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.is_primary} onCheckedChange={(v) => setForm({ ...form, is_primary: v })} />
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-sm">Primary contact</span>
              </div>
              <Button
                onClick={() => createContact.mutate(form)}
                disabled={!form.name || !form.relationship || createContact.isPending}
                className="w-full rounded-xl"
              >
                Save Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <Phone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No emergency contacts yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Add someone you trust</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact, i) => (
            <motion.div key={contact.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {contact.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{contact.name}</span>
                          {contact.is_primary && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                        {contact.phone && <p className="text-xs text-muted-foreground mt-0.5">{contact.phone}</p>}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(contact.permissions || []).map(p => (
                            <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0">
                              {p.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContact.mutate(contact.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-3 flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            SafePath will not allow long-term location tracking.
            Emergency contacts can only see your location during active trips.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}