import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PredictiveRiskWidget from '../components/PredictiveRiskWidget';
import { Shield, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, closed: 0 });

  useEffect(() => {
    if (user && user.authority_id) {
      fetchAssignedIssues();
    }
  }, [user]);

  const fetchAssignedIssues = async () => {
    try {
      const res = await api.get(`/issues?authority_id=${user.authority_id}`);
      const list = res.data.issues || [];
      setIssues(list);

      setStats({
        total: list.length,
        pending: list.filter(i => i.status === 'ASSIGNED').length,
        inProgress: list.filter(i => i.status === 'IN_PROGRESS' || i.status === 'REOPENED').length,
        closed: list.filter(i => i.status === 'CLOSED').length
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            {user?.authority_name || 'Municipal Department Officer'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Department Resolution Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">Official work orders and field assignment dispatch center.</p>
        </div>

        <Link
          to="/authority/issues"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition"
        >
          View Full Assigned Work Queue &rarr;
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Assigned</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider">New Assigned</span>
          <div className="text-3xl font-extrabold text-amber-900 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[11px] text-purple-800 font-bold uppercase tracking-wider">In Progress / Reopened</span>
          <div className="text-3xl font-extrabold text-purple-900 mt-1">{stats.inProgress}</div>
        </div>
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">Verified Closed</span>
          <div className="text-3xl font-extrabold text-emerald-900 mt-1">{stats.closed}</div>
        </div>
      </div>

      {/* Weather & Predictive Civic Intelligence */}
      <PredictiveRiskWidget />

      {/* Assigned Issues Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Work Queue</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.slice(0, 6).map(issue => (
            <div key={issue.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={issue.status} />
                  <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {issue.ward_name || 'Jaipur Ward'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{issue.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{issue.address || 'Jaipur'}</span>
                <Link to={`/issues/${issue.id}`} className="text-purple-700 font-semibold flex items-center gap-1 hover:underline">
                  Manage & Upload Proof <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

