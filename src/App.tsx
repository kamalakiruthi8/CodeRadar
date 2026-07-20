import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, Terminal as TerminalIcon, AlertTriangle, ArrowRight, Shield, Cpu } from "lucide-react";

import Navbar from "./components/Navbar";
import ContributionCube from "./components/ContributionCube";
import StatsCards from "./components/StatsCards";
import HeatmapPreview from "./components/HeatmapPreview";
import ActivityFeed from "./components/ActivityFeed";
import RadarScannerOverlay from "./components/RadarScannerOverlay";
import ProfileDetails from "./components/ProfileDetails";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import DashboardPanel from "./components/DashboardPanel";
import StatsDetailPanel from "./components/StatsDetailPanel";
import TechieBot from "./components/TechieBot";
import CyberCoreBackground from "./components/CyberCoreBackground";

import { GitHubProfile, UserAccount, SavedRepo, AnalyticsHistoryEntry, AppTheme } from "./types";
import { fetchGitHubProfile, PRESET_PROFILES } from "./utils";


// Particle Field Background Component
function ParticleField({ theme }: { theme: AppTheme }) {
  const particleBg = theme === "cyan" ? "bg-cyan-400/20" : theme === "pink" ? "bg-pink-400/20" : "bg-emerald-400/20";
  const particleShadow = theme === "cyan" 
    ? "0 0 8px rgba(6, 182, 212, 0.3)" 
    : theme === "pink" 
      ? "0 0 8px rgba(236, 72, 153, 0.3)" 
      : "0 0 8px rgba(16, 185, 129, 0.3)";

  const particles = React.useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * 5,
      xOffset: Math.random() * 40 - 20,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${particleBg}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.initialX}%`,
            top: `${p.initialY}%`,
            boxShadow: particleShadow,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, p.xOffset, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}


export default function App() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("coderadar_theme");
    return (saved === "pink" || saved === "green") ? saved : "cyan";
  });

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem("coderadar_theme", newTheme);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentUsername, setCurrentUsername] = useState("gaearon");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // profileData holds the loaded data, activeProfile holds the displayed data after terminal scanning completes
  const [profileData, setProfileData] = useState<GitHubProfile | null>(null);
  const [activeProfile, setActiveProfile] = useState<GitHubProfile | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);

  // Interactive stats detail tab state
  const [activeDetailTab, setActiveDetailTab] = useState<"commits" | "prs" | "orgs" | "languages" | null>(null);

  // User auth state
  const [loggedInUser, setLoggedInUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Success indicator glow for search bar and contribution elements
  const [showSuccessGlow, setShowSuccessGlow] = useState(false);
  const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainScannerRef = useRef<HTMLDivElement>(null);

  // Load persistent user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("coderadar_current_user");
    if (savedUser) {
      try {
        setLoggedInUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse persistent user", e);
      }
    }
  }, []);

  const handleAuthSuccess = (user: UserAccount) => {
    setLoggedInUser(user);
    localStorage.setItem("coderadar_current_user", JSON.stringify(user));
    setIsDashboardOpen(true);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("coderadar_current_user");
    setIsDashboardOpen(false);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setLoggedInUser(updatedUser);
    localStorage.setItem("coderadar_current_user", JSON.stringify(updatedUser));
    
    // Also update in the registration list
    const storedUsersRaw = localStorage.getItem("coderadar_users");
    if (storedUsersRaw) {
      try {
        const users: UserAccount[] = JSON.parse(storedUsersRaw);
        const index = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
        if (index !== -1) {
          users[index] = updatedUser;
          localStorage.setItem("coderadar_users", JSON.stringify(users));
        }
      } catch (e) {
        console.error("Failed to update registration list", e);
      }
    }
  };

  const handleTrackProfile = (profile: GitHubProfile) => {
    if (!loggedInUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const isAlreadySaved = loggedInUser.savedRepos.some(
      r => r.owner.toLowerCase() === profile.username.toLowerCase()
    );

    let updatedUser: UserAccount;
    if (isAlreadySaved) {
      updatedUser = {
        ...loggedInUser,
        savedRepos: loggedInUser.savedRepos.filter(
          r => r.owner.toLowerCase() !== profile.username.toLowerCase()
        )
      };
    } else {
      const newRepo: SavedRepo = {
        id: Date.now().toString(),
        owner: profile.username,
        name: profile.username,
        description: profile.bio || "Personal coordinate network repository node.",
        stars: profile.followers,
        forks: profile.following,
        language: profile.languages?.[0]?.name || "TypeScript",
        savedAt: new Date().toISOString()
      };
      updatedUser = {
        ...loggedInUser,
        savedRepos: [newRepo, ...loggedInUser.savedRepos]
      };
    }
    handleUpdateUser(updatedUser);
  };

  // Initial trigger scan on load
  useEffect(() => {
    handleTriggerScan("gaearon");
    return () => {
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    };
  }, []);

  // Primary action trigger for scanning profiles
  const handleTriggerScan = async (usernameToScan: string) => {
    if (!usernameToScan.trim()) return;
    
    setIsScanning(true);
    setIsTypewriterDone(false);
    setActiveProfile(null); // immediately blank out the previous profile!
    setProfileData(null); // clear data for fresh scan typewriter triggers!
    setErrorMessage(null);
    setCurrentUsername(usernameToScan.trim());
    setActiveDetailTab(null);
    
    if (glowTimeoutRef.current) {
      clearTimeout(glowTimeoutRef.current);
    }
    setShowSuccessGlow(false);
    
    try {
      const data = await fetchGitHubProfile(usernameToScan);
      setProfileData(data);
    } catch (err: any) {
      console.error("Scan error:", err);
      if (err.message === "USER_NOT_FOUND") {
        setErrorMessage(`USER "${usernameToScan.toUpperCase()}" NOT FOUND IN DATABASE`);
      } else {
        setErrorMessage("NETWORK TIMEOUT // SECURITY PATH INTERRUPTED");
      }
      setIsScanning(false);
    }
  };

  // Synchronize profile loading and typewriter completion
  useEffect(() => {
    if (profileData && isTypewriterDone) {
      setActiveProfile(profileData);
      setIsScanning(false);
      
      // Trigger neon green success indicator glow
      setShowSuccessGlow(true);
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
      glowTimeoutRef.current = setTimeout(() => {
        setShowSuccessGlow(false);
      }, 4000);
      
      // Update loggedInUser's history if logged in
      setLoggedInUser(prevUser => {
        if (!prevUser) return null;
        
        const newHistoryEntry: AnalyticsHistoryEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          targetUser: profileData.username,
          commitsCount: profileData.commitsCount,
          prsCount: profileData.prsCount,
          languagesCount: profileData.languagesCount
        };
        
        const filteredHistory = prevUser.analyticsHistory.filter(
          h => h.targetUser.toLowerCase() !== profileData.username.toLowerCase()
        );
        
        const updated = {
          ...prevUser,
          analyticsHistory: [newHistoryEntry, ...filteredHistory].slice(0, 20)
        };
        
        localStorage.setItem("coderadar_current_user", JSON.stringify(updated));
        
        // Also update general users list
        const storedUsersRaw = localStorage.getItem("coderadar_users");
        if (storedUsersRaw) {
          try {
            const users: UserAccount[] = JSON.parse(storedUsersRaw);
            const idx = users.findIndex(u => u.email.toLowerCase() === updated.email.toLowerCase());
            if (idx !== -1) {
              users[idx] = updated;
              localStorage.setItem("coderadar_users", JSON.stringify(users));
            }
          } catch (e) {
            console.error(e);
          }
        }
        
        return updated;
      });
    }
  }, [profileData, isTypewriterDone]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTriggerScan(searchQuery);
  };

  // Triggered when typing terminal completes scanning sequence
  const handleScanFinished = () => {
    setIsTypewriterDone(true);
  };

  // Scrolls and focuses on search input
  const handleAnchorToSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const presetList = [
    {
      username: "torvalds",
      name: "torvalds",
      avatar: "https://avatars.githubusercontent.com/u/1024?v=4",
      borderGlow: "hover:border-cyan-500/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
    },
    {
      username: "gaearon",
      name: "gaearon",
      avatar: "https://avatars.githubusercontent.com/u/810438?v=4",
      borderGlow: "hover:border-purple-500/40 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]"
    },
    {
      username: "sindresorhus",
      name: "sindresorhus",
      avatar: "https://avatars.githubusercontent.com/u/170270?v=4",
      borderGlow: "hover:border-pink-500/40 hover:shadow-[0_0_12px_rgba(236,72,153,0.15)]"
    },
    {
      username: "tj",
      name: "tj",
      avatar: "https://avatars.githubusercontent.com/u/25254?v=4",
      borderGlow: "hover:border-amber-500/40 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
    }
  ];

  const selectionClass = theme === "cyan" 
    ? "selection:bg-cyan-500/25 selection:text-cyan-300" 
    : theme === "pink" 
      ? "selection:bg-pink-500/25 selection:text-pink-300" 
      : "selection:bg-emerald-500/25 selection:text-emerald-300";

  const glowPlateTop = theme === "green"
    ? "bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06)_0%,transparent_60%)]"
    : "bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.06)_0%,transparent_60%)]";

  const glowPlateBottom = theme === "cyan"
    ? "bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.06)_0%,transparent_60%)]"
    : theme === "pink"
      ? "bg-[radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.06)_0%,transparent_60%)]"
      : "bg-[radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.06)_0%,transparent_60%)]";

  return (
    <div className={`relative min-h-screen bg-[#020617] text-white flex flex-col font-sans cyber-grid-${theme} ${selectionClass}`}>
      {/* Decorative cyber ambient glow background plates */}
      <div className={`absolute top-0 right-0 w-[45%] h-[40%] ${glowPlateTop} pointer-events-none`} />
      <div className={`absolute bottom-0 left-0 w-[40%] h-[40%] ${glowPlateBottom} pointer-events-none`} />
      
      {/* Subtle Interactive Cyber Motherboard Core and Rotating Radar Rings Background */}
      <CyberCoreBackground theme={theme} />

      {/* Particle background */}
      <ParticleField theme={theme} />

      {/* Modern Sticky Navbar */}
      <Navbar 
        onTerminalClick={handleAnchorToSearch} 
        user={loggedInUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleDashboard={() => setIsDashboardOpen(!isDashboardOpen)}
        isDashboardOpen={isDashboardOpen}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-10 relative z-10">
        
        {/* SECURE DASHBOARD COMMAND CENTER */}
        <AnimatePresence>
          {isDashboardOpen && loggedInUser && (
            <motion.section
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 30 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full overflow-hidden"
            >
              <DashboardPanel
                user={loggedInUser}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
                onSelectUserToScan={(username) => {
                  setSearchQuery("");
                  handleTriggerScan(username);
                }}
                theme={theme}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* UPPER HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Content Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5">
            {/* V2.0 Badge inside Hero for mobile viewport rhythm */}
            <div className="inline-flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-emerald-500/20 text-[10px] font-mono tracking-widest text-emerald-400/90">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              V2.0 // COMMAND CENTER ONLINE
            </div>

            {/* Glowing Cyber Accent Tag */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.2 rounded-md bg-cyan-950/20 border border-cyan-500/30 text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase shadow-[0_0_12px_rgba(6,182,212,0.08)]">
              <Shield className="w-3.5 h-3.5" />
              CYBERNETIC CODENET MODULE ACTIVE
            </div>

            {/* Main Cyber Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
              CodeRadar
            </h1>

            {/* Subtitle */}
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Visualize any GitHub profile: contributions, merged PRs by organization, language distribution, streaks, and a 3D contribution cube.
            </p>

            {/* Large Glowing Search Bar Form */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg relative mt-2 group">
              <div className={`absolute -inset-1.5 rounded-xl transition-all duration-700 blur-md ${
                showSuccessGlow 
                  ? "bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 opacity-60 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                  : "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 group-focus-within:opacity-40"
              }`} />
              
              <div className={`relative flex items-center bg-slate-950/90 border rounded-xl overflow-hidden backdrop-blur-xl shadow-lg transition-all duration-500 ${
                showSuccessGlow
                  ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "border-white/10 focus-within:border-cyan-500/40"
              }`}>
                <div className={`pl-4 transition-colors ${
                  showSuccessGlow
                    ? "text-emerald-400"
                    : "text-slate-500 group-focus-within:text-cyan-400"
                }`}>
                  <Search className="w-5 h-5" />
                </div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Enter GitHub username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-4 text-xs sm:text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isScanning || !searchQuery.trim()}
                  className={`mr-2 px-5 py-2.5 font-display font-bold text-[11px] sm:text-xs tracking-wider uppercase rounded-lg text-white transition-all duration-300 disabled:opacity-45 disabled:pointer-events-none ${
                    showSuccessGlow
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  }`}
                >
                  {showSuccessGlow ? "SUCCESS" : "EXPLORE"}
                </button>
              </div>

              {/* Input Error Messages */}
              {errorMessage && (
                <div className="absolute top-full left-0 right-0 mt-3 p-3 rounded-lg bg-red-950/20 border border-red-500/25 flex items-center gap-2.5 text-xs font-mono text-red-400">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>

            {/* TRY A PROFILE Selection row */}
            <div className="w-full mt-4">
              <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block mb-3">
                TRY A PROFILE
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {presetList.map((preset) => {
                  const isActive = currentUsername.toLowerCase() === preset.username;
                  return (
                    <button
                      key={preset.username}
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        handleTriggerScan(preset.username);
                      }}
                      className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/40 border text-left transition-all duration-300 group cursor-pointer ${
                        isActive
                          ? "border-cyan-400/50 bg-cyan-950/10 shadow-[0_0_12px_rgba(6,182,212,0.12)]"
                          : "border-white/5 hover:border-white/20 " + preset.borderGlow
                      }`}
                    >
                      {/* Round Avatar with neon pulsing effect */}
                      <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img
                          src={preset.avatar}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-mono font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                          {preset.name}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">GITHUB</span>
                      </div>

                      {/* Small floating status light */}
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Hero Right Voxel 3D Cube Column (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <ContributionCube
              cubeGrid={activeProfile?.cubeGrid || Array(5).fill(null).map(() => Array(5).fill(0.1))}
              username={currentUsername}
              isSuccess={showSuccessGlow}
              reposList={activeProfile?.reposList}
              avatarUrl={activeProfile?.avatarUrl}
              theme={theme}
            />
          </div>

        </section>

        {/* PROFILE REVEAL & SCANNER DYNAMICS */}
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div
              key="scanner-centered"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-2xl mx-auto py-10 flex flex-col items-center justify-center min-h-[420px] relative z-20"
            >
              <div className="w-full text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase mb-4 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  SYSTEM SCANNING // METRICS COMPILING
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  Synchronizing Coordinate Matrix: <span className="text-cyan-400 font-mono">@{currentUsername}</span>
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Establishing link with GitHub decentral database, building 3D voxel meshes, and mapping organization commits...
                </p>
              </div>

              <div className="w-full space-y-6">
                <RadarScannerOverlay username={currentUsername} />

                <div className="w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded-xl border border-cyan-500/20">
                  <ActivityFeed
                    username={currentUsername}
                    repoCount={profileData?.publicRepos || 0}
                    topLanguage={profileData?.languages?.[0]?.name || "TypeScript"}
                    isScanning={isScanning}
                    onScanComplete={handleScanFinished}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            activeProfile && (
              <motion.div
                key="dashboard-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-10 w-full"
              >
                {/* PROFILE SLIDE-IN REVEAL */}
                <section className="w-full pt-4">
                  <ProfileDetails 
                    profile={activeProfile} 
                    onTrackProfile={handleTrackProfile}
                    isAlreadyTracked={activeProfile ? loggedInUser?.savedRepos.some(r => r.owner.toLowerCase() === activeProfile.username.toLowerCase()) : false}
                  />
                </section>

                {/* STATIC CARDS SUMMARY */}
                <section className="w-full pt-4">
                  <StatsCards
                    commits={activeProfile.commitsCount || 0}
                    prs={activeProfile.prsCount || 0}
                    orgs={activeProfile.orgsCount || 0}
                    languages={activeProfile.languagesCount || 0}
                    activeTab={activeDetailTab}
                    onTabChange={(tab) => {
                      setActiveDetailTab(prev => prev === tab ? null : tab);
                    }}
                  />

                  <AnimatePresence>
                    {activeDetailTab && (
                      <StatsDetailPanel
                        activeTab={activeDetailTab}
                        profile={activeProfile}
                        onClose={() => setActiveDetailTab(null)}
                      />
                    )}
                  </AnimatePresence>
                </section>

                {/* BOTTOM METRICS PANEL (Heatmap & Activity Terminal Feed) */}
                <section ref={mainScannerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                  {/* Contribution Heatmap (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col justify-stretch">
                    <HeatmapPreview
                      heatmapData={activeProfile.heatmapData || []}
                    />
                  </div>

                  {/* Typewriter Terminal Activity Feed (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-stretch">
                    <ActivityFeed
                      username={currentUsername}
                      repoCount={activeProfile.publicRepos || 0}
                      topLanguage={activeProfile.languages?.[0]?.name || "TypeScript"}
                      isScanning={isScanning}
                      onScanComplete={handleScanFinished}
                    />
                  </div>
                </section>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <section className="relative w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#100720] border border-white/5 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {/* Bottom Aura */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4.5 text-center sm:text-left">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Ready to explore the code universe?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                Search any GitHub profile to get started with beautiful visualizations, language statistics, and contribution meshes.
              </p>
            </div>
          </div>

          <button
            onClick={handleAnchorToSearch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-mono font-bold tracking-widest text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all duration-300 group shrink-0"
          >
            START EXPLORING
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

      </main>

      {/* Cyber-tech Footer */}
      <Footer />

      {/* TECHIE AI BOT */}
      <TechieBot theme={theme} />

      {/* SECURE CREDENTIAL ACCESS MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

