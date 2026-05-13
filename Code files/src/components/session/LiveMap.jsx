import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function LiveMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [locationError, setLocationError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for Leaflet to be available
    if (!window.L) {
      setLocationError(true);
      setLoading(false);
      return;
    }

    const L = window.L;

    // Default to a campus-like location
    const defaultCoords = [51.505, -0.09];

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false,
    }).setView(defaultCoords, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom marker icon
    const icon = L.divIcon({
      html: `<div style="
        width:20px;height:20px;border-radius:50%;
        background:#4f6ef7;border:3px solid #fff;
        box-shadow:0 2px 8px rgba(79,110,247,0.5);
      "></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker(defaultCoords, { icon }).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;
    setLoading(false);

    // Try to get real location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 17);
          marker.setLatLng([latitude, longitude]);
        },
        () => {
          // Silently fall back to default location
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );

      // Watch position for live updates
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          marker.setLatLng([latitude, longitude]);
          map.panTo([latitude, longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        map.remove();
      };
    }

    return () => {
      map.remove();
    };
  }, []);

  if (locationError) {
    return (
      <div className="h-[200px] rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm gap-2">
        <MapPin className="w-4 h-4" />
        Map unavailable
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 rounded-xl bg-muted flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <div
        ref={mapRef}
        className="leaflet-map-container"
        style={{ height: 200 }}
      />
      <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-muted-foreground flex items-center gap-1 shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live Location
      </div>
    </div>
  );
}