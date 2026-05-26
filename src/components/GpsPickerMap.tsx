'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

interface GpsPickerMapProps {
  selectedCoordinates: GpsCoordinates | null;
  onSelect: (coords: GpsCoordinates) => void;
}

const DEFAULT_CENTER: [number, number] = [46.603354, 1.888334];

export default function GpsPickerMap({ selectedCoordinates, onSelect }: GpsPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: selectedCoordinates
        ? [selectedCoordinates.latitude, selectedCoordinates.longitude]
        : DEFAULT_CENTER,
      zoom: selectedCoordinates ? 14 : 6,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', (event: L.LeafletMouseEvent) => {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    });

    mapRef.current = map;

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onSelect, selectedCoordinates]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedCoordinates) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const position = L.latLng(selectedCoordinates.latitude, selectedCoordinates.longitude);
    map.setView(position, Math.max(map.getZoom(), 14));

    if (!markerRef.current) {
      markerRef.current = L.circleMarker(position, {
        radius: 8,
        weight: 2,
        color: '#1a96cc',
        fillColor: '#2eade4',
        fillOpacity: 0.9,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(position);
    }
  }, [selectedCoordinates]);

  return <div ref={containerRef} className="terrainGpsMap" />;
}
