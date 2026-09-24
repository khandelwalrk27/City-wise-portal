import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CloudRain, Sun, Wind, AlertTriangle, ShieldAlert, Activity, BarChart2, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function PredictiveRiskWidget({ compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRiskId, setActiveRiskId] = useState(null);

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  const fetchPredictiveData = async () => {
    try {
      const res = await api.get('/predictive/risks');
      setData(res.data);
      if (res.data.predictiveRisks?.length > 0) {
        setActiveRiskId(res.data.predictiveRisks[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch predictive risk data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
        Loading live weather feeds & predictive risk intelligence...
      </div>
    );
  }

  if (!data) return null;

  const { weather, cityFeedMetrics, predictiveRisks } = data;
  const current = weather.current || {};
  const forecast = weather.forecast12h || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-6 p-6">
      
      {/* Header: Live Weather & City Feeds */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              {weather.isLive ? 'Live Open-Meteo Feed' : 'Weather Feed Engine'}
            </span>
            <span className="text-xs text-slate-400">Jaipur Municipal Bounding Box</span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-1 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-indigo-400" />
            Live Weather & Predictive Civic Intelligence
          </h3>
        </div>

        {/* Live Weather Metrics Chips */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span><strong className="text-white">{current.temp}°C</strong> ({current.condition})</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span>Rain: <strong className="text-white">{forecast.totalRainMm}mm</strong> next 12h</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Wind className="w-4 h-4 text-purple-400" />
            <span>Wind: <strong className="text-white">{current.windSpeed} km/h</strong></span>
          </div>
        </div>
      </div>

      {/* Disclaimers & Status Notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Predictions are labeled strictly as <strong className="text-amber-300 uppercase">Possible / Likely Near-term Risks</strong> based on cross-feed correlation.
        </span>
        <span className="font-mono text-slate-500 hidden sm:inline">Refreshed: {new Date(weather.updatedAt).toLocaleTimeString()}</span>
      </div>

      {/* Predictive Risk Cards Grid */}
      <div className="space-y-4">
        {predictiveRisks.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No critical near-term civic risks detected at present weather conditions.</p>
        ) : (
          predictiveRisks.map(risk => (
            <div 
              key={risk.id}
              className={`p-5 rounded-2xl border transition ${
                risk.severity === 'HIGH' 
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60' 
                  : 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase ${
                    risk.riskLevel.includes('LIKELY') 
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    ⚠️ {risk.riskLevel}
                  </span>
                  <h4 className="text-sm font-bold text-white">{risk.category}</h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Confidence Score:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {risk.confidence}%
                  </span>
                </div>
              </div>

              {/* Affected Wards Banner */}
              <div className="mb-3 text-xs text-slate-300">
                <span className="text-slate-400 font-semibold">Affected Jaipur Wards: </span>
                {risk.affectedWards.map((w, idx) => (
                  <span key={idx} className="inline-block bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300 font-medium text-[11px] mr-1.5 mt-1">
                    📍 {w}
                  </span>
                ))}
              </div>

              {/* Situational Sections: What May Happen Next & Why It Matters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800/80">
                
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">What May Happen Next?</h5>
                  <p className="text-xs text-slate-200 leading-relaxed">{risk.whatMayHappenNext}</p>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Why It Matters</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{risk.whyItMatters}</p>
                </div>

              </div>

              {/* Evidence Data Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <div className="flex flex-wrap items-center gap-3 text-slate-400">
                  <span className="font-semibold text-slate-300">Empirical Evidence:</span>
                  {Object.entries(risk.evidenceData).map(([key, val]) => (
                    <span key={key} className="bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-800">
                      {key}: <strong className="text-white">{val}</strong>
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
