import React from 'react';

const STATUS_CONFIG = {
  REPORTED: { label: 'Reported', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  RESOLUTION_SUBMITTED: { label: 'Resolution Submitted', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  VERIFICATION_PENDING: { label: 'Verification Pending', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  CLOSED: { label: 'Resolved & Closed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  REOPENED: { label: 'Reopened by Citizen', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {config.label}
    </span>
  );
}
