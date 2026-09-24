import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Shield } from 'lucide-react';

export default function AdminAuthoritiesPage() {
  const [authorities, setAuthorities] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [authRes, mapRes] = await Promise.all([
        api.get('/authorities'),
        api.get('/authorities/mappings')
      ]);
      setAuthorities(authRes.data.authorities || []);
      setMappings(mapRes.data.mappings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-7 h-7 text-purple-600" />
          Municipal Authority Departments & Routing
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage department officer assignments and ward-to-authority category mappings across Jaipur.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading authorities...</div>
      ) : (
        <div className="space-y-8">
          
          {/* Authorities List */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
              Registered Municipal Authorities
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Department Name</th>
                    <th className="p-4">Sector</th>
                    <th className="p-4">Contact Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Assigned Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authorities.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-bold text-purple-800">
                        <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 rounded">
                          {a.code}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{a.name}</td>
                      <td className="p-4 text-slate-600">{a.department}</td>
                      <td className="p-4 text-indigo-600 font-medium">{a.contact_email}</td>
                      <td className="p-4 text-slate-600">{a.phone}</td>
                      <td className="p-4 font-bold text-indigo-700">{a.assigned_issues_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ward-Authority Mappings */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Configured Ward-Authority Department Mappings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-4">Ward</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Responsible Authority Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mappings.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-amber-800">
                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded">
                          {m.ward_name} ({m.ward_code})
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{m.category_name || 'All Categories'}</td>
                      <td className="p-4 font-semibold text-purple-800">{m.authority_name} ({m.department})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

