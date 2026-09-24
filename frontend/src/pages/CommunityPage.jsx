import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ThumbsUp, MapPin, Sparkles, Building2 } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
    fetchIssues();
  }, [selectedCategory, selectedStatus, selectedWard]);

  const fetchFilters = async () => {
    try {
      const [catRes, wardRes] = await Promise.all([
        api.get('/categories'),
        api.get('/wards')
      ]);
      setCategories(catRes.data.categories || []);
      setWards(wardRes.data.wards || []);
    } catch (e) {}
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      let url = `/issues?limit=100`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;
      if (selectedWard) url += `&ward_id=${selectedWard}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setIssues(res.data.issues || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportToggle = async (issueId) => {
    if (!user) {
      alert('Please sign in to support issues.');
      return;
    }
    try {
      const res = await api.post(`/issues/${issueId}/support`);
      setIssues(prev => prev.map(i => {
        if (i.id === issueId) {
          return { ...i, support_count: res.data.support_count };
        }
        return i;
      }));
    } catch (e) {
      alert('Support toggle failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white">Jaipur Civic Community</h1>
        <p className="text-xs text-slate-400 mt-1">Explore reported issues across Jaipur municipal wards and upvote issues requiring urgent attention.</p>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Jaipur issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIssues()}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="VERIFICATION_PENDING">Verification Pending</option>
            <option value="CLOSED">Resolved & Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Jaipur Wards</option>
            {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading Jaipur community issues...</div>
      ) : issues.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-xs">No issues found matching your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {issues.map(issue => (
            <div key={issue.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800 hover:border-indigo-500/40 transition">
              
              {/* Optional Thumbnail Image */}
              {issue.primary_image && (
                <div className="h-44 w-full bg-slate-900 overflow-hidden">
                  <img src={issue.primary_image} alt={issue.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={issue.status} />
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {issue.ward_name || 'Jaipur Ward'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{issue.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{issue.description}</p>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {issue.address || 'Jaipur City'}
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleSupportToggle(issue.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{issue.support_count || 0} Upvotes</span>
                </button>

                <Link to={`/issues/${issue.id}`} className="text-indigo-400 font-semibold hover:underline">
                  View Timeline &rarr;
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
