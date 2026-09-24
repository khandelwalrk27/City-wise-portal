import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowRight } from 'lucide-react';

export default function AssignedIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, [user, selectedStatus]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      let url = `/issues?limit=100`;
      if (user && user.authority_id) {
        url += `&authority_id=${user.authority_id}`;
      }
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
      }
      const res = await api.get(url);
      setIssues(res.data.issues || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Department Assigned Work Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Manage field work orders, change status, and submit resolution proof images/videos.</p>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        >
          <option value="">All Statuses</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="VERIFICATION_PENDING">Verification Pending</option>
          <option value="CLOSED">Closed</option>
          <option value="REOPENED">Reopened</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading work queue...</div>
      ) : issues.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs shadow-xs">
          No assigned issues found for your department.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map(issue => (
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
      )}

    </div>
  );
}

