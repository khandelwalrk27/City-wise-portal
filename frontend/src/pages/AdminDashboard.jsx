import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Shield, Users, Building2, MapPin, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';

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
      <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            Nagar Nigam Admin Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Jaipur Municipal Master Panel
          </h1>
        </div>

        <button
          onClick={handleResetSeed}
          disabled={seeding}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Re-initializing...' : 'Re-initialize Master Database'}
        </button>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Reported Issues</span>
            <div className="text-3xl font-extrabold text-white mt-1">{stats.totalIssues}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Open Issues</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">{stats.openIssues}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Verification</span>
            <div className="text-3xl font-extrabold text-orange-400 mt-1">{stats.verificationPending}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase">Closed & Verified</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.resolvedIssues}</div>
          </div>
        </div>
      )}

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link to="/admin/wards" className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Wards & GeoJSON Management</h3>
          <p className="text-xs text-slate-400">View Jaipur municipal wards, inspect Parshad details, upload GeoJSON boundary polygons.</p>
        </Link>

        <Link to="/admin/authorities" className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Authority & Department Routing</h3>
          <p className="text-xs text-slate-400">Configure Ward-to-Authority department mappings for automated issue assignment.</p>
        </Link>

        <Link to="/admin/analytics" className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Citywide Performance Analytics</h3>
          <p className="text-xs text-slate-400">View citywide charts, ward load distributions, category breakdowns, and speed trends.</p>
        </Link>

      </div>

    </div>
  );
}
