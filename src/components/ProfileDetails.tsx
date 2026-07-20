import React from "react";
import { MapPin, Building, Users, Calendar, ArrowUpRight, Github, Code, FolderGit } from "lucide-react";
import { GitHubProfile } from "../types";

interface ProfileDetailsProps {
  profile: GitHubProfile;
  onTrackProfile?: (profile: GitHubProfile) => void;
  isAlreadyTracked?: boolean;
}

export default function ProfileDetails({ profile, onTrackProfile, isAlreadyTracked = false }: ProfileDetailsProps) {
  const formattedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="relative w-full p-6 sm:p-7 rounded-xl bg-slate-900/90 border border-white/10 border-t border-t-cyan-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row gap-6 items-start md:items-center overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
      {/* Decorative Cyber Border Accent */}
      <div className="absolute top-0 left-0 w-2 h-8 bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.3)] rounded-br" />
      <div className="absolute top-0 left-0 w-8 h-2 bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.3)] rounded-br" />

      {/* Avatar Section */}
      <div className="relative shrink-0 mx-auto md:mx-0">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 animate-pulse-glow shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full bg-slate-950"
          />
        </div>
        {/* Floating Code Badge */}
        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 border border-cyan-500/30 shadow-lg text-cyan-400">
          <Github className="w-4 h-4" />
        </div>
      </div>

      {/* Profile Bio & Details */}
      <div className="flex-1 w-full space-y-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                {profile.name}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-cyan-400 font-medium">
                @{profile.username}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              {onTrackProfile && (
                <button
                  type="button"
                  onClick={() => onTrackProfile(profile)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase rounded border transition-all duration-200 cursor-pointer ${
                    isAlreadyTracked
                      ? "text-emerald-400 bg-emerald-400/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                      : "text-purple-400 bg-purple-400/5 hover:bg-purple-400/10 border-purple-400/20 hover:border-purple-400/45"
                  }`}
                >
                  {isAlreadyTracked ? "✓ TRACKED NODE" : "TRACK REPO NODE"}
                </button>
              )}

              <a
                href={`https://github.com/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10 border border-cyan-400/20 hover:border-cyan-400/45 rounded transition-all duration-200"
              >
                PROFILE PATH
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {profile.bio || "No profile bio available in telemetry network."}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[10px] sm:text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{profile.location || "Virtual Node"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{profile.company || "Independent System"}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Joined {formattedDate}</span>
          </div>
        </div>

        {/* Followers / Following counts */}
        <div className="flex items-center gap-5 pt-3.5 border-t border-white/5 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-white font-bold">{profile.followers.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">FOLLOWERS</span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div>
            <span className="text-white font-bold">{profile.following.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 ml-1.5">FOLLOWING</span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div>
            <span className="text-white font-bold">{profile.publicRepos}</span>
            <span className="text-[10px] text-slate-500 ml-1.5">REPOSITORIES</span>
          </div>
        </div>
      </div>

      {/* Language Distribution Progress Column */}
      <div className="w-full md:w-56 p-4 rounded-xl bg-slate-950/60 border border-white/5 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
          <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
            <Code className="w-3 h-3 text-cyan-400" /> LANGUAGES
          </span>
          <span className="text-[9px] font-mono text-slate-500">{profile.languagesCount} found</span>
        </div>
        
        <div className="space-y-2 flex-1 justify-center">
          {profile.languages.map((lang, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-300 font-medium truncate max-w-[120px]">{lang.name}</span>
                <span className="text-slate-500 font-semibold">{lang.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                    boxShadow: `0 0 10px ${lang.color}`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
