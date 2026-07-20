import React from "react";
import { motion } from "motion/react";
import { 
  GitCommit, 
  GitMerge, 
  Building2, 
  Code2, 
  X, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  Database,
  ExternalLink
} from "lucide-react";
import { GitHubProfile } from "../types";

interface StatsDetailPanelProps {
  activeTab: "commits" | "prs" | "orgs" | "languages" | null;
  profile: GitHubProfile | null;
  onClose: () => void;
}

export default function StatsDetailPanel({ activeTab, profile, onClose }: StatsDetailPanelProps) {
  if (!activeTab || !profile) return null;

  // Format dates elegantly
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Render Commits list
  const renderCommits = () => {
    const list = profile.commitsList || [];
    if (list.length === 0) {
      return (
        <div className="text-center py-10 font-mono text-slate-500 text-xs">
          NO RECENT PUBLIC COMMITS FOUND IN TELEMETRY
        </div>
      );
    }

    // Sort newest to oldest
    const sortedList = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {sortedList.map((commit, idx) => (
          <a
            key={`commit-${commit.sha}-${idx}`}
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-950/80 border border-white/5 hover:border-purple-500/30 hover:bg-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-200 group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-1 shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <GitCommit className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-sans font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {commit.message}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-400 hover:underline">{commit.repoName}</span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDate(commit.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 border border-purple-500/20 text-purple-400 rounded">
                {commit.sha}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
          </a>
        ))}
      </div>
    );
  };

  // Render Merged PRs list
  const renderPRs = () => {
    const list = profile.prsList || [];
    if (list.length === 0) {
      return (
        <div className="text-center py-10 font-mono text-slate-500 text-xs">
          NO RECENT PUBLIC MERGED PRS FOUND IN TELEMETRY
        </div>
      );
    }

    // Sort newest to oldest
    const sortedList = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {sortedList.map((pr, idx) => (
          <a
            key={`pr-${pr.id}-${idx}`}
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-950/80 border border-white/5 hover:border-pink-500/30 hover:bg-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-200 group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-1 shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <GitMerge className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-sans font-semibold text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                  {pr.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-400 hover:underline">{pr.repoName}</span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDate(pr.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="shrink-0 px-2.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full tracking-wider uppercase">
                {pr.state}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                #{pr.id}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition-colors" />
            </div>
          </a>
        ))}
      </div>
    );
  };

  // Render Organizations
  const renderOrganizations = () => {
    const list = profile.orgsList || [];
    if (list.length === 0) {
      return (
        <div className="text-center py-10 font-mono text-slate-500 text-xs">
          NO PUBLIC ORGANIZATIONS FOUND IN TELEMETRY
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {list.map((org, idx) => (
          <a
            key={`org-${org.name}-${idx}`}
            href={org.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-4 rounded-lg bg-slate-950/80 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-200 group"
          >
            <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-white/10 group-hover:border-cyan-500/30 transition-colors">
              <img
                src={org.avatarUrl}
                alt={org.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover bg-slate-900"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                  {org.name}
                </h4>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
                {org.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    );
  };

  // Render Languages details
  const renderLanguages = () => {
    const list = profile.languagesList || [];
    if (list.length === 0) {
      return (
        <div className="text-center py-10 font-mono text-slate-500 text-xs">
          NO LANGUAGE STATISTICS FOUND IN TELEMETRY
        </div>
      );
    }

    // Format bytes elegantly
    const formatBytes = (bytes?: number) => {
      if (!bytes) return "0 B";
      if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
      if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
      return bytes + " B";
    };

    return (
      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {list.map((lang, idx) => (
          <div
            key={`lang-${lang.name}-${idx}`}
            className="p-4 rounded-lg bg-slate-950/80 border border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: lang.color, color: lang.color }}
                />
                <span className="text-xs font-mono font-bold text-white">{lang.name}</span>
              </div>
              
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  {formatBytes(lang.totalBytes)}
                </span>
                <span>•</span>
                <span>{lang.repoCount} repositories</span>
              </div>
            </div>

            <div className="relative w-full h-2.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${lang.percentage}%`, 
                  backgroundColor: lang.color,
                  boxShadow: `0 0 10px ${lang.color}80`
                }}
              />
              <span className="absolute right-2.5 top-0 text-[8px] font-mono font-black text-white/40 leading-2.5">
                {lang.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get current active tab header configurations
  const getHeaderConfig = () => {
    switch (activeTab) {
      case "commits":
        return {
          title: "ANALYTIC COMMITS TRACE",
          subtitle: `Displaying public commit timeline for @${profile.username} (newest to oldest)`,
          icon: GitCommit,
          colorClass: "text-purple-400",
          borderClass: "border-purple-500/30",
          glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.1)]"
        };
      case "prs":
        return {
          title: "PULL REQUEST INTEGRATIONS TRACE",
          subtitle: `Recent merged contributions across repositories for @${profile.username}`,
          icon: GitMerge,
          colorClass: "text-pink-400",
          borderClass: "border-pink-500/30",
          glowClass: "shadow-[0_0_20px_rgba(236,72,153,0.1)]"
        };
      case "orgs":
        return {
          title: "FEDERATED ORGANIZATIONS NODE",
          subtitle: `Public organizational associations registered to @${profile.username}`,
          icon: Building2,
          colorClass: "text-cyan-400",
          borderClass: "border-cyan-500/30",
          glowClass: "shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        };
      case "languages":
        return {
          title: "COMPILED LANGUAGES MATRIX",
          subtitle: `Complete breakdown of syntax systems detected in repos of @${profile.username}`,
          icon: Code2,
          colorClass: "text-emerald-400",
          borderClass: "border-emerald-500/30",
          glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.1)]"
        };
    }
  };

  const config = getHeaderConfig();
  if (!config) return null;
  const HeaderIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`w-full overflow-hidden mt-4 p-5 rounded-xl bg-slate-900/95 border backdrop-blur-xl ${config.borderClass} ${config.glowClass}`}
    >
      {/* Header section with closing cross */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${config.colorClass}`}>
            <HeaderIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
              {config.title}
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
              </span>
            </h3>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
              {config.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Actual tab content rendering */}
      <div className="relative">
        {activeTab === "commits" && renderCommits()}
        {activeTab === "prs" && renderPRs()}
        {activeTab === "orgs" && renderOrganizations()}
        {activeTab === "languages" && renderLanguages()}
      </div>
    </motion.div>
  );
}
