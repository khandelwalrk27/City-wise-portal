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

// Jaipur Municipal Corporation 5 Official Administrative Zones
export const JAIPUR_ZONES = [
  { id: 'ALL', name: 'All Jaipur Master', wardsRange: 'All 150 Wards', center: [26.9124, 75.7873], zoom: 12, desc: 'Citywide municipal oversight across Greater & Heritage Jaipur' },
  { id: 'Vidhyadhar Nagar', name: 'Vidhyadhar Nagar', wardsRange: 'Wards 1–42', center: [26.9600, 75.7850], zoom: 13, desc: 'Sector 1-3, Central Market, Sikar Road corridor & Transport hub' },
  { id: 'Jhotwara', name: 'Jhotwara Zone', wardsRange: 'Wards 43–64', center: [26.9350, 75.7450], zoom: 13, desc: 'Jhotwara Industrial Area, Khatipura Junction & Rail Overbridge' },
  { id: 'Sanganer', name: 'Sanganer Zone', wardsRange: 'Wards 65–103', center: [26.8250, 75.8000], zoom: 13, desc: 'Nagar Nigam Greater HQ, Tonk Road, Airport Link & Textile Block' },
  { id: 'Bagru', name: 'Bagru Zone', wardsRange: 'Wards 104–124', center: [26.8750, 75.7050], zoom: 13, desc: 'Ajmer Road Expressway, Mahindra SEZ & Suburban residential' },
  { id: 'Malviya Nagar', name: 'Malviya Nagar', wardsRange: 'Wards 125–150', center: [26.8650, 75.8300], zoom: 13, desc: 'Calgiri Marg, World Trade Park, Apex Circle & Jagatpura' },
];

