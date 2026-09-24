import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { PlusCircle, ArrowRight } from 'lucide-react';

export default function MyIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get(`/issues?citizen_id=${user.id}`)
        .then(res => setIssues(res.data.issues || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Reported Issues</h1>
          <p className="text-xs text-slate-400 mt-1">Track history and inspect evidence for your submitted civic complaints in Jaipur.</p>
        </div>

        <Link
          to="/citizen/report"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          Report Issue
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading your issues...</div>
      ) : issues.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <p className="text-xs text-slate-400">You haven't reported any issues yet.</p>
          <Link to="/citizen/report" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
            Report First Issue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map(issue => (
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
                  View Evidence & Timeline <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
