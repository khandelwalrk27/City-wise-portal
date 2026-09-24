import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function IssueTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-xs text-slate-400 italic">No timeline entries recorded yet.</p>;
  }

  const getStepIcon = (status) => {
    switch (status) {
      case 'CLOSED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REOPENED':
        return <RefreshCw className="w-4 h-4 text-rose-600" />;
      case 'VERIFICATION_PENDING':
      case 'RESOLUTION_SUBMITTED':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {timeline.map((item, idx) => (
        <div key={item.id || idx} className="relative flex items-start gap-4 group">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-sm">
            {getStepIcon(item.to_status)}
          </div>
          <div className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                {item.from_status ? `${item.from_status} → ${item.to_status}` : item.to_status}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1.5 font-medium">{item.remarks}</p>
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Updated by: <strong className="text-slate-800">{item.changed_by_name || 'System'}</strong> ({item.changed_by_role || 'ADMIN'})</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
