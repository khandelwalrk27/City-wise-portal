import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Image as ImageIcon, AlertTriangle, Clock } from 'lucide-react';
import api from '../services/api';
import { getCivicThumbnail, getCivicResolutionImage } from '../utils/civicImages';

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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Resolution Evidence & Proof of Work
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare original report photo against resolution evidence uploaded by Authority field officers.
          </p>
        </div>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Original Report Side */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-3">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            Original Citizen Report Evidence
          </div>
          {reportMedia.length === 0 ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img 
                src={getCivicThumbnail(issue)} 
                alt="Representative citizen report evidence" 
                className="w-full h-48 object-cover" 
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold backdrop-blur-xs">
                Incident Location Evidence
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {reportMedia.map(m => (
                <div key={m.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
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
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs mb-3">
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
            Authority Completed Resolution Evidence
          </div>
          {resolutionMedia.length === 0 ? (
            ['VERIFICATION_PENDING', 'CLOSED', 'RESOLUTION_SUBMITTED'].includes(issue.status) ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
                <img 
                  src={getCivicResolutionImage(issue)} 
                  alt="Official resolution proof" 
                  className="w-full h-48 object-cover" 
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-800/85 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  Official Field Resolution Proof
                </div>
              </div>
            ) : (
              <div className="h-48 bg-white border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-xs font-bold text-slate-800">Authority Work in Progress</div>
                <p className="text-[11px] text-slate-500 max-w-xs font-medium">
                  Field crew is dispatched. Live resolution photo will be uploaded once repair is completed.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {resolutionMedia.map(m => (
                <div key={m.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
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
        <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl">
          <h4 className="text-xs font-bold text-indigo-900">Official Authority Remarks:</h4>
          <p className="text-xs text-slate-700 mt-1 font-medium">{issue.resolution_notes}</p>
        </div>
      )}

      {/* Citizen Interactive Verification Buttons */}
      {isCitizen && (issue.status === 'VERIFICATION_PENDING' || issue.status === 'RESOLUTION_SUBMITTED') && (
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => setShowReopenModal(true)}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            Reject Resolution & Reopen Issue
          </button>

          <button
            onClick={() => handleVerify(true)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verify & Close Issue
          </button>
        </div>
      )}

      {/* Reopen Remarks Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Reopen Issue Feedback
            </div>
            <p className="text-xs text-slate-600">
              Please explain why the resolution was unsatisfactory so the authority team can address it:
            </p>
            <textarea
              value={reopenRemarks}
              onChange={(e) => setReopenRemarks(e.target.value)}
              rows={3}
              placeholder="E.g. Asphalt patch was not levelled properly / drain cover still missing..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(false, reopenRemarks)}
                disabled={loading || !reopenRemarks.trim()}
                className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 shadow-sm"
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
