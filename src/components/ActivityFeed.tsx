import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface ActivityFeedProps {
  username: string;
  repoCount: number;
  topLanguage: string;
  isScanning: boolean;
  onScanComplete?: () => void;
}

interface LogLine {
  text: string;
  type: "command" | "info" | "success" | "warning";
  status?: "pending" | "done" | "none";
}

export default function ActivityFeed({
  username,
  repoCount,
  topLanguage,
  isScanning,
  onScanComplete
}: ActivityFeedProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal internally without pulling down the page viewport
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Terminal log sequencer
  useEffect(() => {
    let active = true;
    setLogs([]); // clear logs on start

    const runLogs = async () => {
      const waitTime = 40; // High speed terminal, 40ms instead of 300ms/400ms!
      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, Math.min(ms, waitTime)));

      // 1. Print command line scan trigger
      if (!active) return;
      setLogs([{ text: `$ coderadar scan ${username}`, type: "command" }]);
      await wait(300);

      // 2. Fetching profile
      if (!active) return;
      setLogs((prev) => [
        ...prev,
        { text: "> Fetching profile data...", type: "info", status: "pending" }
      ]);
      await wait(450);
      if (!active) return;
      setLogs((prev) => {
        const next = [...prev];
        next[next.length - 1] = { text: `> Fetching profile data... [OK]`, type: "info", status: "done" };
        return next;
      });

      // 3. Loading repositories
      if (!active) return;
      setLogs((prev) => [
        ...prev,
        { text: `> Loading repositories...`, type: "info", status: "pending" }
      ]);
      await wait(400);
      if (!active) return;
      setLogs((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          text: `> Loading repositories... [OK] - Found ${repoCount} public repos`,
          type: "info",
          status: "done"
        };
        return next;
      });

      // 4. Analyzing contributions
      if (!active) return;
      setLogs((prev) => [
        ...prev,
        { text: `> Analyzing contributions...`, type: "info", status: "pending" }
      ]);
      await wait(400);
      if (!active) return;
      setLogs((prev) => {
        const next = [...prev];
        next[next.length - 1] = { text: `> Analyzing contributions... [OK]`, type: "info", status: "done" };
        return next;
      });

      // 5. Computing languages
      if (!active) return;
      setLogs((prev) => [
        ...prev,
        { text: `> Computing language stats...`, type: "info", status: "pending" }
      ]);
      await wait(350);
      if (!active) return;
      setLogs((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          text: `> Computing language stats... [OK] - Main: ${topLanguage || "TypeScript"}`,
          type: "info",
          status: "done"
        };
        return next;
      });

      // 6. Building 3D cube
      if (!active) return;
      setLogs((prev) => [
        ...prev,
        { text: `> Building 3D contribution cube...`, type: "info", status: "pending" }
      ]);
      await wait(350);
      if (!active) return;
      setLogs((prev) => {
        const next = [...prev];
        next[next.length - 1] = { text: `> Building 3D cube... [OK]`, type: "info", status: "done" };
        return next;
      });

      // 7. Preparing dashboard
      if (!active) return;
      setLogs((prev) => [
        ...prev,
        { text: `> Preparing visual dashboard...`, type: "info", status: "pending" }
      ]);
      await wait(300);
      if (!active) return;
      setLogs((prev) => {
        const next = [...prev];
        next[next.length - 1] = { text: `> Preparing dashboard... [OK]`, type: "info", status: "done" };
        return next;
      });

      // 8. Completed status
      if (!active) return;
      setLogs((prev) => [
        ...prev,
        { text: `✓ Ready to explore! Code network synchronized.`, type: "success" }
      ]);

      if (onScanComplete) {
        onScanComplete();
      }
    };

    runLogs();

    return () => {
      active = false;
    };
  }, [username, repoCount, topLanguage]);

  return (
    <div className="relative w-full flex flex-col h-[280px] sm:h-[310px] rounded-xl bg-slate-950/65 border border-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-white/5">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-mono tracking-wider font-bold text-slate-300">
            LIVE ACTIVITY FEED
          </span>
        </div>
        
        {/* Terminal window controls mock */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/30" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/30 animate-pulse" />
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalContainerRef}
        className="flex-1 p-4.5 overflow-y-auto no-scrollbar font-mono text-xs text-slate-300 space-y-2.5 flex flex-col justify-start"
      >
        {logs.map((log, index) => {
          if (log.type === "command") {
            return (
              <div key={index} className="text-cyan-400 font-medium">
                {log.text}
              </div>
            );
          }
          if (log.type === "success") {
            return (
              <div key={index} className="text-emerald-400 font-medium mt-1">
                {log.text}
              </div>
            );
          }
          return (
            <div key={index} className="flex items-start justify-between text-slate-300">
              <span className="truncate pr-2">{log.text}</span>
              <span className="shrink-0">
                {log.status === "pending" && (
                  <span className="text-yellow-400 animate-pulse">● scanning</span>
                )}
                {log.status === "done" && <span className="text-emerald-400">✓</span>}
              </span>
            </div>
          );
        })}

        {/* Dynamic Typing blinking cursor prompt */}
        {isScanning && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-4 bg-emerald-400/80 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
