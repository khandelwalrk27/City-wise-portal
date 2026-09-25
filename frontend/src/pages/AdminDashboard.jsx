import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CivicInteractiveMap from '../components/CivicInteractiveMap';
import { Shield, Users, Building2, MapPin, RefreshCw, BarChart3, AlertTriangle, Compass } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics');
      setStats(res.data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to clean initial Jaipur state with demo Parshads and issues?')) return;
    setSeeding(true);
    try {
      await api.post('/seed/reset-and-seed');
      alert('Database successfully reset and demo data re-seeded!');
      fetchStats();
    } catch (err) {
      alert('Seed reset failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            Nagar Nigam Admin Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Jaipur Municipal Master Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">High-level civic administration, ward boundaries, and department performance.</p>
        </div>

        <button
          onClick={handleResetSeed}
          disabled={seeding}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Re-initializing...' : 'Re-initialize Master Database'}
        </button>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Reported Issues</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalIssues}</div>
          </div>
          <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-xs">
            <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider">Active Open Issues</span>
            <div className="text-3xl font-extrabold text-amber-900 mt-1">{stats.openIssues}</div>
          </div>
          <div className="bg-orange-50/70 p-5 rounded-2xl border border-orange-200 shadow-xs">
            <span className="text-[11px] text-orange-800 font-bold uppercase tracking-wider">Pending Verification</span>
            <div className="text-3xl font-extrabold text-orange-900 mt-1">{stats.verificationPending}</div>
          </div>
          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs">
            <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">Closed & Verified</span>
            <div className="text-3xl font-extrabold text-emerald-900 mt-1">{stats.resolvedIssues}</div>
          </div>
        </div>
      )}

      {/* Jaipur Municipal Spatial Operations & Map Command Center */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold mb-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              Municipal GIS Spatial Operations
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Jaipur 5-Zone Ward Map & Workload Optimization
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Interactive GIS telemetry covering Vidhyadhar Nagar, Jhotwara, Sanganer, Bagru, and Malviya Nagar zones with real-time complaint density, weather, AQI, and corridor routing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/wards"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ward GeoJSON</span>
            </Link>
            <Link
              to="/admin/authorities"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Dispatch Routing</span>
            </Link>
          </div>
        </div>

        <CivicInteractiveMap 
          adminMode={true} 
          title="Jaipur Nagar Nigam Municipal Spatial Command Center" 
        />
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link to="/admin/wards" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Wards & GeoJSON Management</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">View Jaipur municipal wards, inspect Parshad details, upload GeoJSON boundary polygons.</p>
        </Link>

        <Link to="/admin/authorities" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Authority & Department Routing</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">Configure Ward-to-Authority department mappings for automated issue assignment.</p>
        </Link>

        <Link to="/admin/analytics" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Citywide Performance Analytics</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">View citywide charts, ward load distributions, category breakdowns, and speed trends.</p>
        </Link>

      </div>

    </div>
  );
}

