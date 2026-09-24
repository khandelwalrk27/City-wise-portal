import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PredictiveRiskWidget from '../components/PredictiveRiskWidget';
import CivicInteractiveMap from '../components/CivicInteractiveMap';
import { PlusCircle, AlertTriangle, CheckCircle2, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, <span className="text-indigo-600">{user?.name}</span> 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Citizen Hub for Jaipur Municipal Governance & Issue Reporting.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Jaipur Issue
        </Link>
      </div>

      {/* Verification Required Alert */}
      {pendingVerification.length > 0 && (
        <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Action Required: {pendingVerification.length} Resolution(s) Awaiting Your Verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                The municipal authority has uploaded proof of work. Please review and verify to close out work orders.
              </p>
            </div>
          </div>

          <Link
            to={`/issues/${pendingVerification[0].id}`}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
          >
            Review Evidence Now &rarr;
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Total Reported</span>
            <AlertTriangle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Pending Verification</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-extrabold text-orange-800">{stats.pending}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Verified Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-800">{stats.closed}</div>
        </div>
      </div>

      {/* Prominent Large Interactive Civic Map */}
      <CivicInteractiveMap 
        title="Jaipur Live Civic Operations & Multi-Feed Map" 
      />

      {/* Predictive Weather & Risk Engine */}
      <PredictiveRiskWidget />

      {/* Recent Citizen Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">My Reported Issues</h2>
          <Link to="/citizen/my-issues" className="text-xs text-indigo-600 font-bold hover:underline">
            View All Reports &rarr;
          </Link>
        </div>

        {issues.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl space-y-3 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">You haven't reported any civic problems yet.</p>
            <Link to="/citizen/report" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm">
              Report Your First Problem
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {issues.slice(0, 4).map(issue => (
              <div key={issue.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={issue.status} />
                    <span className="text-[10px] text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {issue.ward_name || 'Jaipur Ward'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 font-medium">{issue.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{issue.address || 'Jaipur'}</span>
                  <Link to={`/issues/${issue.id}`} className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
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
