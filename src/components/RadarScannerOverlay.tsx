import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Radio, Cpu, Database, Network } from "lucide-react";

interface RadarScannerOverlayProps {
  username: string;
}

interface Blip {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  size: number;
  type: "commit" | "repo" | "org" | "anomaly";
  glowing: boolean;
}

export default function RadarScannerOverlay({ username }: RadarScannerOverlayProps) {
  const [angle, setAngle] = useState(0);
  const [telemetry, setTelemetry] = useState({
    latitude: "37.7749° N",
    longitude: "122.4194° W",
    azimuth: "142.8°",
    pingMs: "48ms",
    sector: "SEC-09",
    strength: "94.2%",
  });

  const [blips, setBlips] = useState<Blip[]>([
    { id: "1", x: 35, y: 30, label: "COMMITS_CLUSTER", size: 6, type: "commit", glowing: true },
    { id: "2", x: 70, y: 45, label: "ORG_NODE_CYAN", size: 8, type: "org", glowing: false },
    { id: "3", x: 25, y: 65, label: "REPOS_DATABASE", size: 5, type: "repo", glowing: true },
    { id: "4", x: 60, y: 75, label: "LANG_MATRIX", size: 7, type: "anomaly", glowing: false },
    { id: "5", x: 48, y: 52, label: "CORE_GATEWAY", size: 10, type: "anomaly", glowing: true },
    { id: "6", x: 80, y: 20, label: "TELEMETRY_BEACON", size: 4, type: "repo", glowing: false },
  ]);

  // Rotate sweep & generate dynamic high-tech telemetry numbers
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      setAngle((prev) => (prev + 3) % 360);
    }, 30);

    const telemetryInterval = setInterval(() => {
      setTelemetry({
        latitude: `${(37 + Math.random() * 2).toFixed(4)}° N`,
        longitude: `${(122 + Math.random() * 2).toFixed(4)}° W`,
        azimuth: `${(Math.random() * 360).toFixed(1)}°`,
        pingMs: `${Math.floor(20 + Math.random() * 50)}ms`,
        sector: `SEC-${Math.floor(10 + Math.random() * 89)}`,
        strength: `${(90 + Math.random() * 9.9).toFixed(1)}%`,
      });

      // Randomly blink target nodes (blips)
      setBlips((prev) =>
        prev.map((b) =>
          Math.random() > 0.6 ? { ...b, glowing: !b.glowing } : b
        )
      );
    }, 1200);

    return () => {
      clearInterval(sweepInterval);
      clearInterval(telemetryInterval);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-cyan-500/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-md">
      {/* HUD Scanner Grid and Concentric Circles Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      {/* Cybernetic Tech Border Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-lg pointer-events-none" />

      {/* Main Container Layout */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-center z-10">
        {/* Telemetry Log Panel Left (Col span 4) */}
        <div className="md:col-span-4 flex flex-col space-y-4 font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>RADAR COORDINATES</span>
            </div>
            <p className="text-[10px] text-slate-500">Live feed mapping for @{username}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-3 rounded-lg border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-500 block">SECTOR_ID</span>
              <span className="text-xs text-white font-bold">{telemetry.sector}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-500 block">SIG_STRENGTH</span>
              <span className="text-xs text-emerald-400 font-bold">{telemetry.strength}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-500 block">AZIMUTH_INDEX</span>
              <span className="text-xs text-cyan-400 font-bold">{telemetry.azimuth}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-500 block">PING_RESPONSE</span>
              <span className="text-xs text-purple-400 font-bold">{telemetry.pingMs}</span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-900/20 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between items-center text-[9px] text-slate-400">
              <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-cyan-500" /> SYSTEM_OS</span>
              <span className="text-white font-bold">CODENET // V2</span>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-400">
              <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-purple-500" /> DATABANK</span>
              <span className="text-white font-bold">GITHUB_DECENTRAL</span>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-400">
              <span className="flex items-center gap-1.5"><Network className="w-3 h-3 text-pink-500" /> LINK_MESH</span>
              <span className="text-emerald-400 font-bold">SYNCHRONIZED</span>
            </div>
          </div>

          <div className="text-[8px] text-slate-600 space-y-1 max-h-[80px] overflow-hidden no-scrollbar">
            <p className="animate-pulse">&gt; Initializing sweep loop at 3.0° delta...</p>
            <p>&gt; Querying user profiles telemetry coordinates...</p>
            <p>&gt; Found active voxel node matrices for {username.toUpperCase()}...</p>
            <p className="text-cyan-500/80">&gt; Building 3D visual contribution index...</p>
          </div>
        </div>

        {/* Circular Sweeping Radar Target Stage Right (Col span 8) */}
        <div className="md:col-span-8 flex justify-center items-center py-4 relative">
          <div className="relative w-72 h-72 rounded-full border border-cyan-500/10 flex items-center justify-center bg-slate-950/50 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
            {/* Concentric rings */}
            <div className="absolute w-56 h-56 rounded-full border border-dashed border-cyan-500/10" />
            <div className="absolute w-40 h-40 rounded-full border border-cyan-500/5" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-cyan-500/10" />
            <div className="absolute w-8 h-8 rounded-full border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>

            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/10 pointer-events-none" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-500/10 pointer-events-none" />

            {/* Degree Markings */}
            <span className="absolute top-1 text-[8px] font-mono text-slate-600 font-bold">000°</span>
            <span className="absolute right-1.5 text-[8px] font-mono text-slate-600 font-bold">090°</span>
            <span className="absolute bottom-1 text-[8px] font-mono text-slate-600 font-bold">180°</span>
            <span className="absolute left-1.5 text-[8px] font-mono text-slate-600 font-bold">270°</span>

            {/* Sweeping radar line */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `rotate(${angle}deg)`,
                background: "conic-gradient(from 270deg, rgba(6, 182, 212, 0.25) 0deg, rgba(6, 182, 212, 0) 120deg)",
              }}
            >
              {/* Spinning leading line */}
              <div className="absolute top-0 left-1/2 -ml-[1px] h-1/2 w-[2px] bg-gradient-to-b from-cyan-400 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </div>

            {/* Simulated Data Node Blips */}
            {blips.map((blip) => {
              const dx = blip.x - 50;
              const dy = blip.y - 50;
              const angleOfBlip = (Math.atan2(dy, dx) * 180) / Math.PI + 180; // 0 to 360
              // Calculate difference from current sweep angle
              let diff = (angle - angleOfBlip + 360) % 360;
              // If sweep line recently passed over (within 90 degrees behind sweep)
              const isSwept = diff >= 0 && diff < 90;

              return (
                <div
                  key={blip.id}
                  className="absolute transition-all duration-1000"
                  style={{
                    left: `${blip.x}%`,
                    top: `${blip.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Glowing outer ring when swept or active */}
                    <AnimatePresence>
                      {(blip.glowing || isSwept) && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                          className={`absolute rounded-full pointer-events-none ${
                            blip.type === "anomaly"
                              ? "bg-pink-500/40"
                              : blip.type === "commit"
                              ? "bg-cyan-500/40"
                              : "bg-purple-500/40"
                          }`}
                          style={{ width: blip.size * 2, height: blip.size * 2 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Blip Center Dot */}
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        blip.type === "anomaly"
                          ? isSwept ? "bg-pink-400 scale-125" : "bg-pink-500/60"
                          : blip.type === "commit"
                          ? isSwept ? "bg-cyan-400 scale-125" : "bg-cyan-500/60"
                          : isSwept ? "bg-purple-400 scale-125" : "bg-purple-500/60"
                      } shadow-[0_0_8px_currentColor]`}
                      style={{
                        width: blip.size,
                        height: blip.size,
                      }}
                    />

                    {/* Blip Metadata Tag */}
                    {isSwept && (
                      <motion.div
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 0.9, x: 8 }}
                        className="absolute left-full ml-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-white/10 text-[7px] font-mono font-bold text-slate-300 pointer-events-none whitespace-nowrap"
                      >
                        {blip.label}
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Sweep Angle overlay numbers */}
            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-white/5 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400">
              BEARING: <span className="text-cyan-400 font-bold">{angle.toString().padStart(3, "0")}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
