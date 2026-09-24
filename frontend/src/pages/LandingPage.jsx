import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Users, Activity } from 'lucide-react';
import api from '../services/api';
import MapPicker from '../components/MapPicker';
import StatusBadge from '../components/StatusBadge';

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
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            Nagar Nigam Greater & Heritage Jaipur Civic Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Transparent Civic Reporting <br /> & Verified Resolution for Jaipur
          </h1>

          <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Report potholes, waterlogging, garbage accumulation, or lighting issues. Powered by automated GeoJSON ward routing and mandatory citizen evidence verification.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/citizen/report"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Civic Issue
            </Link>
            <Link
              to="/map"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800 flex items-center justify-center gap-2 transition"
            >
              <MapPin className="w-4 h-4 text-indigo-400" />
              Explore Jaipur Live Map
            </Link>
          </div>

          {/* Metrics Row */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="text-3xl font-extrabold text-amber-400">{stats.totalIssues || 24}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Total Reported Issues</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="text-3xl font-extrabold text-emerald-400">{stats.resolvedIssues || 18}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Verified Resolved</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="text-3xl font-extrabold text-indigo-400">{stats.avgResolutionHours || 14.5} hrs</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Avg Resolution Speed</div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Map Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Jaipur Municipal Ward Boundary Map
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select coordinates anywhere on the map to trigger automated GeoJSON point-in-polygon ward routing.
            </p>
          </div>
          <Link to="/map" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            View Full Screen Map &rarr;
          </Link>
        </div>

        <MapPicker issues={recentIssues} height="460px" />
      </section>

      {/* Workflow Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-white">System Architecture</h2>
          <p className="text-xs text-slate-400 mt-1">Automated spatial intelligence and citizen verification safeguards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base">
              1
            </div>
            <h3 className="text-base font-bold text-white">GeoJSON Ward Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coordinates automatically route issues to official Jaipur wards (1 to 150) and responsible municipal authority departments.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-base">
              2
            </div>
            <h3 className="text-base font-bold text-white">Live Camera Capture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens and authority officers capture live photos and videos directly through device camera for immutable evidence.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-base">
              3
            </div>
            <h3 className="text-base font-bold text-white">Citizen Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Issues only close after the reporting citizen inspects side-by-side evidence proof and approves the resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Community Issues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Recent Jaipur Civic Reports
            </h2>
            <p className="text-xs text-slate-400">Live community reports across Jaipur municipal wards.</p>
          </div>
          <Link to="/community" className="text-xs font-semibold text-indigo-400 hover:underline">
            View All Reports &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentIssues.slice(0, 6).map(issue => (
            <div key={issue.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={issue.status} />
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {issue.ward_name || 'Jaipur Ward'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{issue.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{issue.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[160px]">{issue.address || 'Jaipur'}</span>
                <Link to={`/issues/${issue.id}`} className="text-indigo-400 font-semibold hover:underline">
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
