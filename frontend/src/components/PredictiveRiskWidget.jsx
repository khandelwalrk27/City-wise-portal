import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CloudRain, Sun, Wind, AlertTriangle, ShieldAlert, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PredictiveRiskWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  const fetchPredictiveData = async () => {
    try {
      const res = await api.get('/predictive/risks');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch predictive risk data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-sm">
        Loading live weather feeds & predictive risk intelligence...
      </div>
    );
  }

  if (!data) return null;

  const { weather, cityFeedMetrics, predictiveRisks } = data;
  const current = weather.current || {};
  const forecast = weather.forecast12h || {};

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* Header: Live Weather & City Feeds */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold uppercase tracking-wider">
              {weather.isLive ? 'Live Open-Meteo Feed' : 'Weather Feed Engine'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Jaipur Municipal Region</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-indigo-600" />
            Live Weather & Predictive Civic Intelligence
          </h3>
        </div>

        {/* Live Weather Metrics Chips */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium">
            <Sun className="w-4 h-4 text-amber-600" />
            <span><strong className="text-amber-950 font-bold">{current.temp}°C</strong> ({current.condition})</span>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium">
            <CloudRain className="w-4 h-4 text-cyan-600" />
            <span>Rain: <strong className="text-cyan-950 font-bold">{forecast.totalRainMm}mm</strong> (12h)</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 text-purple-900 px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium">
            <Wind className="w-4 h-4 text-purple-600" />
            <span>Wind: <strong className="text-purple-950 font-bold">{current.windSpeed} km/h</strong></span>
          </div>
        </div>
      </div>

      {/* Disclaimers & Status Notice */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          Predictions labeled strictly as <strong className="text-amber-900 uppercase">Possible / Likely Near-term Risks</strong>.
        </span>
        <span className="font-mono text-slate-400 hidden sm:inline">Refreshed: {new Date(weather.updatedAt).toLocaleTimeString()}</span>
      </div>

      {/* Predictive Risk Cards Grid */}
      <div className="space-y-4">
        {predictiveRisks.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No critical near-term civic risks detected for current weather metrics.</p>
        ) : (
          predictiveRisks.map(risk => (
            <div 
              key={risk.id}
              className={`p-5 rounded-2xl border transition ${
                risk.severity === 'HIGH' 
                  ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300' 
                  : 'bg-slate-50/50 border-slate-200 hover:border-indigo-200'
              }`}
            >
              
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase ${
                    risk.riskLevel.includes('LIKELY') 
                      ? 'bg-rose-100 text-rose-900 border-rose-300' 
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    ⚠️ {risk.riskLevel}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{risk.category}</h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {risk.confidence}%
                  </span>
                </div>
              </div>

              {/* Affected Wards Banner */}
              <div className="mb-3 text-xs text-slate-700">
                <span className="text-slate-500 font-semibold">Affected Jaipur Wards: </span>
                {risk.affectedWards.map((w, idx) => (
                  <span key={idx} className="inline-block bg-white border border-slate-200 px-2 py-0.5 rounded text-amber-900 font-bold text-[11px] mr-1.5 mt-1 shadow-sm">
                    📍 {w}
                  </span>
                ))}
              </div>

              {/* Situational Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">What May Happen Next?</h5>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{risk.whatMayHappenNext}</p>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Why It Matters</h5>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{risk.whyItMatters}</p>
                </div>

              </div>

              {/* Evidence Data Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <div className="flex flex-wrap items-center gap-2 text-slate-600">
                  <span className="font-bold text-slate-800">Empirical Evidence:</span>
                  {Object.entries(risk.evidenceData).map(([key, val]) => (
                    <span key={key} className="bg-white px-2 py-1 rounded text-slate-700 border border-slate-200 shadow-sm font-medium">
                      {key}: <strong className="text-slate-900">{val}</strong>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
