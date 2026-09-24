import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import IssueTimeline from '../components/IssueTimeline';
import ResolutionEvidenceViewer from '../components/ResolutionEvidenceViewer';
import MapPicker from '../components/MapPicker';
import CameraCapture from '../components/CameraCapture';
import { MapPin, Building2, Shield, Calendar, AlertTriangle, CheckCircle2, Camera } from 'lucide-react';

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [issueData, setIssueData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authority work modal states
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);
  const [newStatus, setNewStatus] = useState('VERIFICATION_PENDING');
  const [remarks, setRemarks] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchIssueDetail();
  }, [id]);

  const fetchIssueDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/issues/${id}`);
      setIssueData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorityStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('remarks', remarks);

      for (let i = 0; i < resolutionFiles.length; i++) {
        formData.append('files', resolutionFiles[i]);
      }

      await api.post(`/issues/${id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Resolution status and live evidence saved successfully to database!');
      setShowAuthorityModal(false);
      fetchIssueDetail();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs">Loading issue details...</div>;
  }

  if (!issueData || !issueData.issue) {
    return <div className="text-center py-20 text-slate-400 text-xs">Issue not found.</div>;
  }

  const { issue, media, timeline, duplicateGroup } = issueData;
  const isOwnerCitizen = user && user.role === 'CITIZEN' && user.id === issue.citizen_id;
  const isAuthorityOfficer = user && (user.role === 'ADMIN' || (user.role === 'AUTHORITY' && user.authority_id === issue.authority_id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500">#ISSUE-{issue.id}</span>
            <StatusBadge status={issue.status} />
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
              {issue.priority} Priority
            </span>
          </div>

          {/* Authority Control Button */}
          {isAuthorityOfficer && (
            <button
              onClick={() => setShowAuthorityModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Camera className="w-4 h-4" />
              Update Status & Capture Resolution Proof
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{issue.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600" />
            Ward: <strong className="text-slate-900">{issue.ward_name || 'Jaipur Ward'}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-purple-600" />
            Department: <strong className="text-slate-900">{issue.authority_name || 'Municipal Department'}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Reported Date: <strong className="text-slate-900">{new Date(issue.created_at).toLocaleDateString()}</strong>
          </div>
        </div>
      </div>

      {/* Linked Duplicate Incident Group */}
      {duplicateGroup && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <strong>Incident Cluster Linked:</strong> Issue is grouped under "{duplicateGroup.title}". All reports are resolved together.
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details, Evidence Comparison & Verification */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Details</h3>
            <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">{issue.description}</p>
          </div>

          {/* Evidence Viewer (Original vs Resolution Proof) */}
          <ResolutionEvidenceViewer
            issue={issue}
            media={media}
            isCitizen={isOwnerCitizen}
            onVerified={fetchIssueDetail}
          />

          {/* Timeline History */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status History & Audit Trail</h3>
            <IssueTimeline timeline={timeline} />
          </div>

        </div>

        {/* Right Col: Map & Authority Contact */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Reported Location
            </h3>
            <p className="text-xs text-slate-900 font-bold">{issue.address || 'Jaipur'}</p>
            <MapPicker selectedPosition={{ lat: issue.latitude, lng: issue.longitude }} showWards={false} height="220px" />
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 mb-2">Responsible Authority Office</h3>
            <div className="text-slate-600 font-medium">Department: {issue.authority_department}</div>
            <div className="text-slate-600 font-medium">Email: {issue.authority_email}</div>
            <div className="text-slate-600 font-medium">Phone: {issue.authority_phone}</div>
          </div>
        </div>

      </div>

      {/* Authority Update Modal with Live Camera */}
      {showAuthorityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              Update Work Status & Capture Evidence
            </h3>

            <form onSubmit={handleAuthorityStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Target Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="IN_PROGRESS">IN_PROGRESS (Work In Progress)</option>
                  <option value="VERIFICATION_PENDING">VERIFICATION_PENDING (Submit for Citizen Proof)</option>
                  <option value="RESOLUTION_SUBMITTED">RESOLUTION_SUBMITTED (Resolution Work Done)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Officer Remarks / Work Summary</label>
                <textarea
                  rows={3}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Describe repair work undertaken, asphalt laid, drain unblocked..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none font-medium"
                />
              </div>

              {/* Live Camera Component for Resolution Evidence */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Capture Live Resolution Proof</label>
                <CameraCapture onMediaCaptured={setResolutionFiles} />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAuthorityModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  {updating ? 'Saving to Database...' : 'Save & Notify Citizen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
