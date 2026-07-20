import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Key, Mail, User, Github, AlertTriangle, X, Check, ArrowRight } from "lucide-react";
import { UserAccount } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [githubUser, setGithubUser] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!email || !password) {
      setError("CRITICAL: EMAIL AND PASSWORD ARE REQUIRED FOR ENCRYPTION");
      return;
    }
    if (!isLogin && !username) {
      setError("CRITICAL: USERNAME IS REQUIRED FOR ACCOUNT PROVISIONING");
      return;
    }

    // Get current registered users from localStorage
    const storedUsersRaw = localStorage.getItem("coderadar_users");
    const users: UserAccount[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    if (isLogin) {
      // Find matching user
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!foundUser) {
        setError("ACCESS DENIED: INVALID ACCOUNT CREDENTIALS");
        return;
      }
      
      setSuccess("ACCESS GRANTED: INITIALIZING SESSION...");
      setTimeout(() => {
        onAuthSuccess(foundUser);
        onClose();
      }, 1000);
    } else {
      // Sign up flow
      const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        setError("PROVISIONING FAILED: EMAIL PATH ALREADY REGISTERED");
        return;
      }

      const newUser: UserAccount = {
        email,
        username,
        githubUsername: githubUser.trim() ? githubUser.trim() : null,
        savedRepos: [],
        analyticsHistory: [],
        avatarSeed: username + Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem("coderadar_users", JSON.stringify(users));

      setSuccess("PROVISIONING COMPLETE: CODENET INTEGRATED!");
      setTimeout(() => {
        onAuthSuccess(newUser);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-2xl overflow-hidden"
      >
        {/* Holographic Glowing Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <h2 className="font-display font-extrabold text-xl tracking-wider text-white">
            {isLogin ? "COMMAND DECRYPT" : "CODENET PROVISION"}
          </h2>
          <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            {isLogin ? "Decrypt session identity" : "Register a security credential"}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-900 border border-white/5 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`py-1.5 text-[10px] font-mono font-bold tracking-widest rounded-md uppercase transition-all duration-200 cursor-pointer ${
              isLogin
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            LOG IN
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`py-1.5 text-[10px] font-mono font-bold tracking-widest rounded-md uppercase transition-all duration-200 cursor-pointer ${
              !isLogin
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            SIGN UP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              SECURE EMAIL PATH
            </label>
            <div className="relative flex items-center bg-slate-900/60 border border-white/5 rounded-lg focus-within:border-cyan-500/40 transition-colors">
              <span className="pl-3.5 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="identity@coderadar.net"
                className="w-full bg-transparent p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Username (Only for Sign Up) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                CODENAME SIGNATURE
              </label>
              <div className="relative flex items-center bg-slate-900/60 border border-white/5 rounded-lg focus-within:border-purple-500/40 transition-colors">
                <span className="pl-3.5 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cyber_runner"
                  className="w-full bg-transparent p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              SESSION KEY / PASSWORD
            </label>
            <div className="relative flex items-center bg-slate-900/60 border border-white/5 rounded-lg focus-within:border-cyan-500/40 transition-colors">
              <span className="pl-3.5 text-slate-500">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* GitHub Connection (Only for Sign Up) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                <Github className="w-3 h-3 text-purple-400" /> LINK GITHUB SYSTEM (OPTIONAL)
              </label>
              <div className="relative flex items-center bg-slate-900/60 border border-white/5 rounded-lg focus-within:border-purple-500/40 transition-colors">
                <span className="pl-3.5 text-slate-500">
                  <Github className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="GitHub username"
                  className="w-full bg-transparent p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Alerts / Logs */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/25 flex items-start gap-2.5 text-[10px] font-mono text-red-400"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/25 flex items-start gap-2.5 text-[10px] font-mono text-emerald-400"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Trigger */}
          <button
            type="submit"
            className="w-full py-3.5 font-display font-bold text-xs tracking-widest uppercase rounded-lg text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all duration-300 flex items-center justify-center gap-2 group mt-2 cursor-pointer"
          >
            {isLogin ? "AUTHENTICATE DECRYPT" : "PROVISION SYSTEM PROFILE"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
