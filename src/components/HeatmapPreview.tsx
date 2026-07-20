import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { HeatmapDay } from "../types";

interface HeatmapPreviewProps {
  heatmapData: HeatmapDay[];
}

export default function HeatmapPreview({ heatmapData }: HeatmapPreviewProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [highContrast, setHighContrast] = useState(false);

  // Group days by rows (r: 0 = Mon, 1 = Wed, 2 = Fri)
  const rows = [0, 1, 2];
  const rowLabels = ["Mon", "Wed", "Fri"];

  // Colors based on contribution intensity levels (0 to 4)
  const getCellClasses = (level: number) => {
    if (highContrast) {
      switch (level) {
        case 0:
          return "bg-slate-800 border border-slate-700 hover:border-cyan-400 hover:bg-slate-700 hover:scale-110 transition-all duration-150";
        case 1:
          return "bg-cyan-950 border border-cyan-800 hover:border-cyan-400 hover:scale-110 hover:shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-150";
        case 2:
          return "bg-cyan-700 border border-cyan-500 hover:border-cyan-300 hover:scale-110 hover:shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-150";
        case 3:
          return "bg-cyan-400 border border-cyan-200 hover:border-white hover:scale-110 hover:shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-150";
        case 4:
          return "bg-white border border-cyan-100 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.95)] transition-all duration-150";
        default:
          return "bg-slate-800 border border-slate-700";
      }
    }

    // Classic/improved colors (much brighter and higher contrast than before!)
    switch (level) {
      case 0:
        return "bg-slate-800/90 border border-slate-700/60 hover:border-cyan-400 hover:bg-slate-700 hover:scale-110 transition-all duration-150";
      case 1:
        return "bg-emerald-950 border border-emerald-800 hover:border-emerald-400 hover:scale-110 hover:shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-150";
      case 2:
        return "bg-emerald-700/90 border border-emerald-500 hover:border-emerald-300 hover:scale-110 hover:shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all duration-150";
      case 3:
        return "bg-emerald-400 border border-emerald-200 hover:border-white hover:scale-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.8)] transition-all duration-150";
      case 4:
        return "bg-emerald-300 border border-white hover:scale-110 hover:shadow-[0_0_18px_rgba(110,231,183,0.9)] transition-all duration-150";
      default:
        return "bg-slate-800/90 border border-slate-700/60";
    }
  };

  // Month positions across 24 columns
  const monthLabels = [
    { name: "Jul", colIndex: 0 },
    { name: "Aug", colIndex: 2 },
    { name: "Sep", colIndex: 4 },
    { name: "Oct", colIndex: 6 },
    { name: "Nov", colIndex: 8 },
    { name: "Dec", colIndex: 10 },
    { name: "Jan", colIndex: 12 },
    { name: "Feb", colIndex: 14 },
    { name: "Mar", colIndex: 16 },
    { name: "Apr", colIndex: 18 },
    { name: "May", colIndex: 20 },
    { name: "Jun", colIndex: 22 }
  ];

  return (
    <div className="relative w-full p-4 sm:p-5.5 rounded-xl bg-slate-900/90 border border-white/10 border-t border-t-cyan-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            CONTRIBUTION HEATMAP PREVIEW
          </span>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`ml-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-all duration-300 cursor-pointer ${
              highContrast 
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]" 
                : "bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {highContrast ? "HIGH-CONTRAST: ON" : "HIGH-CONTRAST: OFF"}
          </button>
        </div>

        {/* Legend & Month Filter */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-300 font-bold self-end sm:self-auto">
          {/* Legend */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Less</span>
            {highContrast ? (
              <>
                <div className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700" />
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-950 border border-cyan-800" />
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-700 border border-cyan-500" />
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 border border-cyan-200" />
                <div className="w-2.5 h-2.5 rounded-sm bg-white border border-cyan-200 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-sm bg-slate-800/90 border border-slate-700/60" />
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-800" />
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700/90 border border-emerald-500" />
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-emerald-200" />
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-300 border border-white shadow-[0_0_4px_rgba(110,231,183,0.5)]" />
              </>
            )}
            <span className="text-slate-400">More</span>
          </div>

          <div className="h-3 w-px bg-white/15" />

          {/* Timeframe */}
          <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded font-bold">
            <span>This year</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative w-full overflow-x-auto no-scrollbar">
        <div className="min-w-[620px] pb-1">
          {/* Month Labels row */}
          <div className="relative h-5 w-full flex text-[10px] font-mono text-slate-300 font-bold mb-1">
            <div className="w-10 shrink-0" /> {/* Column alignment spacing */}
            <div className="relative flex-1 grid grid-cols-24 gap-1.5">
              {monthLabels.map((m, idx) => (
                <div
                  key={idx}
                  className="absolute text-[9px] uppercase tracking-wider"
                  style={{ left: `${(m.colIndex / 24) * 100}%` }}
                >
                  {m.name}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Grid Row by Row */}
          <div className="flex flex-col gap-1.5">
            {rows.map((rowIdx) => {
              // Extract items for this specific row index (24 items per row)
              const rowItems = heatmapData.filter((_, i) => i % 3 === rowIdx);

              return (
                <div key={rowIdx} className="flex items-center">
                  {/* Row Label (Mon, Wed, Fri) */}
                  <span className="w-10 shrink-0 text-[10px] font-mono text-slate-300 font-bold text-left">
                    {rowLabels[rowIdx]}
                  </span>

                  {/* Grid columns */}
                  <div className="flex-1 grid grid-cols-24 gap-1.5">
                    {rowItems.map((cell, colIdx) => {
                      const absoluteIdx = colIdx * 3 + rowIdx;
                      const isHovered = hoveredCell === absoluteIdx;

                      return (
                        <div
                          key={colIdx}
                          className="relative aspect-square"
                          onMouseEnter={() => setHoveredCell(absoluteIdx)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {/* Heatmap block */}
                          <div
                            className={`w-full h-full rounded-sm cursor-pointer transition-all duration-200 ${getCellClasses(
                              cell.level
                            )}`}
                          />

                          {/* Interactive Tooltip popup on Hover */}
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-20 w-44 pointer-events-none">
                              <div className="relative p-2.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-[10px] font-mono text-white shadow-2xl backdrop-blur-md">
                                <p className="font-extrabold text-cyan-400 text-[11px] leading-tight">
                                  {cell.count === 0 ? "No contributions" : `${cell.count} contributions`}
                                </p>
                                <p className="text-slate-200 font-medium mt-1">
                                  on {cell.monthName} {colIdx * 1 + rowIdx * 3 + 1}, 2026
                                </p>
                                {/* Tooltip caret arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
