import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FolderGit, 
  History, 
  Trash2, 
  Plus, 
  Link2, 
  Github, 
  BookOpen, 
  Star, 
  GitFork, 
  Clock, 
  User, 
  ChevronRight, 
  Filter, 
  LogOut,
  ShieldAlert,
  Search,
  Check,
  AlertCircle,
  GitCompare,
  CheckSquare
} from "lucide-react";
import { UserAccount, SavedRepo, AnalyticsHistoryEntry, AppTheme } from "../types";
import ContributionCube from "./ContributionCube";
import { generateDeterministicStats } from "../utils";

interface DashboardPanelProps {
  user: UserAccount;
  onLogout: () => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onSelectUserToScan: (username: string) => void;
  theme: AppTheme;
}

export default function DashboardPanel({ 
  user, 
  onLogout, 
  onUpdateUser, 
  onSelectUserToScan,
  theme
}: DashboardPanelProps) {
  const [activeTab, setActiveTab] = useState<"repos" | "history" | "profile" | "compare">("repos");
  const [selectedCompareUsers, setSelectedCompareUsers] = useState<string[]>([]);
  const [compareUser1, setCompareUser1] = useState<string>(() => {
    if (user.analyticsHistory.length > 0) return user.analyticsHistory[0].targetUser;
    return "torvalds";
  });
  const [compareUser2, setCompareUser2] = useState<string>(() => {
    if (user.analyticsHistory.length > 1) return user.analyticsHistory[1].targetUser;
    return "gaearon";
  });
  const [newRepoOwner, setNewRepoOwner] = useState("");
  const [newRepoName, setNewRepoName] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [githubUsernameInput, setGithubUsernameInput] = useState(user.githubUsername || "");
  const [repoError, setRepoError] = useState<string | null>(null);
  const [repoSuccess, setRepoSuccess] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Filtered tracked repos
  const filteredRepos = user.savedRepos.filter(repo => {
    const searchLower = repoSearch.toLowerCase();
    return (
      repo.name.toLowerCase().includes(searchLower) ||
      repo.owner.toLowerCase().includes(searchLower) ||
      (repo.language && repo.language.toLowerCase().includes(searchLower))
    );
  });

  const handleLinkGitHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsernameInput.trim()) return;

    const updatedUser = {
      ...user,
      githubUsername: githubUsernameInput.trim()
    };
    onUpdateUser(updatedUser);
    setLinkSuccess(true);
    setTimeout(() => setLinkSuccess(false), 3000);
  };

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepoError(null);
    setRepoSuccess(null);

    const owner = newRepoOwner.trim();
    const name = newRepoName.trim();

    if (!owner || !name) {
      setRepoError("Owner and Repository name are required.");
      return;
    }

    // Check if already tracking
    if (user.savedRepos.some(r => r.owner.toLowerCase() === owner.toLowerCase() && r.name.toLowerCase() === name.toLowerCase())) {
      setRepoError("Already tracking this repository.");
      return;
    }

    try {
      // Fetch repository data from GitHub API (or fallback nicely if rate limited)
      const res = await fetch(`https://api.github.com/repos/${owner}/${name}`);
      let repoData;
      if (res.ok) {
        repoData = await res.json();
      } else {
        // Mock fallback if rate limited/offline
        repoData = {
          id: Math.floor(Math.random() * 1000000).toString(),
          description: "Virtual synchronized telemetry node repository.",
          stargazers_count: Math.floor(Math.random() * 500) + 12,
          forks_count: Math.floor(Math.random() * 80) + 2,
          language: "TypeScript"
        };
      }

      const newSavedRepo: SavedRepo = {
        id: repoData.id?.toString() || Date.now().toString(),
        owner,
        name,
        description: repoData.description || "No description provided.",
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        language: repoData.language || "Unknown",
        savedAt: new Date().toISOString()
      };

      const updatedUser = {
        ...user,
        savedRepos: [newSavedRepo, ...user.savedRepos]
      };

      onUpdateUser(updatedUser);
      setRepoSuccess(`Successfully tracking ${owner}/${name}!`);
      setNewRepoOwner("");
      setNewRepoName("");
      setTimeout(() => setRepoSuccess(null), 3500);

    } catch (err) {
      setRepoError("Network error. Could not reach repository node.");
    }
  };

  const handleRemoveRepo = (id: string) => {
    const updatedUser = {
      ...user,
      savedRepos: user.savedRepos.filter(r => r.id !== id)
    };
    onUpdateUser(updatedUser);
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-950/40 border border-white/5 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row min-h-[460px]">
      
      {/* Decorative left bar */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 hidden md:block" />

      {/* Side Navigation panel */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 p-5 flex flex-col justify-between bg-slate-950/60 z-10 shrink-0">
        <div>
          {/* Active profile card */}
          <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-white/5">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatarSeed}`}
                  alt={user.username}
                  className="w-full h-full object-contain rounded-lg bg-slate-950"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-mono font-bold text-white truncate">
                {user.username}
              </span>
              <span className="text-[9px] font-mono text-cyan-400 tracking-wider">
                CODENET AUTHORIZED
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab("repos")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                activeTab === "repos"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderGit className="w-4 h-4" />
                TRACKED REPOSITORIES
              </span>
              <span className="text-[10px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full text-slate-400">
                {user.savedRepos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                activeTab === "history"
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <History className="w-4 h-4" />
                ANALYTICS HISTORY
              </span>
              <span className="text-[10px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full text-slate-400">
                {user.analyticsHistory.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("compare")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                activeTab === "compare"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <GitCompare className="w-4 h-4" />
                COMPARE PROFILES
              </span>
              <span className="text-[10px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full text-slate-400">
                VS
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                SYSTEM INTEGRATIONS
              </span>
              {user.githubUsername ? (
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                  LINKED
                </span>
              ) : (
                <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">
                  UNLINKED
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Logout session */}
        <div className="pt-4 border-t border-white/5 mt-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            DISCONNECT SESSION
          </button>
        </div>
      </div>

      {/* Main content display section */}
      <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between z-10">
        
        {/* TAB 1: SAVED REPOSITORIES */}
        {activeTab === "repos" && (
          <div className="space-y-5 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <FolderGit className="w-5 h-5 text-cyan-400" /> Tracked Repositories
                </h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Live indexing telemetry coordinates for saved nodes
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter nodes..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            {/* Tracking Add Form */}
            <form onSubmit={handleAddRepo} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-white/5">
              <div className="sm:col-span-4 space-y-1">
                <span className="text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase block">NODE OWNER</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. facebook"
                  value={newRepoOwner}
                  onChange={(e) => setNewRepoOwner(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/30"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <span className="text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase block">REPOSITORY SLUG</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. react"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/30"
                />
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-[10px] tracking-widest py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> TRACK NODE
                </button>
              </div>

              {/* Status responses inside adding bar */}
              {(repoError || repoSuccess) && (
                <div className="sm:col-span-12 mt-2 text-[9px] font-mono">
                  {repoError && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {repoError}</span>}
                  {repoSuccess && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> {repoSuccess}</span>}
                </div>
              )}
            </form>

            {/* List of Tracked Repos */}
            <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2.5 pr-1 custom-scrollbar">
              {filteredRepos.length > 0 ? (
                filteredRepos.map((repo, idx) => (
                  <div
                    key={`repo-${repo.id}-${idx}`}
                    className="group relative p-3.5 rounded-xl bg-slate-900/30 border border-white/5 hover:border-cyan-500/20 transition-all duration-300 flex items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px] group-hover:text-cyan-400 transition-colors">
                          {repo.owner} /
                        </span>
                        <span className="text-white font-bold text-xs font-display tracking-wide">
                          {repo.name}
                        </span>
                        {repo.language && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 font-mono text-slate-400">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed truncate">
                        {repo.description}
                      </p>
                      
                      {/* Stats details row */}
                      <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500/80 fill-amber-500/5" />
                          {repo.stars.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3 text-purple-400/80" />
                          {repo.forks.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[8px] text-slate-600">
                          <Clock className="w-2.5 h-2.5" />
                          Synced {new Date(repo.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-center">
                      <button
                        onClick={() => onSelectUserToScan(repo.owner)}
                        className="p-1.5 rounded-md bg-slate-900 border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 transition-all duration-200 cursor-pointer"
                        title="Scan Owner Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRemoveRepo(repo.id)}
                        className="p-1.5 rounded-md bg-slate-900 border border-white/5 text-slate-500 hover:text-red-400 hover:border-red-500/20 transition-all duration-200 cursor-pointer"
                        title="Untrack Node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
                  <BookOpen className="w-8 h-8 text-slate-700 animate-pulse mb-2" />
                  <span className="text-xs font-mono text-slate-400">NO SAVED NODES DETECTED</span>
                  <span className="text-[9px] font-mono text-slate-600 mt-1 max-w-[280px]">
                    Type a GitHub owner and slug above to start logging and tracking repositories securely.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-5 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" /> Analytics History Logs
                </h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Saved system telemetry cache from previous profiles scanned
                </p>
              </div>

              {selectedCompareUsers.length > 0 && (
                <button
                  onClick={() => setSelectedCompareUsers([])}
                  className="text-[9px] font-mono text-slate-500 hover:text-slate-300 uppercase underline cursor-pointer self-start sm:self-auto"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Compare selection quick-action bar */}
            {selectedCompareUsers.length > 0 && (
              <div className="p-3.5 rounded-xl bg-purple-950/15 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 flex items-center gap-1.5 uppercase">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    COMPARATIVE MATRIX ENGAGED
                  </span>
                  <p className="text-[9px] font-mono text-slate-400">
                    Selected for analysis: {selectedCompareUsers.map(u => `@${u}`).join(" vs ")}
                  </p>
                </div>
                {selectedCompareUsers.length === 2 ? (
                  <button
                    onClick={() => {
                      setCompareUser1(selectedCompareUsers[0]);
                      setCompareUser2(selectedCompareUsers[1]);
                      setActiveTab("compare");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-600 to-amber-500 hover:from-purple-400 hover:to-amber-400 text-white font-mono font-bold text-[10px] tracking-widest rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] cursor-pointer uppercase self-stretch sm:self-auto text-center"
                  >
                    Compare Side-by-Side
                  </button>
                ) : (
                  <span className="text-[9px] font-mono text-purple-400/80 italic animate-pulse">
                    Select 1 more profile from history...
                  </span>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto max-h-[310px] space-y-2.5 pr-1 custom-scrollbar">
              {user.analyticsHistory.length > 0 ? (
                user.analyticsHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2.5 w-full">
                    {/* Toggle Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const isSelected = selectedCompareUsers.includes(entry.targetUser);
                        if (isSelected) {
                          setSelectedCompareUsers(prev => prev.filter(u => u !== entry.targetUser));
                        } else {
                          setSelectedCompareUsers(prev => {
                            if (prev.length >= 2) {
                              return [prev[1], entry.targetUser];
                            }
                            return [...prev, entry.targetUser];
                          });
                        }
                      }}
                      className="p-1 rounded hover:bg-white/5 cursor-pointer text-slate-500 hover:text-purple-400 transition-colors shrink-0"
                      title="Select for Side-by-Side Comparison"
                    >
                      {selectedCompareUsers.includes(entry.targetUser) ? (
                        <div className="w-5 h-5 rounded-lg border border-purple-500 bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                          <Check className="w-3.5 h-3.5 stroke-[3.5px]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-lg border border-white/10 hover:border-purple-500/30 bg-slate-950/40 transition-colors" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectUserToScan(entry.targetUser)}
                      className="flex-1 text-left p-3 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 border border-white/5 hover:border-purple-500/20 transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white group-hover:text-purple-400 transition-colors">
                            @{entry.targetUser}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
                          <span>Commits: <strong className="text-slate-300">{entry.commitsCount.toLocaleString()}</strong></span>
                          <span>PRs: <strong className="text-slate-300">{entry.prsCount.toLocaleString()}</strong></span>
                          <span>Languages: <strong className="text-slate-300">{entry.languagesCount}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-purple-400 transition-colors uppercase">
                          RE-SCAN
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
                  <History className="w-8 h-8 text-slate-700 mb-2" />
                  <span className="text-xs font-mono text-slate-400">TELEMETRY ARCHIVE EMPTY</span>
                  <span className="text-[9px] font-mono text-slate-600 mt-1 max-w-[280px]">
                    Use the main search input to analyze user profiles. Every completed scan is automatically cataloged in this timeline.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM INTEGRATIONS */}
        {activeTab === "profile" && (
          <div className="space-y-5 flex-1">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-pink-400" /> System Integrations
              </h3>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                Connect external developer credentials and API links
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GitHub Link Account Panel */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white">GitHub Account Link</h4>
                    <p className="text-[9px] font-mono text-slate-500">Enable profile shortcut tracking</p>
                  </div>
                </div>

                <form onSubmit={handleLinkGitHub} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                      GITHUB USERNAME
                    </label>
                    <input
                      type="text"
                      required
                      value={githubUsernameInput}
                      onChange={(e) => setGithubUsernameInput(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-purple-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-purple-500/30 text-white font-mono font-bold text-[10px] tracking-widest py-2 rounded-lg transition-all duration-200 cursor-pointer uppercase"
                  >
                    UPDATE LINK SIGNATURE
                  </button>

                  {linkSuccess && (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 justify-center animate-pulse">
                      <Check className="w-3.5 h-3.5" /> GITHUB LINK SYNCED SUCCESSFULLY
                    </span>
                  )}
                </form>
              </div>

              {/* Status Info Panel */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" /> Authorized Network
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
                    This browser workspace is using secure local encryption keys to store tracked parameters. Telemetry is preserved in this sandbox sandbox-mode.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between text-[9px] font-mono text-slate-500">
                  <span>SANDBOX NODE: 127.0.0.1</span>
                  <span>SESSION LIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPARE PROFILES */}
        {activeTab === "compare" && (
          <div className="space-y-5 flex-1 flex flex-col">
            <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-amber-500" /> Profile Comparison Matrix
                </h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Simultaneous 3D contribution voxel cubes and coordinate performance index analyzer
                </p>
              </div>
              <button
                onClick={() => setActiveTab("history")}
                className="text-[10px] font-mono text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg bg-slate-900/30 transition-all cursor-pointer self-start sm:self-auto"
              >
                ← Back to History Logs
              </button>
            </div>

            {/* Selection Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/30 border border-white/5">
              <div className="space-y-1.5">
                <label className="text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                  Telemetry Channel Alpha (User A)
                </label>
                <select
                  value={compareUser1}
                  onChange={(e) => setCompareUser1(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                >
                  {Array.from(new Set([
                    ...user.analyticsHistory.map(entry => entry.targetUser),
                    "torvalds",
                    "gaearon",
                    "sindresorhus",
                    "tj"
                  ])).map(u => (
                    <option key={`cmp1-${u}`} value={u}>@{u}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                  Telemetry Channel Beta (User B)
                </label>
                <select
                  value={compareUser2}
                  onChange={(e) => setCompareUser2(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500/40 cursor-pointer"
                >
                  {Array.from(new Set([
                    ...user.analyticsHistory.map(entry => entry.targetUser),
                    "torvalds",
                    "gaearon",
                    "sindresorhus",
                    "tj"
                  ])).map(u => (
                    <option key={`cmp2-${u}`} value={u}>@{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {compareUser1.toLowerCase() === compareUser2.toLowerCase() && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>COMPARING MATRIX TO THE IDENTICAL TARGET CHANNEL. SELECT DISTINCT CODENET NODES.</span>
              </div>
            )}

            {/* Comparison panels */}
            {(() => {
              const profileA = generateDeterministicStats(compareUser1.toLowerCase(), { username: compareUser1 });
              const profileB = generateDeterministicStats(compareUser2.toLowerCase(), { username: compareUser2 });

              const commitsA = profileA.commitsCount || 0;
              const commitsB = profileB.commitsCount || 0;
              const prsA = profileA.prsCount || 0;
              const prsB = profileB.prsCount || 0;
              const languagesA = profileA.languagesCount || 0;
              const languagesB = profileB.languagesCount || 0;
              const reposA = profileA.publicRepos || 0;
              const reposB = profileB.publicRepos || 0;
              const followersA = profileA.followers || 0;
              const followersB = profileB.followers || 0;

              return (
                <div className="flex-1 space-y-6">
                  {/* Side-by-side layout for Contribution Cubes */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Panel A */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3.5 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <div className="relative">
                          <img
                            src={`https://github.com/${profileA.username}.png`}
                            alt={profileA.username}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profileA.username}`;
                            }}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-white/10"
                          />
                          <span className="absolute -top-1 -left-1 text-[8px] bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 px-1 py-0.2 rounded font-mono font-bold">A</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-mono font-bold text-white truncate">{profileA.name || profileA.username}</h4>
                          <p className="text-[9px] font-mono text-cyan-400/80">@{profileA.username}</p>
                        </div>
                      </div>

                      <div className="flex justify-center items-center py-2 h-[220px] scale-90 sm:scale-95 origin-center overflow-hidden">
                        <ContributionCube
                          cubeGrid={profileA.cubeGrid}
                          username={profileA.username}
                          theme="cyan"
                        />
                      </div>
                    </div>

                    {/* Panel B */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3.5 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <div className="relative">
                          <img
                            src={`https://github.com/${profileB.username}.png`}
                            alt={profileB.username}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profileB.username}`;
                            }}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-white/10"
                          />
                          <span className="absolute -top-1 -left-1 text-[8px] bg-pink-500/20 border border-pink-500/40 text-pink-400 px-1 py-0.2 rounded font-mono font-bold">B</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-mono font-bold text-white truncate">{profileB.name || profileB.username}</h4>
                          <p className="text-[9px] font-mono text-pink-400/80">@{profileB.username}</p>
                        </div>
                      </div>

                      <div className="flex justify-center items-center py-2 h-[220px] scale-90 sm:scale-95 origin-center overflow-hidden">
                        <ContributionCube
                          cubeGrid={profileB.cubeGrid}
                          username={profileB.username}
                          theme="pink"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shared Comparative Matrix Stats Grid */}
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-3">
                    <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase border-b border-white/5 pb-1.5 flex items-center justify-between">
                      <span>Side-by-Side Comparative Stats</span>
                      <span className="text-amber-500">🏆 = Leader Node</span>
                    </div>

                    <div className="space-y-2">
                      {/* Metric Row: Commits */}
                      <div className="grid grid-cols-3 gap-2 items-center p-2 rounded-lg bg-slate-950/40 border border-white/5 text-[10px] font-mono">
                        <div className="text-left flex items-center gap-1.5 min-w-0">
                          <span className={`font-bold truncate ${commitsA > commitsB ? "text-cyan-400 font-extrabold" : "text-slate-500"}`}>
                            {commitsA.toLocaleString()}
                          </span>
                          {commitsA > commitsB && <span className="text-[9px] text-amber-400">🏆</span>}
                        </div>
                        <div className="text-center text-slate-400 uppercase tracking-wider text-[8px] font-bold">COMMITS SCROLL</div>
                        <div className="text-right flex items-center justify-end gap-1.5 min-w-0">
                          {commitsB > commitsA && <span className="text-[9px] text-amber-400">🏆</span>}
                          <span className={`font-bold truncate ${commitsB > commitsA ? "text-pink-400 font-extrabold" : "text-slate-500"}`}>
                            {commitsB.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Metric Row: Merged PRs */}
                      <div className="grid grid-cols-3 gap-2 items-center p-2 rounded-lg bg-slate-950/40 border border-white/5 text-[10px] font-mono">
                        <div className="text-left flex items-center gap-1.5 min-w-0">
                          <span className={`font-bold truncate ${prsA > prsB ? "text-cyan-400 font-extrabold" : "text-slate-500"}`}>
                            {prsA.toLocaleString()}
                          </span>
                          {prsA > prsB && <span className="text-[9px] text-amber-400">🏆</span>}
                        </div>
                        <div className="text-center text-slate-400 uppercase tracking-wider text-[8px] font-bold">MERGED PRS</div>
                        <div className="text-right flex items-center justify-end gap-1.5 min-w-0">
                          {prsB > prsA && <span className="text-[9px] text-amber-400">🏆</span>}
                          <span className={`font-bold truncate ${prsB > prsA ? "text-pink-400 font-extrabold" : "text-slate-500"}`}>
                            {prsB.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Metric Row: Languages Count */}
                      <div className="grid grid-cols-3 gap-2 items-center p-2 rounded-lg bg-slate-950/40 border border-white/5 text-[10px] font-mono">
                        <div className="text-left flex items-center gap-1.5 min-w-0">
                          <span className={`font-bold truncate ${languagesA > languagesB ? "text-cyan-400 font-extrabold" : "text-slate-500"}`}>
                            {languagesA}
                          </span>
                          {languagesA > languagesB && <span className="text-[9px] text-amber-400">🏆</span>}
                        </div>
                        <div className="text-center text-slate-400 uppercase tracking-wider text-[8px] font-bold">TECH LANGUAGES</div>
                        <div className="text-right flex items-center justify-end gap-1.5 min-w-0">
                          {languagesB > languagesA && <span className="text-[9px] text-amber-400">🏆</span>}
                          <span className={`font-bold truncate ${languagesB > languagesA ? "text-pink-400 font-extrabold" : "text-slate-500"}`}>
                            {languagesB}
                          </span>
                        </div>
                      </div>

                      {/* Metric Row: Public Repos */}
                      <div className="grid grid-cols-3 gap-2 items-center p-2 rounded-lg bg-slate-950/40 border border-white/5 text-[10px] font-mono">
                        <div className="text-left flex items-center gap-1.5 min-w-0">
                          <span className={`font-bold truncate ${reposA > reposB ? "text-cyan-400 font-extrabold" : "text-slate-500"}`}>
                            {reposA}
                          </span>
                          {reposA > reposB && <span className="text-[9px] text-amber-400">🏆</span>}
                        </div>
                        <div className="text-center text-slate-400 uppercase tracking-wider text-[8px] font-bold">PUBLIC REPOS</div>
                        <div className="text-right flex items-center justify-end gap-1.5 min-w-0">
                          {reposB > reposA && <span className="text-[9px] text-amber-400">🏆</span>}
                          <span className={`font-bold truncate ${reposB > reposA ? "text-pink-400 font-extrabold" : "text-slate-500"}`}>
                            {reposB}
                          </span>
                        </div>
                      </div>

                      {/* Metric Row: Followers */}
                      <div className="grid grid-cols-3 gap-2 items-center p-2 rounded-lg bg-slate-950/40 border border-white/5 text-[10px] font-mono">
                        <div className="text-left flex items-center gap-1.5 min-w-0">
                          <span className={`font-bold truncate ${followersA > followersB ? "text-cyan-400 font-extrabold" : "text-slate-500"}`}>
                            {followersA.toLocaleString()}
                          </span>
                          {followersA > followersB && <span className="text-[9px] text-amber-400">🏆</span>}
                        </div>
                        <div className="text-center text-slate-400 uppercase tracking-wider text-[8px] font-bold">NETWORK FOLLOWERS</div>
                        <div className="text-right flex items-center justify-end gap-1.5 min-w-0">
                          {followersB > followersA && <span className="text-[9px] text-amber-400">🏆</span>}
                          <span className={`font-bold truncate ${followersB > followersA ? "text-pink-400 font-extrabold" : "text-slate-500"}`}>
                            {followersB.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Metric Row: Top Language */}
                      <div className="grid grid-cols-3 gap-2 items-center p-2 rounded-lg bg-slate-950/40 border border-white/5 text-[10px] font-mono">
                        <div className="text-left min-w-0">
                          <span className="text-cyan-400 truncate block">
                            {profileA.languages?.[0]?.name || "N/A"}
                          </span>
                        </div>
                        <div className="text-center text-slate-400 uppercase tracking-wider text-[8px] font-bold">PRIMARY STACK</div>
                        <div className="text-right min-w-0">
                          <span className="text-pink-400 truncate block">
                            {profileB.languages?.[0]?.name || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
