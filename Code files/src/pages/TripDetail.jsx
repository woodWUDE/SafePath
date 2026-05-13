import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Users, Shield, CheckCircle2, MapPin, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusStyles = {
  completed: { label: 'Completed', className: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
  active: { label: 'Active', className: 'text-primary border-primary/20 bg-primary/5' },
  cancelled: { label: 'Cancelled', className: 'text-muted-foreground border-border' },
  sos: { label: 'SOS', className: 'text-red-600 border-red-200 bg-red-50' },
  planning: { label: 'Planning', className: 'text-amber-600 border-amber-200 bg-amber-50' },
};

async function geocode(placeName) {
  // Try with Chinese locale and countrycodes=cn first
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1&countrycodes=cn&accept-language=zh`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' } });
  const data = await res.json();
  if (data.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };

  // Fallback: try without country restriction
  const url2 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;
  const res2 = await fetch(url2, { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8' } });
  const data2 = await res2.json();
  if (data2.length) return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };

  throw new Error(`Cannot geocode: ${placeName}`);
}

async function fetchWalkingRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes.length) throw new Error('No route found');
  // geojson coordinates are [lng, lat]
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

function TripMap({ trip }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy previous instance if re-running
    if (instanceRef.current) {
      instanceRef.current.remove();
      instanceRef.current = null;
    }

    const L = window.L;
    if (!L) { setStatus('error'); return; }

    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
    instanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const startIcon = L.divIcon({
      html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
      className: '', iconAnchor: [7, 7],
    });
    const endIcon = L.divIcon({
      html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
      className: '', iconAnchor: [7, 7],
    });

    let cancelled = false;

    (async () => {
      try {
        // Use stored coordinates if available, otherwise fall back to geocoding
        let from, to;
        if (trip.start_lat && trip.start_lng && trip.dest_lat && trip.dest_lng) {
          from = { lat: trip.start_lat, lng: trip.start_lng };
          to = { lat: trip.dest_lat, lng: trip.dest_lng };
        } else {
          [from, to] = await Promise.all([
            geocode(trip.start_point),
            geocode(trip.destination),
          ]);
        }
        if (cancelled) return;

        let routePoints;
        try {
          routePoints = await fetchWalkingRoute(from, to);
        } catch {
          routePoints = [[from.lat, from.lng], [to.lat, to.lng]];
        }
        if (cancelled) return;

        const polyline = L.polyline(routePoints, { color: '#ef4444', weight: 5, opacity: 0.9 }).addTo(map);
        L.marker([from.lat, from.lng], { icon: startIcon }).bindPopup(trip.start_point).addTo(map);
        L.marker([to.lat, to.lng], { icon: endIcon }).bindPopup(trip.destination).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        setStatus('ok');
      } catch (e) {
        // Geocode failed - show map centered on China with error note
        console.warn('TripMap geocode failed:', e.message);
        if (!cancelled) {
          map.setView([31.3, 121.0], 11);
          setStatus('geocode_failed');
        }
      }
    })();

    return () => {
      cancelled = true;
      map.remove();
      instanceRef.current = null;
    };
  }, [trip.start_point, trip.destination, trip.start_lat, trip.dest_lat]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: 260 }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm gap-2">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">正在加载路线…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-muted-foreground">
          无法加载地图
        </div>
      )}
      {status === 'geocode_failed' && (
        <div className="absolute top-2 right-2 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs text-amber-700 z-[1000] max-w-[60%] text-right">
          地点无法精确定位，请确认地名是否完整
        </div>
      )}
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs shadow z-[1000]">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
        <span className="truncate">{trip.start_point}</span>
        <span className="text-muted-foreground flex-shrink-0">→</span>
        <span className="inline-block w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
        <span className="truncate">{trip.destination}</span>
      </div>
    </div>
  );
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const trips = await base44.entities.SafeTrip.list('-created_date', 100);
      return trips.find(t => t.id === id) || null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-10 text-center">
        <p className="text-muted-foreground">Trip not found.</p>
        <Button variant="outline" onClick={() => navigate('/history')} className="mt-4">Back</Button>
      </div>
    );
  }

  const style = statusStyles[trip.status] || statusStyles.planning;
  const duration = trip.estimated_duration_minutes || '—';

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-5">
      {/* Back */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </motion.div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{trip.start_point} → {trip.destination}</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {trip.created_date ? format(new Date(trip.created_date), 'MMMM d, yyyy · h:mm a') : ''}
            </p>
          </div>
          <Badge variant="outline" className={style.className}>{style.label}</Badge>
        </div>
      </motion.div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <TripMap trip={trip} />
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-base font-bold">{duration} min</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-base font-bold">{trip.companions?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Companions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-base font-bold">{trip.guardian_mode ? 'On' : 'Off'}</p>
              <p className="text-xs text-muted-foreground">Guardian</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Companions */}
      {trip.companions && trip.companions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Walking Companions</span>
              </div>
              {trip.companions.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {c.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Trust: {c.trust_score}/100 · {c.route_overlap}% route overlap</p>
                  </div>
                  {c.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Arrival confirmation */}
      {trip.arrival_confirmed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Safe arrival confirmed
          </div>
        </motion.div>
      )}
    </div>
  );
}