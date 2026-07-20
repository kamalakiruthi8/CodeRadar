import React from "react";
import { ShieldCheck, Wifi } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full mt-16 border-t border-white/5 bg-slate-950 px-4 sm:px-8 py-5.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-500">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-500/60" />
        <span>CODERADAR // SECURE SEC-NET PROTOCOL V2.0</span>
      </div>
      
      <div className="text-center sm:text-left text-slate-600">
        Visualizing the global code network in real-time. Unauthorized decoding strictly prohibited.
      </div>

      <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/60 border border-emerald-500/10 text-emerald-500 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.02)]">
        <Wifi className="w-3.5 h-3.5 animate-pulse" />
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        ALL SYSTEMS OPERATIONAL
      </div>
    </footer>
  );
}
