import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const COLORS = ['#f59e0b', '#3b82f6', '#a855f7', '#06b6d4', '#f97316', '#10b981', '#f43f5e'];

export default function AuthorityAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let url = '/analytics';
    if (user && user.authority_id) {
      url += `?authority_id=${user.authority_id}`;
    }
    api.get(url).then(res => setData(res.data)).catch(console.error);
  }, [user]);

  if (!data) return <div className="text-center py-20 text-slate-400 text-xs">Loading analytics...</div>;

  const { summary, byCategory, byWard, resolutionTrends } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-purple-400" />
          Department Analytics & Performance Metrics
        </h1>
        <p className="text-xs text-slate-400 mt-1">Resolution speed trends, ward load distribution, and category metrics.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Issues</span>
          <div className="text-3xl font-extrabold text-white mt-1">{summary.totalIssues}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Open Work Orders</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">{summary.openIssues}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Verified Resolved</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{summary.resolvedIssues}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Avg Resolution Time</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-1">{summary.avgResolutionHours} hrs</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Issues by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <XAxis dataKey="category_name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ward Load Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byWard} dataKey="count" nameKey="ward_name" cx="50%" cy="50%" outerRadius={80} label>
                  {byWard.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
