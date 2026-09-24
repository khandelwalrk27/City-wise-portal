import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
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
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            {user?.authority_name || 'Municipal Department Officer'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Department Resolution Hub
          </h1>
        </div>

        <Link
          to="/authority/issues"
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
        >
          View Full Assigned Work Queue &rarr;
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Assigned</span>
          <div className="text-3xl font-extrabold text-white mt-1">{stats.total}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">New Assigned</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">{stats.pending}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">In Progress / Reopened</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-1">{stats.inProgress}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Verified Closed</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.closed}</div>
        </div>
      </div>

      {/* Assigned Issues Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Assigned Work Queue</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.slice(0, 6).map(issue => (
            <div key={issue.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={issue.status} />
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                    {issue.ward_name || 'Jaipur Ward'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{issue.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{issue.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{issue.address || 'Jaipur'}</span>
                <Link to={`/issues/${issue.id}`} className="text-purple-400 font-semibold flex items-center gap-1 hover:underline">
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
