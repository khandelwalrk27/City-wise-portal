import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, AlertTriangle, Activity, Camera, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../services/api';
import CivicInteractiveMap from '../components/CivicInteractiveMap';
import StatusBadge from '../components/StatusBadge';
import PredictiveRiskWidget from '../components/PredictiveRiskWidget';

export default function LandingPage() {
  const [stats, setStats] = useState({ totalIssues: 24, resolvedIssues: 18, avgResolutionHours: 14.5 });
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    api.get('/analytics')
      .then(res => setStats(res.data.summary || stats))
      .catch(() => {});

    api.get('/issues?limit=6')
      .then(res => setRecentIssues(res.data.issues || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold mb-6">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            Nagar Nigam Greater & Heritage Jaipur Civic Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Transparent Civic Reporting <br /> & Verified Resolution for Jaipur
          </h1>

          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Report potholes, waterlogging, garbage accumulation, or lighting issues. Powered by automated GeoJSON ward routing, live camera capture, and mandatory citizen evidence verification.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/citizen/report"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Civic Issue
            </Link>
            <Link
              to="/map"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-2 transition"
            >
              <MapPin className="w-4 h-4 text-indigo-600" />
              Explore Jaipur Live Map
            </Link>
          </div>

          {/* Metrics Row */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl">
              <div className="text-3xl font-extrabold text-amber-900">{stats.totalIssues || 24}</div>
              <div className="text-xs text-amber-700 mt-1 uppercase font-bold">Total Reported Issues</div>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-2xl">
              <div className="text-3xl font-extrabold text-emerald-900">{stats.resolvedIssues || 18}</div>
              <div className="text-xs text-emerald-700 mt-1 uppercase font-bold">Verified Resolved</div>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-200 p-5 rounded-2xl">
              <div className="text-3xl font-extrabold text-indigo-900">{stats.avgResolutionHours || 14.5} hrs</div>
              <div className="text-xs text-indigo-700 mt-1 uppercase font-bold">Avg Resolution Speed</div>
            </div>
          </div>

        </div>
      </section>

      {/* Live Weather & Predictive Civic Intelligence Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PredictiveRiskWidget />
      </section>

      {/* Large Dedicated Interactive Map Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CivicInteractiveMap title="Jaipur Civic Operations & Real-Time Spatial Feeds" />
      </section>

      {/* Workflow Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900">System Architecture</h2>
          <p className="text-xs text-slate-500 mt-1">Automated spatial intelligence and citizen verification safeguards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-extrabold text-base">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">GeoJSON Ward Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Coordinates automatically route issues to official Jaipur wards (1 to 150) and responsible municipal authority departments.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800 font-extrabold text-base">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Camera Capture</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Citizens and authority officers capture live photos and videos directly through device camera for immutable evidence.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-extrabold text-base">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Citizen Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Issues only close after the reporting citizen inspects side-by-side evidence proof and approves the resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Community Issues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              Recent Jaipur Civic Reports
            </h2>
            <p className="text-xs text-slate-500">Live community reports across Jaipur municipal wards.</p>
          </div>
          <Link to="/community" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Reports &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentIssues.slice(0, 6).map(issue => (
            <div key={issue.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-sm transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={issue.status} />
                  <span className="text-[10px] text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {issue.ward_name || 'Jaipur Ward'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{issue.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{issue.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate max-w-[160px] font-medium">{issue.address || 'Jaipur'}</span>
                <Link to={`/issues/${issue.id}`} className="text-indigo-600 font-bold hover:underline">
                  View Timeline &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
