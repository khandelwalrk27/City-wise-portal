import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MapPicker from '../components/MapPicker';
import CameraCapture from '../components/CameraCapture';
import { MapPin, Sparkles, Building2, AlertCircle, CheckCircle2, ShieldCheck, Camera } from 'lucide-react';

export default function ReportIssuePage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [address, setAddress] = useState('Malviya Nagar, Jaipur, Rajasthan');
  
  // Coordinates & Ward Detection
  const [position, setPosition] = useState({ lat: 26.8650, lng: 75.8150 });
  const [detectedWard, setDetectedWard] = useState(null);
  const [isManualWard, setIsManualWard] = useState(false);
  const [manualWardId, setManualWardId] = useState('');

  // Media files captured via Live Camera
  const [capturedFiles, setCapturedFiles] = useState([]);

  // AI Assistance state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  // Submit loading
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (position) {
      triggerWardDetection(position.lat, position.lng);
    }
  }, [position, categoryId]);

  const fetchInitialData = async () => {
    try {
      const [catRes, wardRes] = await Promise.all([
        api.get('/categories'),
        api.get('/wards')
      ]);
      setCategories(catRes.data.categories || []);
      setWards(wardRes.data.wards || []);
      if (catRes.data.categories?.length > 0) {
        setCategoryId(catRes.data.categories[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerWardDetection = async (lat, lng) => {
    try {
      const res = await api.post('/wards/detect', { latitude: lat, longitude: lng });
      if (res.data.ward) {
        setDetectedWard(res.data.ward);
        setIsManualWard(false);
      } else {
        setDetectedWard(null);
        setIsManualWard(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setPosition({ lat, lng });
    setAddress(`Jaipur Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  };

  const handleAiSuggest = async () => {
    if (!description.trim()) {
      alert('Please enter issue description first.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post('/ai/suggest', { description });
      const data = res.data;

      if (data.priority) setPriority(data.priority);
      setAiExplanation(data.explanation || 'Assigned category based on civic keywords.');

      const matchedCat = categories.find(c => c.code.toLowerCase().includes(data.suggestedCategoryCode) || data.suggestedCategoryCode.includes(c.code));
      if (matchedCat) {
        setCategoryId(matchedCat.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !categoryId) {
      setError('Title, description, and category are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category_id', categoryId);
      formData.append('priority', priority);
      formData.append('latitude', position.lat);
      formData.append('longitude', position.lng);
      formData.append('address', address);
      if (isManualWard && manualWardId) {
        formData.append('manual_ward_id', manualWardId);
      }

      for (let i = 0; i < capturedFiles.length; i++) {
        formData.append('files', capturedFiles[i]);
      }

      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Civic issue reported successfully and saved to database!');
      navigate(`/issues/${res.data.issue.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Report Civic Issue</h1>
        <p className="text-xs text-slate-400 mt-1">Capture live evidence photos or videos, select map location, and submit to Nagar Nigam Jaipur database.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Form details & Live Camera */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep crater pothole near WTP Circle"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Detailed Description</label>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiLoading}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                {aiLoading ? 'Analyzing...' : 'Auto-Suggest Category'}
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, road hazard, waterlogging depth, or odor level..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            {aiExplanation && (
              <p className="text-[11px] text-amber-300 mt-1 italic">
                {aiExplanation}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical Emergency</option>
              </select>
            </div>
          </div>

          {/* Live Camera Capture Interface */}
          <div>
            <CameraCapture onMediaCaptured={setCapturedFiles} />
          </div>

        </div>

        {/* Right Column: GeoJSON Ward Engine & Location Map */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                Map Location Selector
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}</span>
            </div>

            <MapPicker selectedPosition={position} onLocationSelect={handleLocationSelect} height="260px" />

            {/* GeoJSON Ward Engine Banner */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                GeoJSON Ward Routing:
              </div>
              {detectedWard ? (
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Auto-Detected: {detectedWard.name} ({detectedWard.code})
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-amber-400 font-medium text-[11px]">
                    Coordinates outside boundary. Select Jaipur Ward manually:
                  </div>
                  <select
                    value={manualWardId}
                    onChange={(e) => setManualWardId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="">-- Select Jaipur Ward --</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Submitting to Database...' : 'Submit Issue & Save'}
          </button>

        </div>

      </form>

    </div>
  );
}
