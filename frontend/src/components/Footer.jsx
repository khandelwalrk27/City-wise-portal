import React from 'react';
import { Building2, PhoneCall, ShieldCheck, Heart, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-12 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-slate-900">CityWise Jaipur</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Smart civic issue resolution platform for Nagar Nigam Greater & Heritage Jaipur. GeoJSON-driven municipal governance and verified citizen evidence.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 mb-3 text-sm">Emergency Helplines</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-600">
              <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
              Nagar Nigam Helpline: 1800-180-6127
            </li>
            <li className="flex items-center gap-2 text-slate-600">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
              PHED Water Helpline: 0141-2740002
            </li>
            <li className="flex items-center gap-2 text-slate-600">
              <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
              JDA Control Room: 0141-2570101
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 mb-3 text-sm">Jaipur Zones Monitored</h4>
          <ul className="space-y-1 text-xs text-slate-600">
            <li>Vidhyadhar Nagar (Wards 1–42)</li>
            <li>Jhotwara Zone (Wards 43–64)</li>
            <li>Sanganer Zone (Wards 65–103)</li>
            <li>Bagru Zone (Wards 104–124)</li>
            <li>Malviya Nagar Zone (Wards 125–150)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 mb-3 text-sm">System Compliance</h4>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Full Stack Connected
            </div>
            <p className="text-[11px] text-slate-500">
              Point-in-polygon GeoJSON ward detection, live camera capture, and real-time Socket.IO notification engine.
            </p>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <div>© 2026 CityWise Jaipur Platform. All rights reserved.</div>
        <div className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Jaipur Municipal Governance
        </div>
      </div>
    </footer>
  );
}
