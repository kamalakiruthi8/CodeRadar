import React from "react";
import { motion } from "motion/react";
import { Code2, GitMerge, Users, Code } from "lucide-react";

interface StatsCardsProps {
  commits: number;
  prs: number;
  orgs: number;
  languages: number;
  activeTab?: "commits" | "prs" | "orgs" | "languages" | null;
  onTabChange?: (tab: "commits" | "prs" | "orgs" | "languages") => void;
}

interface StatConfig {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  format: (val: number) => string;
  icon: React.ComponentType<any>;
  glowClass: string;
  iconBg: string;
  iconColor: string;
}

export default function StatsCards({ 
  commits, 
  prs, 
  orgs, 
  languages,
  activeTab = null,
  onTabChange
}: StatsCardsProps) {
  const configs: StatConfig[] = [
    {
      id: "commits",
      label: "COMMITS",
      sublabel: "Total commits analyzed",
      value: commits,
      format: (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + "M+";
        if (val >= 1000) return (val / 1000).toFixed(0) + "K+";
        return val.toString();
      },
      icon: Code2,
      glowClass: "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] border-purple-500/10 hover:border-purple-500/30",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      iconColor: "text-purple-400"
    },
    {
      id: "prs",
      label: "MERGED PRs",
      sublabel: "Across all repositories",
      value: prs,
      format: (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + "M+";
        if (val >= 1000) return (val / 1000).toFixed(1) + "K+";
        return val.toString();
      },
      icon: GitMerge,
      glowClass: "hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] border-pink-500/10 hover:border-pink-500/30",
      iconBg: "bg-pink-500/10 border-pink-500/20",
      iconColor: "text-pink-400"
    },
    {
      id: "orgs",
      label: "ORGANIZATIONS",
      sublabel: "Contributed to",
      value: orgs,
      format: (val) => val.toString() + "+",
      icon: Users,
      glowClass: "hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] border-cyan-500/10 hover:border-cyan-500/30",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      iconColor: "text-cyan-400"
    },
    {
      id: "languages",
      label: "LANGUAGES",
      sublabel: "Detected in repositories",
      value: languages,
      format: (val) => val.toString() + "+",
      icon: Code,
      glowClass: "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] border-emerald-500/10 hover:border-emerald-500/30",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      iconColor: "text-emerald-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {configs.map((stat, idx) => {
        const Icon = stat.icon;
        const isActive = activeTab === stat.id;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ 
              y: -6, 
              scale: 1.02,
              boxShadow: stat.id === "commits" ? "0 15px 30px -5px rgba(168,85,247,0.22), 0 0 15px rgba(168,85,247,0.1)" :
                         stat.id === "prs" ? "0 15px 30px -5px rgba(236,72,153,0.22), 0 0 15px rgba(236,72,153,0.1)" :
                         stat.id === "orgs" ? "0 15px 30px -5px rgba(6,182,212,0.22), 0 0 15px rgba(6,182,212,0.1)" :
                         "0 15px 30px -5px rgba(16,185,129,0.22), 0 0 15px rgba(16,185,129,0.1)",
              borderColor: stat.id === "commits" ? "rgba(168,85,247,0.4)" :
                           stat.id === "prs" ? "rgba(236,72,153,0.4)" :
                           stat.id === "orgs" ? "rgba(6,182,212,0.4)" :
                           "rgba(16,185,129,0.4)",
              transition: { type: "spring", stiffness: 350, damping: 20 }
            }}
            onClick={() => onTabChange && onTabChange(stat.id as any)}
            className={`relative flex items-center gap-4 p-4.5 rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden group cursor-pointer ${
              isActive
                ? "bg-slate-900/90 scale-[1.02] shadow-[0_0_25px_rgba(6,182,212,0.12)]"
                : "bg-slate-950/50"
            } ${
              isActive
                ? stat.id === "commits" ? "border-purple-500" :
                  stat.id === "prs" ? "border-pink-500" :
                  stat.id === "orgs" ? "border-cyan-500" :
                  "border-emerald-500"
                : stat.glowClass
            }`}
          >
            {/* Glowing Corner Accents */}
            <div className={`absolute top-0 right-0 w-1.5 h-1.5 border-t border-r transition-colors ${
              isActive ? "border-cyan-400" : "border-white/10 group-hover:border-white/20"
            }`} />
            <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l transition-colors ${
              isActive ? "border-cyan-400" : "border-white/10 group-hover:border-white/20"
            }`} />

            {/* Glowing Background Glow on Hover */}
            <div 
              className="absolute -inset-x-12 -inset-y-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${
                  stat.id === "commits" ? "rgba(168,85,247,0.08)" :
                  stat.id === "prs" ? "rgba(236,72,153,0.08)" :
                  stat.id === "orgs" ? "rgba(6,182,212,0.08)" :
                  "rgba(16,185,129,0.08)"
                } 0%, transparent 65%)`
              }}
            />

            {/* Icon Circle */}
            <div className={`flex items-center justify-center w-11 h-11 rounded-lg border shrink-0 transition-all duration-300 group-hover:scale-105 ${
              isActive 
                ? stat.id === "commits" ? "bg-purple-500/20 border-purple-500/40 text-purple-300" :
                  stat.id === "prs" ? "bg-pink-500/20 border-pink-500/40 text-pink-300" :
                  stat.id === "orgs" ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" :
                  "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : stat.iconBg
            }`}>
              <Icon className={`w-5 h-5 ${isActive ? "" : stat.iconColor}`} />
            </div>

            {/* Content Text */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-[9px] font-mono font-bold tracking-wider transition-colors ${
                isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"
              }`}>
                {stat.label}
              </span>
              <span className={`text-xl sm:text-2xl font-display font-bold mt-0.5 tracking-tight transition-all duration-300 ${
                isActive ? "text-white neon-text-cyan" : "text-white group-hover:text-cyan-300"
              }`}>
                {stat.format(stat.value)}
              </span>
              <span className="text-[10px] text-slate-500 truncate mt-0.5">
                {stat.sublabel}
              </span>
            </div>

            {/* Mini active tracker circle in top-right */}
            {isActive && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  stat.id === "commits" ? "bg-purple-400" :
                  stat.id === "prs" ? "bg-pink-400" :
                  stat.id === "orgs" ? "bg-cyan-400" :
                  "bg-emerald-400"
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  stat.id === "commits" ? "bg-purple-500" :
                  stat.id === "prs" ? "bg-pink-500" :
                  stat.id === "orgs" ? "bg-cyan-500" :
                  "bg-emerald-500"
                }`} />
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