export default function CivicInteractiveMap({ 
  initialIssues = [], 
  title = "Jaipur Civic & Spatial Intelligence Map",
  adminMode = false 
}) {
  const [issues, setIssues] = useState(initialIssues);
  const [geojson, setGeojson] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Jaipur Municipal Zone & Admin Filter State
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedWardCode, setSelectedWardCode] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'RESOLVED'

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
  const [mapCenter, setMapCenter] = useState([26.9124, 75.7873]);
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

  // Switch Jaipur Municipal Zone
  const handleZoneChange = (zoneObj) => {
    setSelectedZone(zoneObj.id);
    setSelectedWardCode(null);
    focusLocation(zoneObj.center[0], zoneObj.center[1], zoneObj.zoom, null);
  };

  // Lookup map: Ward name/code -> Zone name
  const wardToZoneMap = React.useMemo(() => {
    const map = {};
    if (geojson?.features) {
      geojson.features.forEach(f => {
        const props = f.properties || {};
        if (props.name && props.zone) map[props.name.toLowerCase()] = props.zone;
        if (props.code && props.zone) map[props.code.toLowerCase()] = props.zone;
      });
    }
    return map;
  }, [geojson]);

  // Filtered issues based on zone, ward, and status
  const displayedIssues = React.useMemo(() => {
    return issues.filter(issue => {
      // 1. Zone filter
      if (selectedZone !== 'ALL') {
        const issueZone = wardToZoneMap[issue.ward_name?.toLowerCase()] || 
                          wardToZoneMap[issue.ward_code?.toLowerCase()] ||
                          (issue.ward_name?.toLowerCase().includes(selectedZone.toLowerCase()) ? selectedZone : null);
        if (issueZone && issueZone !== selectedZone) return false;
      }

      // 2. Specific Ward filter
      if (selectedWardCode) {
        if (issue.ward_code !== selectedWardCode && !issue.ward_name?.includes(selectedWardCode)) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter === 'OPEN' && issue.status === 'CLOSED') return false;
      if (statusFilter === 'RESOLVED' && issue.status !== 'CLOSED') return false;

      return true;
    });
  }, [issues, selectedZone, selectedWardCode, statusFilter, wardToZoneMap]);

  // Zone-level Workload Optimization Metrics
  const zoneStats = React.useMemo(() => {
    const zoneIssues = issues.filter(i => {
      if (selectedZone === 'ALL') return true;
      const z = wardToZoneMap[i.ward_name?.toLowerCase()] || wardToZoneMap[i.ward_code?.toLowerCase()];
      return z === selectedZone || i.ward_name?.toLowerCase().includes(selectedZone.toLowerCase());
    });

    const total = zoneIssues.length;
    const open = zoneIssues.filter(i => i.status !== 'CLOSED').length;
    const resolved = zoneIssues.filter(i => i.status === 'CLOSED').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    let workloadStatus = 'OPTIMAL CAPACITY';
    let statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    let tip = 'All municipal zones operating within SLA dispatch standards. Response crews active.';

    if (open > 5) {
      workloadStatus = 'HIGH BACKLOG HOTSPOT';
      statusColor = 'bg-rose-50 text-rose-800 border-rose-200';
      tip = 'Surge in civic reports detected. Recommend routing standby PWD & sanitation units.';
    } else if (open > 2) {
      workloadStatus = 'MODERATE DISPATCH LOAD';
      statusColor = 'bg-amber-50 text-amber-800 border-amber-200';
      tip = 'Active tickets being addressed. Verify technician resolution uploads.';
    }

    if (selectedZone === 'Vidhyadhar Nagar') {
      tip = 'Sector 1-3 arterial drainage pumps ready. Parshad oversight active across 42 wards.';
    } else if (selectedZone === 'Sanganer') {
      tip = 'Tonk Road & Airport corridor priority zone. Rapid asphalt patch team on standby.';
    } else if (selectedZone === 'Jhotwara') {
      tip = 'Industrial transport line & Khatipura flyover streetlights under real-time monitoring.';
    } else if (selectedZone === 'Bagru') {
      tip = 'Ajmer Expressway feeder corridor. Monitor culvert stormwater runoffs.';
    } else if (selectedZone === 'Malviya Nagar') {
      tip = 'Calgiri Marg commercial density. High-frequency hopper dumpster routes operational.';
    }

    return { total, open, resolved, rate, workloadStatus, statusColor, tip };
  }, [issues, selectedZone, wardToZoneMap]);

  // Ward polygon styling with dynamic zone highlighting
  const getWardStyle = (feature) => {
    const p = feature.properties || {};
    const isAtRisk = (predictiveData?.predictiveRisks || []).some(r => 
      (r.affectedWards || []).some(w => w.includes(p.name) || w.includes(p.code))
    );

    const isSelectedWard = selectedWardCode && p.code === selectedWardCode;
    const isSelectedZone = selectedZone === 'ALL' || p.zone === selectedZone;

    if (isSelectedWard) {
      return {
        fillColor: '#f59e0b',
        weight: 3.5,
        opacity: 1.0,
        color: '#b45309',
        fillOpacity: 0.45
      };
    }

    if (selectedZone !== 'ALL') {
      if (isSelectedZone) {
        return {
          fillColor: isAtRisk ? '#f43f5e' : '#4f46e5',
          weight: 2.5,
          opacity: 0.95,
          color: isAtRisk ? '#e11d48' : '#3730a3',
          fillOpacity: isAtRisk ? 0.35 : 0.22
        };
      } else {
        return {
          fillColor: '#94a3b8',
          weight: 1,
          opacity: 0.25,
          color: '#cbd5e1',
          fillOpacity: 0.03
        };
      }
    }

    return {
      fillColor: isAtRisk ? '#f43f5e' : '#6366f1',
      weight: 1.5,
      opacity: 0.85,
      color: isAtRisk ? '#e11d48' : '#4f46e5',
      fillOpacity: isAtRisk ? 0.22 : 0.08
    };
  };

  // Ward polygon click and interaction
  const onEachWardFeature = (feature, layer) => {
    const p = feature.properties || {};
    
    const isAtRisk = (predictiveData?.predictiveRisks || []).some(r => 
      (r.affectedWards || []).some(w => w.includes(p.name) || w.includes(p.code))
    );

    layer.on({
      mouseover: (e) => {
        if (!selectedWardCode || selectedWardCode === p.code) {
          e.target.setStyle({ fillOpacity: isAtRisk ? 0.42 : 0.30, weight: 3 });
        }
      },
      mouseout: (e) => {
        layer.setStyle(getWardStyle(feature));
      },
      click: () => {
        setSelectedWardCode(p.code);
        setSelectedItem({
          type: 'WARD',
          title: `${p.name} (${p.code})`,
          code: p.code,
          zone: p.zone || 'Jaipur Municipal Corporation',
          parshadName: p.parshad_name || 'Elected Ward Representative',
          parshadPhone: p.parshad_phone,
          party: p.party,
          population: p.population,
          area_sq_km: p.area_sq_km,
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
                {adminMode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
                    NAGAR ADMIN OPTIMIZED
                  </span>
                )}
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
            onClick={() => {
              setSelectedZone('ALL');
              setSelectedWardCode(null);
              focusLocation(26.9124, 75.7873, 12, null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition"
            title="Reset to City Center"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Reset City View</span>
          </button>
        </div>
      </div>

      {/* Jaipur Municipal 5-Zone Quick Switcher */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Jaipur Municipal Zones & Boundary Optimizer:
          </span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Click any zone to focus GIS viewport & inspect municipal load
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {JAIPUR_ZONES.map(z => {
            const isActive = selectedZone === z.id;
            return (
              <button
                key={z.id}
                onClick={() => handleZoneChange(z)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{z.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {z.wardsRange}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Municipal Workload & Optimization Telemetry Bar */}
      <div className="px-5 py-2.5 bg-indigo-50/40 border-b border-indigo-100/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-2.5">
          <span className="font-bold text-slate-900">
            {selectedZone === 'ALL' ? 'Jaipur Master Jurisdiction' : `${selectedZone} Municipal Sector`}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${zoneStats.statusColor}`}>
            {zoneStats.workloadStatus}
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-600 font-medium hidden sm:inline">
            {zoneStats.tip}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-normal">Active Backlog:</span>
            <span className="text-amber-700 px-1.5 py-0.2 bg-amber-50 rounded border border-amber-200">{zoneStats.open}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-normal">Resolved:</span>
            <span className="text-emerald-700 px-1.5 py-0.2 bg-emerald-50 rounded border border-emerald-200">{zoneStats.resolved}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-normal">SLA Compliance:</span>
            <span className="text-indigo-700 px-1.5 py-0.2 bg-indigo-50 rounded border border-indigo-200">{zoneStats.rate}%</span>
          </div>
          {selectedWardCode && (
            <button
              onClick={() => setSelectedWardCode(null)}
              className="text-[10px] text-rose-600 hover:text-rose-800 underline font-semibold ml-1"
            >
              Clear Ward Filter ({selectedWardCode})
            </button>
          )}
        </div>
      </div>

      {/* Layer Toggles & Status Filter Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
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
            Complaints ({displayedIssues.length})
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

        {/* Status Filter for issues */}
        <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l sm:pl-3 border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
          {['ALL', 'OPEN', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                statusFilter === st 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'OPEN' ? 'Open Backlog' : 'Resolved'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Civic Pulse Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Large Dedicated Interactive Map Container */}
        <div className="lg:col-span-8 relative h-[440px] sm:h-[500px] lg:h-[620px] w-full border-b lg:border-b-0 lg:border-r border-slate-200">
          <MapContainer 
            preferCanvas={true}
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
              <GeoJSON 
                key={`geojson-${selectedZone}-${selectedWardCode}`}
                data={geojson} 
                style={getWardStyle}
                onEachFeature={onEachWardFeature} 
              />
            )}

            {/* 2. Civic Complaints Layer */}
            {activeLayers.complaints && displayedIssues.map(issue => (
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
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-900 text-xs">Parshad Representative</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {selectedItem.party || 'Independent'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{selectedItem.parshadName}</div>
                    {selectedItem.parshadPhone && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-slate-500 text-[11px]">Direct Contact:</span>
                        <a 
                          href={`tel:${selectedItem.parshadPhone}`}
                          className="font-mono font-bold text-indigo-700 hover:text-indigo-900 underline"
                        >
                          +91 {selectedItem.parshadPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px] font-semibold">Population</span>
                      <span className="font-bold text-slate-800">{selectedItem.population ? selectedItem.population.toLocaleString() : '42,000'}</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px] font-semibold">Ward Area</span>
                      <span className="font-bold text-slate-800">{selectedItem.area_sq_km || 4.5} km²</span>
                    </div>
                  </div>

                  {selectedItem.riskAlert && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg font-semibold text-[11px]">
                      ⚠️ {selectedItem.riskAlert}
                    </div>
                  )}

                  <p className="text-slate-600 leading-relaxed font-medium">{selectedItem.description}</p>

                  <div className="pt-1 flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        if (selectedWardCode === selectedItem.code) {
                          setSelectedWardCode(null);
                        } else {
                          setSelectedWardCode(selectedItem.code);
                        }
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      {selectedWardCode === selectedItem.code ? 'Clear Ward Filter (Show All)' : `Filter Map to ${selectedItem.code}`}
                    </button>
                    {adminMode && (
                      <a
                        href="/admin/authorities"
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center border border-slate-300 transition"
                      >
                        Configure Ward Authority Routing &rarr;
                      </a>
                    )}
                  </div>
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
