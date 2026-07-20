import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Star, GitFork, Activity, ShieldCheck, ChevronRight } from "lucide-react";
import { RepoDetail, AppTheme } from "../types";

interface ContributionCubeProps {
  cubeGrid: number[][];
  username: string;
  isSuccess?: boolean;
  reposList?: RepoDetail[];
  avatarUrl?: string;
  theme?: AppTheme;
}


const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  C: "#555555",
  "C++": "#f34b7d",
  Go: "#00add8",
  Python: "#3572a5",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Swift: "#f05138",
  Shell: "#89e051"
};

function ContributionCube({
  cubeGrid,
  username,
  isSuccess = false,
  reposList = [],
  avatarUrl,
  theme = "cyan"
}: ContributionCubeProps) {
  const [hoveredVoxel, setHoveredVoxel] = useState<{ cx: number; cz: number; height: number } | null>(null);
  const [selectedVoxel, setSelectedVoxel] = useState<{ cx: number; cz: number; height: number } | null>(null);
  const [animatedGrid, setAnimatedGrid] = useState<number[][]>(() =>
    Array(5).fill(null).map(() => Array(5).fill(0.1))
  );

  // Trigger stagger grow animation when username or grid updates for 3D Cube
  useEffect(() => {
    let active = true;
    setAnimatedGrid(Array(5).fill(null).map(() => Array(5).fill(0.1)));
    setSelectedVoxel(null); // Reset selection on username or grid updates

    const timers: NodeJS.Timeout[] = [];
    cubeGrid.forEach((row, r) => {
      row.forEach((targetVal, c) => {
        const delay = (r + c) * 60;
        const t = setTimeout(() => {
          if (active) {
            setAnimatedGrid((prev) => {
              const next = prev.map((rowArr) => [...rowArr]);
              next[r][c] = targetVal;
              return next;
            });
          }
        }, delay);
        timers.push(t);
      });
    });

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [cubeGrid, username]);

  // Project 3D coordinate (x, y, z) into 2D isometric viewport (320x300)
  // Adjusted centerY and scale to elevate the cube slightly and maximize details readability
  const project = (cx: number, cy: number, cz: number) => {
    const scale = 22; // slightly larger scale for higher readability
    const centerX = 160;
    const centerY = 175; // moved up to fit axis labels comfortably below
    
    const u = centerX + (cx - cz) * scale * 0.866;
    const v = centerY + (cx + cz) * scale * 0.5 - cy * 16; // taller heights
    return { x: u, y: v };
  };

  // Vivid high-contrast cyberpunk color schemes for 3D voxel blocks
  const getVoxelColors = (val: number) => {
    // Empty / Base Tile (highly readable slate/dark-violet)
    if (val <= 0.2) {
      return {
        top: "#1e293b",     // slate-800
        left: "#0f172a",    // slate-900
        right: "#020617",   // slate-950
        border: "rgba(255,255,255,0.12)"
      };
    }

    const palettes = {
      cyan: [
        { top: "#4f46e5", left: "#3730a3", right: "#312e81", border: "rgba(99,102,241,0.5)" }, // Level 1 (Low) - Indigo
        { top: "#8b5cf6", left: "#6d28d9", right: "#5b21b6", border: "rgba(167,139,250,0.6)" }, // Level 2 (Medium-Low) - Violet
        { top: "#d946ef", left: "#a21caf", right: "#86198f", border: "rgba(244,114,182,0.7)" }, // Level 3 (Medium-High) - Fuchsia
        { top: "#06b6d4", left: "#0891b2", right: "#0e7490", border: "rgba(34,211,238,0.8)" }   // Level 4 (Peak) - Cyber-Cyan
      ],
      pink: [
        { top: "#701a75", left: "#4a044e", right: "#2e0232", border: "rgba(240,171,252,0.4)" }, // Level 1 (Low) - Purple-900
        { top: "#c026d3", left: "#a21caf", right: "#86198f", border: "rgba(232,121,249,0.5)" }, // Level 2 (Medium-Low) - Purple-600
        { top: "#db2777", left: "#be185d", right: "#9d174d", border: "rgba(244,114,182,0.6)" }, // Level 3 (Medium-High) - Pink
        { top: "#f43f5e", left: "#e11d48", right: "#be123c", border: "rgba(251,113,133,0.8)" }  // Level 4 (Peak) - Neon-Pink/Rose
      ],
      green: [
        { top: "#064e3b", left: "#022c22", right: "#011f17", border: "rgba(110,231,183,0.3)" }, // Level 1 (Low) - Emerald-950
        { top: "#059669", left: "#047857", right: "#065f46", border: "rgba(52,211,153,0.5)" }, // Level 2 (Medium-Low) - Emerald-600
        { top: "#10b981", left: "#059669", right: "#047857", border: "rgba(52,211,153,0.7)" }, // Level 3 (Medium-High) - Emerald-500
        { top: "#22c55e", left: "#16a34a", right: "#15803d", border: "rgba(74,222,128,0.8)" }  // Level 4 (Peak) - Matrix-Green
      ]
    };

    const palette = palettes[theme] || palettes.cyan;
    if (val <= 1.2) return palette[0];
    if (val <= 2.2) return palette[1];
    if (val <= 3.2) return palette[2];
    return palette[3];
  };


  // Helper to extract deterministic data for hovered block
  const getVoxelDetails = (cx: number, cz: number, h: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[cx % 7];
    const weekNum = cz + 1;
    // Calculate deterministic commits based on height
    const commitsCount = h <= 0.2 ? 0 : Math.floor(h * 11) + 2;
    const intensityPercentage = h <= 0.2 ? 0 : Math.round((h / 4.5) * 100);
    
    // Assign language based on coordinate
    const languages = ["TypeScript", "Go", "JavaScript", "Rust", "Python"];
    const language = languages[(cx + cz) % languages.length];
    
    return {
      dayName,
      weekNum,
      commitsCount,
      intensityPercentage,
      language,
      color: LANGUAGE_COLORS[language] || "#06b6d4"
    };
  };

  // Theme styling overrides for ContributionCube visual details
  const hoverFaceColor = theme === "cyan" ? "#38bdf8" : theme === "pink" ? "#f472b6" : "#4ade80";
  const hoverFaceShadow = theme === "cyan" ? "rgba(56,189,248,0.7)" : theme === "pink" ? "rgba(244,114,182,0.7)" : "rgba(74,222,128,0.7)";

  const themeClasses = {
    cyan: {
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      shadow: "shadow-[0_0_10px_rgba(6,182,212,0.1)]",
      radial1: "bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_60%)]",
      radial2: "bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_50%)]",
      orbit1: "rgba(168,85,247,0.15)",
      orbit2: "rgba(6,182,212,0.18)",
      cardBorder: "border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)] bg-slate-950/70",
      cardText: "text-sky-400",
      voxelView: "text-purple-400"
    },
    pink: {
      text: "text-pink-400",
      border: "border-pink-500/30",
      shadow: "shadow-[0_0_10px_rgba(236,72,153,0.1)]",
      radial1: "bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_60%)]",
      radial2: "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.06)_0%,transparent_50%)]",
      orbit1: "rgba(168,85,247,0.15)",
      orbit2: "rgba(236,72,153,0.18)",
      cardBorder: "border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)] bg-slate-950/70",
      cardText: "text-pink-400",
      voxelView: "text-fuchsia-400"
    },
    green: {
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      shadow: "shadow-[0_0_10px_rgba(16,185,129,0.1)]",
      radial1: "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_60%)]",
      radial2: "bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.06)_0%,transparent_50%)]",
      orbit1: "rgba(16,185,129,0.15)",
      orbit2: "rgba(34,197,94,0.18)",
      cardBorder: "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-slate-950/70",
      cardText: "text-emerald-400",
      voxelView: "text-emerald-400"
    }
  }[theme];

  return (
    <div className="relative w-full max-w-[340px] mx-auto flex flex-col items-center">
      {/* Dynamic Selector Badges */}
      <div className={`absolute -top-3.5 left-4 z-10 px-2.5 py-1 rounded bg-slate-950 border ${themeClasses.border} text-[9px] font-mono tracking-widest ${themeClasses.text} font-semibold ${themeClasses.shadow} uppercase`}>
        3D Contribution Cube
      </div>

      <div className="absolute -top-3.5 right-4 z-15 flex bg-slate-950/90 border border-white/10 rounded-full px-2.5 py-0.5 shadow-lg select-none">
        <span className={`text-[8px] font-mono font-extrabold tracking-wider ${themeClasses.voxelView} uppercase`}>
          Voxel View
        </span>
      </div>

      {/* Main Graph Container */}
      <div className="relative w-full aspect-square rounded-2xl bg-slate-950/65 border border-white/5 backdrop-blur-md overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)] flex items-center justify-center animate-float group">
        
        {/* Neon Gradient Radial Aura */}
        <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isSuccess ? "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_60%)]" : themeClasses.radial1}`} />
        <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isSuccess ? "bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1)_0%,transparent_50%)]" : themeClasses.radial2}`} />

        {/* Dynamic Vector SVG */}
        <svg 
          id="contribution-cube-svg" 
          onClick={() => setSelectedVoxel(null)}
          className={`w-full h-full max-w-[320px] max-h-[300px] select-none transition-all duration-700 cursor-default ${
            isSuccess ? "drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] filter brightness-110" : ""
          }`} 
          viewBox="0 0 320 300" 
          fill="none"
        >
          {/* Floor grid / Orbit ring */}
          <ellipse cx="160" cy="180" rx="142" ry="65" fill="none" stroke={isSuccess ? "rgba(16,185,129,0.25)" : themeClasses.orbit1} strokeWidth="1" strokeDasharray="3 3" className="transition-colors duration-700" />
          <ellipse cx="160" cy="180" rx="112" ry="51" fill="none" stroke={isSuccess ? "rgba(52,211,153,0.4)" : themeClasses.orbit2} strokeWidth="1.5" strokeDasharray="8 5" className="animate-spin transition-colors duration-700" style={{ animationDuration: "120s" }} />

          {/* Isometric Ground Grid Plate */}
          {Array(6).fill(0).map((_, i) => {
            const start1 = project(0, 0, i);
            const end1 = project(5, 0, i);
            const start2 = project(i, 0, 0);
            const end2 = project(i, 0, 5);
            return (
              <g key={`floor-grid-${i}`} className="opacity-40">
                <line x1={start1.x} y1={start1.y} x2={end1.x} y2={end1.y} stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
                <line x1={start2.x} y1={start2.y} x2={end2.x} y2={end2.y} stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
              </g>
            );
          })}

          {/* Grid of Isometric 3D Voxel Blocks */}
          {animatedGrid.map((rowArr, cx) =>
            rowArr.map((height, cz) => {
              const rawHeight = height;
              const isSelected = selectedVoxel && selectedVoxel.cx === cx && selectedVoxel.cz === cz;
              const isHovered = (hoveredVoxel && hoveredVoxel.cx === cx && hoveredVoxel.cz === cz) || isSelected;
              
              // Scale heights to make them elegant and legible. Base tiles are kept flat.
              let h = rawHeight <= 0.2 ? 0.08 : rawHeight * 1.5;
              if (isHovered && rawHeight > 0.2) {
                h += 0.45; // elevational shift on hover/click
              }

              // Project coordinates for rendering the 3D block
              const g1 = project(cx, 0, cz);
              const g2 = project(cx + 1, 0, cz);
              const g3 = project(cx + 1, 0, cz + 1);
              const g4 = project(cx, 0, cz + 1);

              const t1 = project(cx, h, cz);
              const t2 = project(cx + 1, h, cz);
              const t3 = project(cx + 1, h, cz + 1);
              const t4 = project(cx, h, cz + 1);

              const colors = getVoxelColors(rawHeight);

              return (
                <g 
                  key={`voxel-${cx}-${cz}`} 
                  onMouseEnter={() => setHoveredVoxel({ cx, cz, height: rawHeight })}
                  onMouseLeave={() => setHoveredVoxel(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedVoxel && selectedVoxel.cx === cx && selectedVoxel.cz === cz) {
                      setSelectedVoxel(null);
                    } else {
                      setSelectedVoxel({ cx, cz, height: rawHeight });
                    }
                  }}
                  className="cursor-pointer transition-all duration-200"
                >
                  {/* Left Face */}
                  <polygon
                    points={`${g4.x},${g4.y} ${g3.x},${g3.y} ${t3.x},${t3.y} ${t4.x},${t4.y}`}
                    fill={isHovered ? `${colors.left}dd` : colors.left}
                    stroke={colors.border}
                    strokeWidth={isHovered ? "1.5" : "0.5"}
                    className="transition-all duration-300"
                  />
                  {/* Right Face */}
                  <polygon
                    points={`${g2.x},${g2.y} ${g3.x},${g3.y} ${t3.x},${t3.y} ${t2.x},${t2.y}`}
                    fill={isHovered ? `${colors.right}dd` : colors.right}
                    stroke={colors.border}
                    strokeWidth={isHovered ? "1.5" : "0.5"}
                    className="transition-all duration-300"
                  />
                  {/* Top Face */}
                  <polygon
                    points={`${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y} ${t4.x},${t4.y}`}
                    fill={isHovered ? hoverFaceColor : colors.top} // Flash to a glowing highlighted color on hover!
                    stroke={isHovered ? hoverFaceColor : colors.border}
                    strokeWidth={isHovered ? "1.8" : "0.5"}
                    className="transition-all duration-300"
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 10px ${hoverFaceShadow})` : "none"
                    }}
                  />
                </g>
              );
            })
          )}

          {/* Day Labels along Right edge of the plate */}
          {["Sun", "Tue", "Thu", "Sat"].map((day, idx) => {
            const pos = project(idx * 1.3, 0, -0.65);
            return (
              <text
                key={`day-lbl-${idx}`}
                x={pos.x + 4}
                y={pos.y + 12}
                fill="rgba(255,255,255,0.45)"
                fontSize="6.5px"
                fontWeight="bold"
                fontFamily="var(--font-mono), monospace"
                textAnchor="start"
                className="pointer-events-none select-none tracking-wide"
              >
                {day}
              </text>
            );
          })}

          {/* Week Labels along Left edge of the plate */}
          {["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"].map((week, idx) => {
            const pos = project(-0.65, 0, idx);
            return (
              <text
                key={`week-lbl-${idx}`}
                x={pos.x - 6}
                y={pos.y + 12}
                fill="rgba(255,255,255,0.45)"
                fontSize="6.5px"
                fontWeight="bold"
                fontFamily="var(--font-mono), monospace"
                textAnchor="end"
                className="pointer-events-none select-none tracking-wide"
              >
                {week}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Sync Label or Hovered Voxel Details Card */}
      <div 
        id="contribution-cube-sync-label" 
        className={`mt-3.5 w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-950/40 border transition-all duration-300 min-h-[64px] ${
          (hoveredVoxel || selectedVoxel) 
            ? themeClasses.cardBorder
            : isSuccess 
              ? "border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-950/10" 
              : "border-white/5"
        }`}
      >
        {(hoveredVoxel || selectedVoxel) ? (
          (() => {
            const activeVoxel = hoveredVoxel || selectedVoxel;
            const details = getVoxelDetails(activeVoxel!.cx, activeVoxel!.cz, activeVoxel!.height);
            const isPinned = selectedVoxel && (!hoveredVoxel || (hoveredVoxel.cx === selectedVoxel.cx && hoveredVoxel.cz === selectedVoxel.cz));
            return (
              <div className="flex flex-col w-full text-left gap-1.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${themeClasses.cardText} tracking-wider uppercase flex items-center gap-1.5`}>
                    Voxel Coordinator [{activeVoxel!.cx + 1}, {activeVoxel!.cz + 1}]
                    {isPinned && (
                      <span className="text-[7.5px] px-1 py-0.2 border border-amber-500/30 bg-amber-500/10 text-amber-500 font-bold tracking-widest animate-pulse rounded">
                        PINNED
                      </span>
                    )}
                  </span>
                  <span 
                    className="text-[8.5px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 select-none font-bold" 
                    style={{ color: details.color, textShadow: `0 0 6px ${details.color}40` }}
                  >
                    {details.language}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-300">
                  <p>
                    <span className="text-white font-bold">{details.commitsCount} commits</span> on {details.dayName}
                  </p>
                  <p className="text-slate-400 text-[8.5px]">
                    Intensity: <span className="font-semibold" style={{ color: details.color }}>{details.intensityPercentage}%</span>
                  </p>
                </div>
                {/* Visual mini-bar representing intensity */}
                <div className="w-full bg-slate-900/80 h-1 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(8, details.intensityPercentage)}%`,
                      backgroundColor: details.color,
                      boxShadow: `0 0 8px ${details.color}`
                    }}
                  />
                </div>
              </div>
            );
          })()
        ) : (
          <>
            <div className="flex flex-col">
              <span className={`text-[10px] font-mono tracking-wider transition-colors duration-700 uppercase ${
                isSuccess ? "text-emerald-400 font-bold" : "text-slate-400"
              }`}>
                {isSuccess ? "TRANSMISSION SUCCESS" : "3D CUBE ACTIVE"}
              </span>
              <span className={`text-[9px] transition-colors duration-700 font-mono ${
                isSuccess ? "text-emerald-500/80" : "text-slate-500"
              }`}>
                Hover any 3D voxel block to view details
              </span>
            </div>
            <div className={`flex items-center gap-1.5 border px-2 py-0.5 rounded-full transition-all duration-700 ${
              isSuccess 
                ? "bg-emerald-500/10 border-emerald-500/40" 
                : "bg-emerald-500/5 border-emerald-500/20"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isSuccess ? "bg-emerald-300" : "bg-emerald-400"}`} />
              <span className={`text-[8px] font-mono font-bold transition-colors duration-700 ${
                isSuccess ? "text-emerald-300" : "text-emerald-400"
              }`}>
                {isSuccess ? "SECURED" : "ONLINE"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default React.memo(ContributionCube);

