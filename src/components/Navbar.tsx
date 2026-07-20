import React from "react";
import { Github, Star, Terminal, ArrowUpRight, Activity, User, ShieldAlert, Cpu } from "lucide-react";
import { UserAccount, AppTheme } from "../types";

interface NavbarProps {
  onTerminalClick?: () => void;
  user: UserAccount | null;
  onOpenAuthModal: () => void;
  onToggleDashboard: () => void;
  isDashboardOpen: boolean;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export default function Navbar({ 
  onTerminalClick, 
  user, 
  onOpenAuthModal, 
  onToggleDashboard, 
  isDashboardOpen,
  theme,
  onThemeChange
}: NavbarProps) {
  // Theme color styling mappings
  const themeStyles = {
    cyan: {
      accentText: "text-cyan-400",
      accentBg: "bg-cyan-500/10",
      accentBorder: "border-cyan-500/30",
      accentGlow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
      pulseBorder: "border-cyan-400/20",
      hoverText: "hover:text-cyan-400",
      hoverBorder: "hover:border-cyan-500/30",
      hoverGlow: "hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]",
      btnActive: "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]",
      btnGrad: "from-cyan-500/80 to-purple-600/80 border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
    },
    pink: {
      accentText: "text-pink-400",
      accentBg: "bg-pink-500/10",
      accentBorder: "border-pink-500/30",
      accentGlow: "shadow-[0_0_15px_rgba(236,72,153,0.15)]",
      pulseBorder: "border-pink-400/20",
      hoverText: "hover:text-pink-400",
      hoverBorder: "hover:border-pink-500/30",
      hoverGlow: "hover:shadow-[0_0_15px_rgba(236,72,153,0.15)]",
      btnActive: "bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.25)]",
      btnGrad: "from-pink-500/80 to-purple-600/80 border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]"
    },
    green: {
      accentText: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      accentBorder: "border-emerald-500/30",
      accentGlow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      pulseBorder: "border-emerald-400/20",
      hoverText: "hover:text-emerald-400",
      hoverBorder: "hover:border-emerald-500/30",
      hoverGlow: "hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      btnActive: "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]",
      btnGrad: "from-emerald-500/80 to-teal-600/80 border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    }
  }[theme];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${themeStyles.accentBg} ${themeStyles.accentBorder} ${themeStyles.accentGlow}`}>
          <Activity className={`w-4.5 h-4.5 ${themeStyles.accentText}`} />
          <div className={`absolute inset-0 rounded-lg border ${themeStyles.pulseBorder} animate-pulse`} />
        </div>
        <span className="font-display font-bold text-lg tracking-wider text-white bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
          CodeRadar
        </span>
      </div>

      {/* Center Security Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-emerald-500/20 text-xs font-mono tracking-widest text-emerald-400/90 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        {user ? `SECURE SESSION: @${user.username.toUpperCase()}` : "GUEST INTERFACE // SECURE OVERLAY"}
      </div>

      {/* Right Side Links & Actions */}
      <div className="flex items-center gap-3.5">
        {/* Dynamic Theme Control Center */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-950/90 border border-white/10 rounded-lg">
          <span className="hidden sm:inline text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            THEME:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onThemeChange("cyan")}
              className={`w-3.5 h-3.5 rounded-full bg-cyan-500 border transition-all cursor-pointer ${
                theme === "cyan" 
                  ? "border-white scale-110 shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                  : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
              }`}
              title="Cyber-Cyan"
            />
            <button
              onClick={() => onThemeChange("pink")}
              className={`w-3.5 h-3.5 rounded-full bg-pink-500 border transition-all cursor-pointer ${
                theme === "pink" 
                  ? "border-white scale-110 shadow-[0_0_8px_rgba(236,72,153,0.8)]" 
                  : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
              }`}
              title="Neon-Pink"
            />
            <button
              onClick={() => onThemeChange("green")}
              className={`w-3.5 h-3.5 rounded-full bg-emerald-500 border transition-all cursor-pointer ${
                theme === "green" 
                  ? "border-white scale-110 shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
                  : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
              }`}
              title="Matrix-Green"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 text-slate-400 ${themeStyles.hoverText} transition-colors`}
            title="GitHub"
          >
            <Github className="w-4.5 h-4.5" />
          </a>
          <div
            className={`p-1.5 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-1`}
            title="Stars"
          >
            <Star className="w-4.5 h-4.5 fill-purple-500/10" />
            <span className="text-[10px] font-mono text-slate-500">8.4k</span>
          </div>
          <button
            onClick={onTerminalClick}
            className={`p-1.5 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer`}
            title="Toggle Console Log"
          >
            <Terminal className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Dynamic Auth Actions */}
        {user ? (
          <button
            type="button"
            onClick={onToggleDashboard}
            className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg text-white border transition-all duration-300 shadow-sm cursor-pointer ${
              isDashboardOpen
                ? themeStyles.btnActive
                : `bg-white/5 border-white/10 hover:bg-white/10 ${themeStyles.hoverBorder} ${themeStyles.hoverGlow}`
            }`}
          >
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            COMMAND CENTER
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg text-white bg-gradient-to-r ${themeStyles.btnGrad} hover:from-cyan-400 hover:to-purple-500 shadow-sm transition-all duration-300 group cursor-pointer`}
          >
            <User className="w-3.5 h-3.5" />
            SECURE ACCESS
          </button>
        )}
      </div>
    </header>
  );
}


