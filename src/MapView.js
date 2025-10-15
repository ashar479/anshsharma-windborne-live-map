import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchCurrentSnapshot } from './api/windborne';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView() {
  const center = useMemo(() => [20, 0], []);
  const [points, setPoints] = useState(null);
  const [err, setErr] = useState(null);

  async function load() {
    setErr(null);
    try {
      const pts = await fetchCurrentSnapshot();
      console.log('WindBorne 00.json loaded:', pts.slice(0, 5));
      setPoints(pts);
    } catch (e) {
      console.error('WindBorne fetch failed:', e);
      setErr(e.message || 'Failed to load current positions.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ height: '80vh', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Array.isArray(points) &&
          points.map((p, idx) => (
            <Marker
              key={p.id || idx}
              position={[p.lat, p.lon]}
              icon={markerIcon}
            >
              <Popup>
                <div style={{ fontSize: 12 }}>
                  {p.id && (
                    <div>
                      <strong>ID:</strong> {p.id}
                    </div>
                  )}
                  {p.t && (
                    <div>
                      <strong>Time (UTC):</strong>{' '}
                      {new Date(p.t * 1000).toUTCString()}
                    </div>
                  )}
                  {Number.isFinite(p.alt) && (
                    <div>
                      <strong>Alt:</strong> {p.alt} m
                    </div>
                  )}
                  <div>
                    <strong>Pos:</strong> {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 12,
        }}
      >
        {err ? (
          <span style={{ color: '#b91c1c' }}>{err}</span>
        ) : points ? (
          <span>Loaded {points.length} balloons</span>
        ) : (
          <span>Loading…</span>
        )}
      </div>
    </div>
  );
}
