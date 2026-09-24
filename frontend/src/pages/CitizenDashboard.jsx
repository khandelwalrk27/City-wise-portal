import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PredictiveRiskWidget from '../components/PredictiveRiskWidget';
import { PlusCircle, AlertTriangle, CheckCircle2, Clock, MapPin, ArrowRight, ShieldAlert } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [pendingVerification, setPendingVerification] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0 });

  useEffect(() => {
    if (user) {
      fetchUserIssues();
    }
  }, [user]);

  const fetchUserIssues = async () => {
    try {
      const res = await api.get(`/issues?citizen_id=${user.id}`);
      const userIssues = res.data.issues || [];
      setIssues(userIssues);

      const pending = userIssues.filter(i => i.status === 'VERIFICATION_PENDING' || i.status === 'RESOLUTION_SUBMITTED');
      setPendingVerification(pending);

      setStats({
        total: userIssues.length,
        pending: pending.length,
        closed: userIssues.filter(i => i.status === 'CLOSED').length
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-indigo-400">{user?.name}</span>! 👋
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Citizen Dashboard for Jaipur Municipal Governance & Issue Reporting.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Jaipur Issue
        </Link>
      </div>

      {/* Action Required Alert Banner for Citizen Resolution Verification */}
      {pendingVerification.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-slate-950 border border-orange-500/50 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-orange-300">
                Action Required: {pendingVerification.length} Resolution(s) Awaiting Your Verification
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                The municipal authority has uploaded proof of work. Please review and verify to close out work orders.
              </p>
            </div>
          </div>

          <Link
            to={`/issues/${pendingVerification[0].id}`}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Review Evidence Now &rarr;
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Reported</span>
            <AlertTriangle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.total}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Pending Verification</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-extrabold text-orange-400">{stats.pending}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Verified Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{stats.closed}</div>
        </div>
      </div>

      {/* Predictive Weather & Civic Risk Engine */}
      <PredictiveRiskWidget />

      {/* Recent Citizen Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">My Reported Issues</h2>
          <Link to="/citizen/my-issues" className="text-xs text-indigo-400 font-semibold hover:underline">
            View All Reports &rarr;
          </Link>
        </div>

        {issues.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
            <p className="text-xs text-slate-400">You haven't reported any civic problems yet.</p>
            <Link to="/citizen/report" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
              Report Your First Problem
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {issues.slice(0, 4).map(issue => (
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
                  <Link to={`/issues/${issue.id}`} className="text-indigo-400 font-semibold flex items-center gap-1 hover:underline">
                    Timeline & Evidence <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
