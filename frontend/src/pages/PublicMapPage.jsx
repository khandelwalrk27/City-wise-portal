import React, { useEffect, useState } from 'react';
import MapPicker from '../components/MapPicker';
import api from '../services/api';
import { MapPin, Filter, Layers } from 'lucide-react';

export default function PublicMapPage() {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.categories || []));
    fetchIssues();
  }, [selectedCategory, selectedStatus]);

  const fetchIssues = async () => {
    let url = `/issues?limit=200`;
    if (selectedCategory) url += `&category_id=${selectedCategory}`;
    if (selectedStatus) url += `&status=${selectedStatus}`;
    const res = await api.get(url);
    setIssues(res.data.issues || []);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-indigo-400" />
            Nagar Nigam Jaipur Interactive GeoJSON Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Click on ward boundary polygons to inspect Parshad names & details, or click on issue pins to view reported complaint details.
          </p>
        </div>

        {/* Map Filters */}
        <div className="flex items-center gap-3">
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
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>
        </div>
      </div>

      <MapPicker issues={issues} showWards={true} height="650px" />

    </div>
  );
}
