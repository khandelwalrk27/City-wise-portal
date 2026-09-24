import React from 'react';
import { ArrowRight, CheckCircle2, Shield, MapPin, Building2, Bell, Cpu, FileCheck } from 'lucide-react';

export default function AboutPage() {
  const steps = [
    { title: '1. REPORT', desc: 'Citizen submits civic issue with category, title, description, and live photo/video evidence.', icon: FileCheck, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { title: '2. GEOLOCATE', desc: 'Interactive Leaflet map captures precise latitude and longitude coordinates.', icon: MapPin, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { title: '3. IDENTIFY WARD', desc: 'Backend runs Turf.js point-in-polygon logic against official Jaipur GeoJSON ward boundaries.', icon: Building2, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { title: '4. ASSIGN AUTHORITY', desc: 'Ward-Authority lookup service matches Ward + Category to responsible department (PWD, PHED Water, Sanitation).', icon: Cpu, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { title: '5. ACT', desc: 'Authority officer receives instant Socket.IO alert and updates status to IN_PROGRESS.', icon: Bell, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
    { title: '6. SUBMIT RESOLUTION', desc: 'Authority uploads photo/video resolution proof and sets status to VERIFICATION_PENDING.', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { title: '7. CITIZEN VERIFY', desc: 'Citizen inspects completed work. Can Approve or Reject & Reopen with remarks.', icon: Shield, color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { title: '8. CLOSE', desc: 'Approved issues transition to CLOSED. Analytics performance metrics update automatically.', icon: CheckCircle2, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How CityWise Works</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          CityWise is engineered for Nagar Nigam Greater & Heritage Jaipur to streamline civic complaint management through automated spatial intelligence and strict citizen verification.
        </p>
      </div>

      {/* Workflow Flowchart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4 hover:border-slate-300 transition">
              <div className={`p-3 rounded-xl border ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">{s.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-50/70 p-8 rounded-2xl border border-indigo-100 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Ready to Make Jaipur Better?</h2>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Report potholes, waterlogging, garbage accumulation, or broken streetlights in your ward now.
        </p>
        <a href="/citizen/report" className="inline-block px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition">
          Report a Civic Problem
        </a>
      </div>

    </div>
  );
}

