import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

// Custom Leaflet marker icons with colored pins
const createCustomIcon = (color = '#6366f1') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const STATUS_COLORS = {
  REPORTED: '#f59e0b',
  ASSIGNED: '#3b82f6',
  IN_PROGRESS: '#a855f7',
  RESOLUTION_SUBMITTED: '#06b6d4',
  VERIFICATION_PENDING: '#f97316',
  CLOSED: '#10b981',
  REOPENED: '#f43f5e'
};

function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function MapPicker({ selectedPosition, onLocationSelect, issues = [], showWards = true, height = "450px" }) {
  const [geojson, setGeojson] = useState(null);

  // Jaipur Center Default Coordinates
  const center = [26.8800, 75.8000];

  useEffect(() => {
    if (showWards) {
      api.get('/wards/geojson')
        .then(res => setGeojson(res.data))
        .catch(err => console.error('Failed to load wards GeoJSON:', err));
    }
  }, [showWards]);

  const onEachWardFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0; color: #f43f5e; font-weight: bold; font-size: 14px;">${p.name || 'Ward'}</h4>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 11px;">Zone: <strong>${p.zone || 'Jaipur'}</strong></p>
          <p style="margin: 4px 0 0; color: #fbbf24; font-size: 12px;"><strong>Parshad:</strong> ${p.parshad_name || 'N/A'}</p>
          <p style="margin: 2px 0 0; color: #38bdf8; font-size: 11px;">Phone: ${p.parshad_phone || 'N/A'} (${p.party || ''})</p>
          <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 11px;">${p.description || ''}</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
    layer.setStyle({
      fillColor: '#6366f1',
      weight: 2,
      opacity: 0.8,
      color: '#818cf8',
      fillOpacity: 0.15
    });
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.35, weight: 3 });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.15, weight: 2 });
      }
    });
  };

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden shadow-2xl relative border border-slate-800">
      <MapContainer center={selectedPosition ? [selectedPosition.lat, selectedPosition.lng] : center} zoom={12} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onLocationSelect && <ClickHandler onLocationSelect={onLocationSelect} />}

        {/* Selected Point Marker */}
        {selectedPosition && (
          <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={createCustomIcon('#f43f5e')}>
            <Popup>
              <div className="text-xs font-semibold text-slate-200">
                Selected Coordinates:<br />
                Lat: {selectedPosition.lat.toFixed(5)}, Lng: {selectedPosition.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Issue Pins */}
        {issues.map(issue => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={createCustomIcon(STATUS_COLORS[issue.status] || '#6366f1')}
          >
            <Popup>
              <div className="text-xs font-sans p-1">
                <div className="font-bold text-indigo-300 text-sm">{issue.title}</div>
                <div className="text-slate-300 mt-1">{issue.address || 'Jaipur'}</div>
                <div className="mt-1 text-[11px] text-amber-400">Ward: {issue.ward_name || 'Jaipur Ward'}</div>
                <div className="mt-1 font-semibold" style={{ color: STATUS_COLORS[issue.status] }}>Status: {issue.status}</div>
                <a href={`/issues/${issue.id}`} className="mt-2 inline-block px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">
                  View Timeline & Details &rarr;
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Ward GeoJSON Polygons */}
        {showWards && geojson && (
          <GeoJSON data={geojson} onEachFeature={onEachWardFeature} />
        )}
      </MapContainer>
    </div>
  );
}
