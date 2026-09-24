import React from 'react';
import { ArrowRight, CheckCircle2, Shield, MapPin, Building2, Bell, Cpu, FileCheck } from 'lucide-react';

export default function AboutPage() {
  const steps = [
    { title: '1. REPORT', desc: 'Citizen submits civic issue with category, title, description, and optional photo/video evidence.', icon: FileCheck, color: 'text-amber-400' },
    { title: '2. GEOLOCATE', desc: 'Interactive Leaflet map captures precise latitude and longitude coordinates.', icon: MapPin, color: 'text-rose-400' },
    { title: '3. IDENTIFY WARD', desc: 'Backend runs Turf.js point-in-polygon logic against official Jaipur GeoJSON ward boundaries.', icon: Building2, color: 'text-indigo-400' },
    { title: '4. ASSIGN AUTHORITY', desc: 'Ward-Authority lookup service matches Ward + Category to responsible department (PWD, PHED Water, Sanitation).', icon: Cpu, color: 'text-purple-400' },
    { title: '5. ACT', desc: 'Authority officer receives instant Socket.IO alert and updates status to IN_PROGRESS.', icon: Bell, color: 'text-cyan-400' },
    { title: '6. SUBMIT RESOLUTION', desc: 'Authority uploads photo/video resolution proof and sets status to VERIFICATION_PENDING.', icon: CheckCircle2, color: 'text-emerald-400' },
    { title: '7. CITIZEN VERIFY', desc: 'Citizen inspects completed work. Can Approve or Reject & Reopen with remarks.', icon: Shield, color: 'text-orange-400' },
    { title: '8. CLOSE', desc: 'Approved issues transition to CLOSED. Analytics performance metrics update automatically.', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">How CityWise Works</h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          CityWise is engineered for Nagar Nigam Greater & Heritage Jaipur to streamline civic complaint management through automated spatial intelligence and strict citizen verification.
        </p>
      </div>

      {/* Workflow Flowchart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-indigo-500/30 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to Make Jaipur Better?</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          Report potholes, waterlogging, garbage accumulation, or broken streetlights in your ward now.
        </p>
        <a href="/citizen/report" className="inline-block px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20">
          Report a Civic Problem
        </a>
      </div>

    </div>
  );
}
