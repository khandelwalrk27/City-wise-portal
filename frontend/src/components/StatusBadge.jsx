import React from 'react';

const STATUS_CONFIG = {
  REPORTED: { label: 'Reported', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  ASSIGNED: { label: 'Assigned', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  RESOLUTION_SUBMITTED: { label: 'Resolution Submitted', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  VERIFICATION_PENDING: { label: 'Verification Pending', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  CLOSED: { label: 'Resolved & Closed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  REOPENED: { label: 'Reopened', color: 'bg-rose-50 text-rose-800 border-rose-200' }
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </span>
  );
}
