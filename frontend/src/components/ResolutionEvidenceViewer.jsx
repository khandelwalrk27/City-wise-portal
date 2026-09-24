import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Image as ImageIcon, Video, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function ResolutionEvidenceViewer({ issue, media = [], isCitizen = false, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenRemarks, setReopenRemarks] = useState('');

  const reportMedia = media.filter(m => m.media_stage === 'REPORT');
  const resolutionMedia = media.filter(m => m.media_stage === 'RESOLUTION');

  const handleVerify = async (approved, remarks = '') => {
    setLoading(true);
    try {
      await api.post(`/issues/${issue.id}/verify`, { approved, remarks });
      setShowReopenModal(false);
      if (onVerified) onVerified();
    } catch (err) {
      alert('Verification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Resolution Evidence & Proof of Work
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare original report photo against resolution evidence uploaded by Authority field officers.
          </p>
        </div>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Original Report Side */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-3">
            <ImageIcon className="w-4 h-4" />
            Original Citizen Report Media
          </div>
          {reportMedia.length === 0 ? (
            <div className="h-44 bg-slate-900 rounded-lg flex items-center justify-center text-xs text-slate-500 italic">
              No original report media attached
            </div>
          ) : (
            <div className="space-y-3">
              {reportMedia.map(m => (
                <div key={m.id} className="relative rounded-lg overflow-hidden border border-slate-800">
                  {m.file_type === 'VIDEO' ? (
                    <video src={m.file_url} controls className="w-full max-h-56 object-cover" />
                  ) : (
                    <img src={m.file_url} alt="Report evidence" className="w-full max-h-56 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Authority Resolution Side */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Authority Completed Resolution Media
          </div>
          {resolutionMedia.length === 0 ? (
            <div className="h-44 bg-slate-900 rounded-lg flex items-center justify-center text-xs text-slate-500 italic">
              No resolution evidence uploaded yet
            </div>
          ) : (
            <div className="space-y-3">
              {resolutionMedia.map(m => (
                <div key={m.id} className="relative rounded-lg overflow-hidden border border-slate-800">
                  {m.file_type === 'VIDEO' ? (
                    <video src={m.file_url} controls className="w-full max-h-56 object-cover" />
                  ) : (
                    <img src={m.file_url} alt="Resolution proof" className="w-full max-h-56 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Resolution Notes */}
      {issue.resolution_notes && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-indigo-300">Official Authority Remarks:</h4>
          <p className="text-xs text-slate-200 mt-1">{issue.resolution_notes}</p>
        </div>
      )}

      {/* Citizen Interactive Verification Buttons */}
      {isCitizen && (issue.status === 'VERIFICATION_PENDING' || issue.status === 'RESOLUTION_SUBMITTED') && (
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => setShowReopenModal(true)}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/30 flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reject Resolution & Reopen Issue
          </button>

          <button
            onClick={() => handleVerify(true)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verify & Close Issue
          </button>
        </div>
      )}

      {/* Reopen Remarks Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Reopen Issue Feedback
            </div>
            <p className="text-xs text-slate-300">
              Please explain why the resolution was unsatisfactory so the authority team can address it:
            </p>
            <textarea
              value={reopenRemarks}
              onChange={(e) => setReopenRemarks(e.target.value)}
              rows={3}
              placeholder="E.g. Asphalt patch was not levelled properly / drain cover still missing..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(false, reopenRemarks)}
                disabled={loading || !reopenRemarks.trim()}
                className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-500 disabled:opacity-50"
              >
                Submit Reopen Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
