import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Building2, PlusCircle, MapPin, Upload } from 'lucide-react';

export default function AdminWardsPage() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards');
      setWards(res.data.wards || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-400" />
            Jaipur Municipal Wards & Parshads
          </h1>
          <p className="text-xs text-slate-400 mt-1">Managed GeoJSON boundary polygons and ward representative records.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading wards...</div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Ward Code</th>
                  <th className="p-4">Ward Name</th>
                  <th className="p-4">Parshad Details</th>
                  <th className="p-4">Reported Issues</th>
                  <th className="p-4">Population</th>
                  <th className="p-4">Area (sq km)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {wards.map(w => (
                  <tr key={w.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono font-bold text-amber-400">{w.code}</td>
                    <td className="p-4 font-bold text-white">{w.name}</td>
                    <td className="p-4 text-slate-300 max-w-xs leading-relaxed">{w.description}</td>
                    <td className="p-4 font-bold text-indigo-400">{w.issue_count || 0}</td>
                    <td className="p-4">{w.population?.toLocaleString() || 40000}</td>
                    <td className="p-4">{w.area_sq_km || 5.0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
