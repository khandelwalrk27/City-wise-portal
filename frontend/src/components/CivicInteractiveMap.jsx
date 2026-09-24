import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import StatusBadge from './StatusBadge';
import { 
  MapPin, 
  Layers, 
  AlertTriangle, 
  CloudRain, 
  Wind, 
  Zap, 
  Car, 
  Activity, 
  ShieldAlert, 
  Info, 
  ChevronRight,
  Sparkles,
  Maximize2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

// Controller to smoothly pan/zoom map on alert clicks
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
}

// Marker Icon Creators
const createComplaintIcon = (status) => {
  const colors = {
    REPORTED: '#d97706',
    ASSIGNED: '#2563eb',
    IN_PROGRESS: '#7c3aed',
    VERIFICATION_PENDING: '#ea580c',
    CLOSED: '#059669',
    REOPENED: '#dc2626'
  };
  const color = colors[status] || '#4f46e5';
  return L.divIcon({
    className: 'custom-civic-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; items-center; justify-content: center; color: white; font-size: 11px; font-weight: bold; line-height: 20px; text-align: center;">!</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createWeatherAlertIcon = (severity) => {
  const bg = severity === 'HIGH' ? '#dc2626' : '#d97706';
  return L.divIcon({
    className: 'custom-weather-marker',
    html: `<div style="background-color: ${bg}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 13px;">⛈️</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createAqiIcon = (aqi, category) => {
  let borderColor = '#059669';
  let bgColor = '#ecfdf5';
  let textColor = '#065f46';
  if (category === 'MODERATE') {
    borderColor = '#d97706';
    bgColor = '#fffbeb';
    textColor = '#92400e';
  } else if (category === 'POOR' || aqi > 150) {
    borderColor = '#dc2626';
    bgColor = '#fef2f2';
    textColor = '#991b1b';
  }
  return L.divIcon({
    className: 'custom-aqi-marker',
    html: `<div style="background-color: ${bgColor}; border: 1.5px solid ${borderColor}; color: ${textColor}; padding: 2px 7px; border-radius: 8px; font-size: 10.5px; font-weight: 800; box-shadow: 0 2px 5px rgba(0,0,0,0.18); white-space: nowrap;">🌫️ ${aqi} AQI</div>`,
    iconSize: [68, 22],
    iconAnchor: [34, 11]
  });
};

const createTrafficIcon = (delayText, severity) => {
  const bg = severity === 'HIGH' ? '#b91c1c' : '#c2410c';
  return L.divIcon({
    className: 'custom-traffic-marker',
    html: `<div style="background-color: ${bg}; border: 1.5px solid #ffffff; color: #ffffff; padding: 2px 7px; border-radius: 8px; font-size: 10px; font-weight: 800; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap;">🚗 ${delayText}</div>`,
    iconSize: [76, 22],
    iconAnchor: [38, 11]
  });
};

const createPowerIcon = (status) => {
  const bg = status === 'UNPLANNED_FAULT' ? '#e11d48' : '#7c3aed';
  return L.divIcon({
    className: 'custom-power-marker',
    html: `<div style="background-color: ${bg}; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">⚡</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

export default function CivicInteractiveMap({ initialIssues = [], title = "Jaipur Civic & Spatial Intelligence Map" }) {
  const [issues, setIssues] = useState(initialIssues);
  const [geojson, setGeojson] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Map Layers
  const [activeLayers, setActiveLayers] = useState({
    complaints: true,
    weather: true,
    aqi: true,
    traffic: true,
    power: true,
    wards: true
  });

  // Selected Area/Marker for Inspector Card
  const [selectedItem, setSelectedItem] = useState(null);
  const [mapCenter, setMapCenter] = useState([26.8850, 75.7950]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const [issuesRes, geoRes, predRes] = await Promise.all([
        api.get('/issues?limit=150'),
        api.get('/wards/geojson'),
        api.get('/predictive/risks')
      ]);

      setIssues(issuesRes.data.issues || []);
      setGeojson(geoRes.data);
      setPredictiveData(predRes.data);
    } catch (e) {
      console.error('Failed to load full civic map feeds:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const focusLocation = (lat, lng, zoom = 14, item = null) => {
    setMapCenter([lat, lng]);
    setMapZoom(zoom);
    if (item) setSelectedItem(item);
  };

  // Ward polygon styling and interaction
  const onEachWardFeature = (feature, layer) => {
    const p = feature.properties || {};
    
    // Check if ward is marked in predictive risk
    const isAtRisk = (predictiveData?.predictiveRisks || []).some(r => 
      (r.affectedWards || []).some(w => w.includes(p.name) || w.includes(p.code))
    );

    layer.setStyle({
      fillColor: isAtRisk ? '#f43f5e' : '#6366f1',
      weight: 1.5,
      opacity: 0.85,
      color: isAtRisk ? '#e11d48' : '#4f46e5',
      fillOpacity: isAtRisk ? 0.22 : 0.08
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: isAtRisk ? 0.38 : 0.22, weight: 2.5 });
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: isAtRisk ? 0.22 : 0.08, weight: 1.5 });
      },
      click: () => {
        setSelectedItem({
          type: 'WARD',
          title: `${p.name} (${p.code})`,
          zone: p.zone || 'Jaipur Municipal Corporation',
          parshadName: p.parshad_name || 'Elected Ward Representative',
          parshadPhone: p.parshad_phone,
          party: p.party,
          description: p.description,
          isAtRisk,
          riskAlert: isAtRisk ? 'High precipitation runoff & active civic report surge' : null
        });
      }
    });
  };

  const weatherCurrent = predictiveData?.weather?.current || {};
  const cityMetrics = predictiveData?.cityFeedMetrics || {};
  const civicLayers = predictiveData?.civicLayers || {};
  const predictiveRisks = predictiveData?.predictiveRisks || [];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Header & Controls Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                {title}
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                  LIVE CIVIC FEEDS
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Real-time correlation of civic complaints, weather alerts, air quality, traffic delays, and power feeders.
              </p>
            </div>
          </div>
        </div>

        {/* Refresh & Reset view */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMapData}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
            title="Refresh Feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Feeds</span>
          </button>
          <button
            onClick={() => focusLocation(26.8850, 75.7950, 12, null)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition"
            title="Reset to City Center"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Reset View</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles & Filter Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          Layers:
        </span>

        {/* Complaints Toggle */}
        <button
          onClick={() => toggleLayer('complaints')}
          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${activeLayers.complaints ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-slate-100/60 border-slate-200 text-slate-400 line-through'}`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          Complaints ({issues.length})
        </button>

        {/* Weather Alerts Toggle */}
        <button
          onClick={() => toggleLayer('weather')}
          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${activeLayers.weather ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-100/60 border-slate-200 text-slate-400 line-through'}`}
        >
          <span>⛈️</span>
          Weather Risks ({(civicLayers.weatherAlerts || []).length})
        </button>

        {/* AQI Toggle */}
        <button
          onClick={() => toggleLayer('aqi')}
          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${activeLayers.aqi ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100/60 border-slate-200 text-slate-400 line-through'}`}
        >
          <span>🌫️</span>
          AQI Air Quality ({(civicLayers.aqiStations || []).length})
        </button>

        {/* Traffic Toggle */}
        <button
          onClick={() => toggleLayer('traffic')}
          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${activeLayers.traffic ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-100/60 border-slate-200 text-slate-400 line-through'}`}
        >
          <span>🚗</span>
          Traffic Delays ({(civicLayers.trafficCorridors || []).length})
        </button>

        {/* Power Outages Toggle */}
        <button
          onClick={() => toggleLayer('power')}
          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${activeLayers.power ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-slate-100/60 border-slate-200 text-slate-400 line-through'}`}
        >
          <span>⚡</span>
          Power Outages ({(civicLayers.powerOutages || []).length})
        </button>

        {/* Ward Polygons Toggle */}
        <button
          onClick={() => toggleLayer('wards')}
          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${activeLayers.wards ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-slate-100/60 border-slate-200 text-slate-400 line-through'}`}
        >
          <span>🏛️</span>
          Ward Polygons
        </button>
      </div>

      {/* Main Map & Civic Pulse Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Large Dedicated Interactive Map Container */}
        <div className="lg:col-span-8 relative h-[440px] sm:h-[500px] lg:h-[620px] w-full border-b lg:border-b-0 lg:border-r border-slate-200">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController center={mapCenter} zoom={mapZoom} />

            {/* 1. Ward GeoJSON Layer */}
            {activeLayers.wards && geojson && (
              <GeoJSON data={geojson} onEachFeature={onEachWardFeature} />
            )}

            {/* 2. Civic Complaints Layer */}
            {activeLayers.complaints && issues.map(issue => (
              <Marker
                key={`issue-${issue.id}`}
                position={[issue.latitude, issue.longitude]}
                icon={createComplaintIcon(issue.status)}
                eventHandlers={{
                  click: () => {
                    setSelectedItem({
                      type: 'COMPLAINT',
                      id: issue.id,
                      title: issue.title,
                      description: issue.description,
                      categoryName: issue.category_name,
                      wardName: issue.ward_name,
                      status: issue.status,
                      address: issue.address,
                      primaryImage: issue.primary_image,
                      createdAt: issue.created_at
                    });
                  }
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <div className="font-bold text-slate-900 text-sm">{issue.title}</div>
                    <div className="text-slate-500 mt-0.5">{issue.address || 'Jaipur'}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <StatusBadge status={issue.status} />
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {issue.ward_name}
                      </span>
                    </div>
                    <a
                      href={`/issues/${issue.id}`}
                      className="mt-2 block text-center py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[11px] shadow-xs"
                    >
                      View Evidence & Timeline &rarr;
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 3. Weather Alerts Layer */}
            {activeLayers.weather && (civicLayers.weatherAlerts || []).map(alert => (
              <Marker
                key={alert.id}
                position={[alert.lat, alert.lng]}
                icon={createWeatherAlertIcon(alert.severity)}
                eventHandlers={{
                  click: () => {
                    setSelectedItem({
                      type: 'WEATHER_ALERT',
                      title: alert.name,
                      risk: alert.risk,
                      severity: alert.severity,
                      precipitation: alert.precipitationForecast,
                      description: alert.description,
                      wardName: alert.wardName
                    });
                  }
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <div className="font-bold text-rose-900 text-sm flex items-center gap-1">
                      ⛈️ {alert.name}
                    </div>
                    <div className="text-xs font-semibold text-rose-700 mt-1">{alert.risk} ({alert.severity})</div>
                    <div className="text-slate-600 mt-1">{alert.description}</div>
                    <div className="mt-1 text-[10px] font-bold text-amber-800">Precipitation: {alert.precipitationForecast}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 4. Air Quality (AQI) Layer */}
            {activeLayers.aqi && (civicLayers.aqiStations || []).map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createAqiIcon(station.aqi, station.category)}
                eventHandlers={{
                  click: () => {
                    setSelectedItem({
                      type: 'AQI_STATION',
                      title: station.name,
                      aqi: station.aqi,
                      category: station.category,
                      dominantPollutant: station.dominantPollutant,
                      healthAdvice: station.healthAdvice,
                      wardName: station.wardName
                    });
                  }
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <div className="font-bold text-slate-900 text-sm">🌫️ {station.name}</div>
                    <div className="mt-1 text-xs font-bold text-indigo-700">AQI: {station.aqi} ({station.category})</div>
                    <div className="text-slate-500 mt-0.5">Pollutant: {station.dominantPollutant}</div>
                    <p className="text-xs text-slate-600 mt-1">{station.healthAdvice}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 5. Traffic Corridors Layer */}
            {activeLayers.traffic && (civicLayers.trafficCorridors || []).map(corridor => (
              <Marker
                key={corridor.id}
                position={[corridor.lat, corridor.lng]}
                icon={createTrafficIcon(corridor.delayText, corridor.severity)}
                eventHandlers={{
                  click: () => {
                    setSelectedItem({
                      type: 'TRAFFIC_CORRIDOR',
                      title: corridor.name,
                      delayText: corridor.delayText,
                      avgSpeed: `${corridor.avgSpeedKmh} km/h`,
                      status: corridor.status,
                      cause: corridor.cause,
                      wardName: corridor.wardName
                    });
                  }
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <div className="font-bold text-slate-900 text-sm">🚗 {corridor.name}</div>
                    <div className="text-xs font-bold text-rose-700 mt-1">{corridor.delayText} • Avg Speed: {corridor.avgSpeedKmh} km/h</div>
                    <div className="text-slate-600 mt-1">{corridor.cause}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{corridor.wardName}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 6. Power Outages Layer */}
            {activeLayers.power && (civicLayers.powerOutages || []).map(power => (
              <Marker
                key={power.id}
                position={[power.lat, power.lng]}
                icon={createPowerIcon(power.status)}
                eventHandlers={{
                  click: () => {
                    setSelectedItem({
                      type: 'POWER_OUTAGE',
                      title: power.name,
                      status: power.status,
                      duration: power.duration,
                      householdsAffected: power.householdsAffected,
                      department: power.department,
                      reason: power.reason,
                      wardName: power.wardName
                    });
                  }
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <div className="font-bold text-slate-900 text-sm">⚡ {power.name}</div>
                    <div className="text-xs font-bold text-purple-700 mt-1">{power.status} ({power.duration})</div>
                    <div className="text-slate-600 mt-1">{power.reason}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Impact: {power.householdsAffected} Households • {power.department}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Map Legend (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded-xl shadow-md text-[11px] space-y-1">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Map Legend</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" /> Complaint</span>
              <span className="flex items-center gap-1">⛈️ Weather Alert</span>
              <span className="flex items-center gap-1">🌫️ AQI Station</span>
              <span className="flex items-center gap-1">🚗 Traffic Congestion</span>
              <span className="flex items-center gap-1">⚡ Power Outage</span>
            </div>
          </div>
        </div>

        {/* Right Column: Civic Pulse & Selected Details Inspector */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between space-y-6 bg-slate-50/40 overflow-y-auto max-h-[620px]">
          
          {/* Section A: Selected Item Details Inspector */}
          {selectedItem ? (
            <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                  {selectedItem.type.replace('_', ' ')}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{selectedItem.title}</h4>
                {selectedItem.wardName && (
                  <p className="text-[11px] text-amber-800 font-semibold mt-0.5">Ward: {selectedItem.wardName}</p>
                )}
              </div>

              {/* Conditional Content by Type */}
              {selectedItem.type === 'COMPLAINT' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={selectedItem.status} />
                    <span className="text-slate-400 text-[10px]">{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">{selectedItem.description}</p>
                  <a
                    href={`/issues/${selectedItem.id}`}
                    className="block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                  >
                    Inspect Evidence & Resolution Proof &rarr;
                  </a>
                </div>
              )}

              {selectedItem.type === 'WEATHER_ALERT' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                    <div className="font-bold text-xs">{selectedItem.risk} (Severity: {selectedItem.severity})</div>
                    <div className="text-[11px] mt-0.5">{selectedItem.description}</div>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Precipitation Forecast:</strong> {selectedItem.precipitation}
                  </div>
                </div>
              )}

              {selectedItem.type === 'AQI_STATION' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-bold">
                    <span>Index: {selectedItem.aqi} AQI</span>
                    <span className="text-[10px] uppercase">{selectedItem.category}</span>
                  </div>
                  <p className="text-slate-600 font-medium"><strong>Primary Pollutant:</strong> {selectedItem.dominantPollutant}</p>
                  <p className="text-slate-600 font-medium"><strong>Health Advisory:</strong> {selectedItem.healthAdvice}</p>
                </div>
              )}

              {selectedItem.type === 'TRAFFIC_CORRIDOR' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 font-bold flex justify-between">
                    <span>{selectedItem.delayText}</span>
                    <span>Speed: {selectedItem.avgSpeed}</span>
                  </div>
                  <p className="text-slate-600 font-medium"><strong>Choke Factor:</strong> {selectedItem.cause}</p>
                </div>
              )}

              {selectedItem.type === 'POWER_OUTAGE' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-950">
                    <div className="font-bold">{selectedItem.status}</div>
                    <div className="text-[11px] mt-0.5">{selectedItem.duration}</div>
                  </div>
                  <p className="text-slate-600 font-medium"><strong>Households Affected:</strong> {selectedItem.householdsAffected}</p>
                  <p className="text-slate-600 font-medium"><strong>Root Cause:</strong> {selectedItem.reason}</p>
                </div>
              )}

              {selectedItem.type === 'WARD' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950">
                    <div className="font-bold">Parshad: {selectedItem.parshadName}</div>
                    <div className="text-[11px] text-slate-500">Party: {selectedItem.party || 'Independent'} • Phone: {selectedItem.parshadPhone || 'N/A'}</div>
                  </div>
                  {selectedItem.riskAlert && (
                    <div className="p-2 bg-rose-50 border border-rose-200 text-rose-900 rounded font-semibold text-[11px]">
                      ⚠️ {selectedItem.riskAlert}
                    </div>
                  )}
                  <p className="text-slate-600 font-medium">{selectedItem.description}</p>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                Interactive Map Inspector
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Click any complaint pin, weather storm alert, AQI monitoring post, traffic bottleneck, or ward polygon to inspect localized impact and root cause details.
              </p>
            </div>
          )}

          {/* Section B: Live Civic Pulse Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                Jaipur Civic Pulse
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Auto-synced</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Weather</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {weatherCurrent.temp ? `${weatherCurrent.temp}°C` : '32°C'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{weatherCurrent.condition || 'Partly Cloudy'}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Rain 12h</div>
                <div className="font-extrabold text-indigo-700 text-sm mt-0.5">
                  {predictiveData?.weather?.forecast12h?.totalRainMm || 0} mm
                </div>
                <div className="text-[10px] text-slate-500">Forecast Runoff</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Traffic Delay</div>
                <div className="font-extrabold text-amber-800 text-sm mt-0.5">
                  {cityMetrics.trafficDelayIndex || 28} / 100
                </div>
                <div className="text-[10px] text-slate-500">Corridor Stress</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">City AQI</div>
                <div className="font-extrabold text-emerald-800 text-sm mt-0.5">
                  {cityMetrics.aqiIndex || 112} AQI
                </div>
                <div className="text-[10px] text-slate-500">Moderate Baseline</div>
              </div>
            </div>
          </div>

          {/* Section C: Critical Civic Alerts & Quick Focus Shortcuts */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Critical Civic Alerts ({predictiveRisks.length})</span>
            </div>

            <div className="space-y-2">
              {predictiveRisks.slice(0, 3).map((risk) => (
                <div
                  key={risk.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 shadow-xs transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{risk.category}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${risk.riskLevel.includes('LIKELY') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                      {risk.riskLevel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {risk.whatMayHappenNext}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {risk.affectedWards?.[0] || 'Jaipur Wards'}
                    </span>
                    <button
                      onClick={() => {
                        // Quick center on affected ward / zone
                        if (risk.category.includes('Water')) focusLocation(26.9380, 75.7520, 13, risk);
                        else if (risk.category.includes('Traffic')) focusLocation(26.8620, 75.8050, 13, risk);
                        else focusLocation(26.8520, 75.8150, 13, risk);
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      Focus on Map <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
