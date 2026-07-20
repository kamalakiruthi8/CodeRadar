import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  BookOpen, 
  Award, 
  Layers 
} from "lucide-react";
import { AppTheme } from "../types";

interface Message {
  role: "user" | "model";
  content: string;
}

interface TechieBotProps {
  theme: AppTheme;
}

// Simple helper to parse basic Markdown constructs (bold, code block, bullets, paragraph) safely
function renderFormattedMessage(text: string) {
  const lines = text.split("\n");
  let inList = false;
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // 1. Code block handling (very basic)
    if (line.startsWith("```")) {
      return; // ignore code fences for simplicity
    }

    // 2. Headings (e.g. ### Title)
    if (line.startsWith("### ")) {
      if (inList) {
        inList = false;
      }
      renderedElements.push(
        <h4 key={`h-${index}`} className="text-xs font-mono font-bold text-white tracking-wider mt-3 mb-1 uppercase border-b border-white/5 pb-0.5">
          {line.replace("### ", "")}
        </h4>
      );
      return;
    }

    // 3. Bullet points
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      inList = true;
      const cleanText = line.trim().replace(/^[-*]\s+/, "");
      renderedElements.push(
        <li key={`li-${index}`} className="text-[11px] leading-relaxed text-slate-300 ml-4 list-disc pl-1 mb-1">
          {parseInlineMarkdown(cleanText)}
        </li>
      );
      return;
    }

    // Close list if line is not a bullet
    if (inList && line.trim() === "") {
      inList = false;
    }

    // 4. Standard paragraphs
    if (line.trim() !== "") {
      renderedElements.push(
        <p key={`p-${index}`} className="text-[11px] leading-relaxed text-slate-300 mb-2">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{renderedElements}</div>;
}

// Inline markdown parser for **bold** and `code` spans
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText.length > 0) {
    const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
    const codeMatch = currentText.match(/`(.*?)`/);

    // Find the earliest match
    const boldIdx = boldMatch && boldMatch.index !== undefined ? boldMatch.index : Infinity;
    const codeIdx = codeMatch && codeMatch.index !== undefined ? codeMatch.index : Infinity;

    if (!boldMatch && !codeMatch) {
      parts.push(<span key={keyIdx++}>{currentText}</span>);
      break;
    }

    if (boldIdx < codeIdx) {
      // Process bold match
      if (boldIdx > 0) {
        parts.push(<span key={keyIdx++}>{currentText.substring(0, boldIdx)}</span>);
      }
      parts.push(
        <strong key={keyIdx++} className="text-white font-semibold">
          {boldMatch![1]}
        </strong>
      );
      currentText = currentText.substring(boldIdx + boldMatch![0].length);
    } else {
      // Process code match
      if (codeIdx > 0) {
        parts.push(<span key={keyIdx++}>{currentText.substring(0, codeIdx)}</span>);
      }
      parts.push(
        <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-[9.5px] font-mono text-cyan-400 font-medium">
          {codeMatch![1]}
        </code>
      );
      currentText = currentText.substring(codeIdx + codeMatch![0].length);
    }
  }

  return parts;
}

export default function TechieBot({ theme }: TechieBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("techie_chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [showInitialWelcome, setShowInitialWelcome] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [startupTypedText, setStartupTypedText] = useState("");

  // States for interactive, busy pixel-art developer boy
  const [waveState, setWaveState] = useState<"start" | "hover" | "idle">("start");
  const [isLookingAtLaptop, setIsLookingAtLaptop] = useState(false);
  const [typingFlicker, setTypingFlicker] = useState(false);
  const [thoughts, setThoughts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const techieRef = useRef<HTMLDivElement>(null);

  const [isStartupPhase, setIsStartupPhase] = useState(true);

  // Startup phase timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStartupPhase(false);
    }, 5000); // 5 seconds of startup phase where the text is shown
    return () => clearTimeout(timer);
  }, []);

  // Typewriter effect on startup OR when hover state changes
  useEffect(() => {
    const textToType = "🤖 TECHIE BOT";
    let currentIdx = 0;
    setStartupTypedText("");
    
    const typeInterval = setInterval(() => {
      if (currentIdx <= textToType.length) {
        setStartupTypedText(textToType.substring(0, currentIdx));
        currentIdx++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [isHovered]);

  // Wave on startup
  useEffect(() => {
    setWaveState("start");
    const timer = setTimeout(() => {
      setWaveState("idle");
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Wave on hover transition
  useEffect(() => {
    if (isHovered && waveState === "idle") {
      setWaveState("hover");
      const timer = setTimeout(() => {
        setWaveState("idle");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  // Toggle looking at laptop vs looking at cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLookingAtLaptop(prev => !prev);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  // Rapid typing key flicker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingFlicker(prev => !prev);
    }, 180 + Math.random() * 100);
    return () => clearInterval(interval);
  }, []);

  // Thoughts/ideas emission
  useEffect(() => {
    const thoughtsPool = [
      "git status",
      "npm run dev",
      "const app = ...",
      "compile ok",
      "git push origin main",
      "AI scanning...",
      "const theme = ...",
      "recharts update",
      "d3 pipeline init",
      "01101011",
      "{} code logic",
      "<coderadar />"
    ];
    
    const interval = setInterval(() => {
      if (isOpen) return; // avoid spawning thoughts if chat screen is open
      const randomThought = thoughtsPool[Math.floor(Math.random() * thoughtsPool.length)];
      const id = Date.now();
      const newThought = {
        id,
        text: randomThought,
        x: Math.random() * 24 - 12,
        y: -15
      };
      setThoughts(prev => [...prev, newThought]);

      setTimeout(() => {
        setThoughts(prev => prev.filter(t => t.id !== id));
      }, 2500);
    }, 7000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-hide initial welcome greeting after 5.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialWelcome(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  // Monitor cursor coordinates to let Techie's eyes watch the mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!techieRef.current) return;
    const rect = techieRef.current.getBoundingClientRect();
    const techieCenterX = rect.left + rect.width / 2;
    const techieCenterY = rect.top + rect.height / 2;
    
    const dx = mousePos.x - techieCenterX;
    const dy = mousePos.y - techieCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    
    // Smooth eye look offset (limits translation to stay inside eye screen)
    const maxOffset = 3.5;
    const limit = Math.min(distance / 70, maxOffset);
    setEyeOffset({
      x: (dx / distance) * limit,
      y: (dy / distance) * limit
    });
  }, [mousePos]);

  // Determine whether speech bubble is shown
  const showSpeechBubble = showInitialWelcome || isHovered;

  // Auto-scroll chat history internally
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem("techie_chat_history", JSON.stringify(messages));
  }, [messages]);

  const themeClasses = {
    cyan: {
      accentText: "text-cyan-400",
      border: "border-cyan-500/25",
      glowBg: "bg-cyan-500/10",
      buttonBg: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]",
      typingDot: "bg-cyan-400",
      messageBgUser: "bg-cyan-950/30 border-cyan-500/20",
      messageTextUser: "text-cyan-100",
      quickBtn: "border-cyan-500/20 hover:border-cyan-400/40 text-cyan-400/90 hover:bg-cyan-950/10",
      auraGlow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]"
    },
    pink: {
      accentText: "text-pink-400",
      border: "border-pink-500/25",
      glowBg: "bg-pink-500/10",
      buttonBg: "bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]",
      typingDot: "bg-pink-400",
      messageBgUser: "bg-pink-950/30 border-pink-500/20",
      messageTextUser: "text-pink-100",
      quickBtn: "border-pink-500/20 hover:border-pink-400/40 text-pink-400/90 hover:bg-pink-950/10",
      auraGlow: "shadow-[0_0_20px_rgba(236,72,153,0.15)]"
    },
    green: {
      accentText: "text-emerald-400",
      border: "border-emerald-500/25",
      glowBg: "bg-emerald-500/10",
      buttonBg: "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]",
      typingDot: "bg-emerald-400",
      messageBgUser: "bg-emerald-950/30 border-emerald-500/20",
      messageTextUser: "text-emerald-100",
      quickBtn: "border-emerald-500/20 hover:border-emerald-400/40 text-emerald-400/90 hover:bg-emerald-950/10",
      auraGlow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    }
  }[theme];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with Techie.");
      }

      const data = await res.json();
      const modelMsg: Message = { role: "model", content: data.reply };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "❌ **System connection interrupted**. Please check your workspace settings or ensure your Gemini API key is configured in the secrets manager.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickCommand = (command: string) => {
    handleSendMessage(command);
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem("techie_chat_history");
  };

  const quickPrompts = [
    { text: "How do I use this app?", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { text: "Improve my GitHub profile", icon: <Award className="w-3.5 h-3.5" /> },
    { text: "Explain the 3D Voxel View", icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div id="techie-bot-container" className="fixed bottom-6 right-6 z-50 font-sans select-none">
      <AnimatePresence>
        {isOpen ? (
          /* Expandable Chat Widget */
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`w-[350px] sm:w-[380px] h-[480px] rounded-2xl bg-slate-950/95 border ${themeClasses.border} backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl ${themeClasses.auraGlow}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-white/5 select-none shrink-0">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${themeClasses.glowBg} border ${themeClasses.border}`}>
                  <Bot className={`w-4 h-4 ${themeClasses.accentText} animate-pulse`} />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono font-extrabold tracking-widest text-white uppercase flex items-center gap-1.5">
                    TECHIE <span className="text-[8px] opacity-70">// AI ADVISOR</span>
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono font-bold text-emerald-400/85">SYSTEM ONLINE</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button 
                    onClick={clearChatHistory}
                    className="text-[8px] font-mono text-slate-500 hover:text-red-400 px-1.5 py-1 rounded bg-white/5 hover:bg-red-500/10 border border-white/5 transition-colors cursor-pointer mr-2 uppercase"
                  >
                    Clear History
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Message Box */}
            <div 
              ref={chatScrollRef}
              className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3 flex flex-col bg-gradient-to-b from-transparent to-slate-950/20"
            >
              {/* Default Welcome Message */}
              <div className="flex gap-2.5 items-start">
                <div className={`w-6 h-6 rounded-md ${themeClasses.glowBg} border ${themeClasses.border} flex items-center justify-center text-xs shrink-0 mt-0.5`}>
                  🤖
                </div>
                <div className="flex-1 rounded-xl rounded-tl-none bg-slate-900/50 border border-white/5 p-3">
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Greetings, Commander! I am <span className={`${themeClasses.accentText} font-bold font-mono`}>Techie</span>, your integrated cybernetic AI advisor.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300 mt-1.5">
                    I can help you understand CodeRadar's visual interfaces, answer git or programming questions, or analyze and provide specific recommendations to optimize your GitHub profile!
                  </p>
                </div>
              </div>

              {/* Chat Thread */}
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div 
                    key={idx} 
                    className={`flex gap-2.5 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                      isUser 
                        ? "bg-slate-900 border border-white/10" 
                        : `${themeClasses.glowBg} border ${themeClasses.border}`
                    }`}>
                      {isUser ? "👤" : "🤖"}
                    </div>
                    <div className={`flex-1 rounded-xl p-3 max-w-[85%] ${
                      isUser 
                        ? `${themeClasses.messageBgUser} ${themeClasses.messageTextUser} border rounded-tr-none ml-auto text-right` 
                        : "bg-slate-900/50 border border-white/5 rounded-tl-none text-left"
                    }`}>
                      {isUser ? (
                        <p className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        renderFormattedMessage(msg.content)
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2.5 items-start">
                  <div className={`w-6 h-6 rounded-md ${themeClasses.glowBg} border ${themeClasses.border} flex items-center justify-center text-xs shrink-0`}>
                    🤖
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-slate-900/50 border border-white/5 px-3 py-2.5 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${themeClasses.typingDot} animate-bounce`} style={{ animationDelay: "0ms" }} />
                    <span className={`w-1.5 h-1.5 rounded-full ${themeClasses.typingDot} animate-bounce`} style={{ animationDelay: "150ms" }} />
                    <span className={`w-1.5 h-1.5 rounded-full ${themeClasses.typingDot} animate-bounce`} style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestion Prompts Row */}
            {messages.length === 0 && !isTyping && (
              <div className="px-4 py-2 bg-slate-900/35 border-t border-white/5 flex flex-col gap-1.5 shrink-0 select-none">
                <span className="text-[8px] font-mono tracking-wider text-slate-500 font-bold uppercase">
                  SUGGESTED COMMODITIES
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickCommand(p.text)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left text-[10px] font-mono font-medium transition-all duration-200 cursor-pointer ${themeClasses.quickBtn}`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        {p.icon}
                        {p.text}
                      </span>
                      <ArrowRight className="w-3 h-3 opacity-60 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text input footer */}
            <div className="p-3 bg-slate-900/60 border-t border-white/5 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }} 
                className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-xl px-2 py-1 focus-within:border-white/20 transition-colors"
              >
                <input
                  type="text"
                  placeholder="Ask Techie how to improve..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 bg-transparent px-2 py-1.5 text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className={`p-1.5 rounded-lg text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${themeClasses.buttonBg}`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* Interactive Animated Techie Cyber Boy & Speech Bubble */
          <div 
            ref={techieRef}
            className="relative flex flex-col items-end"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Thinking / Thought Bubbles floating above his head */}
            <AnimatePresence>
              {thoughts.map((thought) => (
                <motion.div
                  key={thought.id}
                  initial={{ opacity: 0, scale: 0.7, y: 5, x: thought.x }}
                  animate={{ opacity: 0.9, scale: 1, y: -50, x: thought.x }}
                  exit={{ opacity: 0, scale: 0.8, y: -70 }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                  className="absolute pointer-events-none z-50 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-cyan-500/30 text-white font-mono text-[9px] uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                  style={{
                    borderColor: theme === 'pink' ? '#ec489950' : theme === 'green' ? '#10b98150' : '#06b6d450',
                    boxShadow: theme === 'pink' 
                      ? '0 0 10px rgba(236,72,153,0.15)' 
                      : theme === 'green' 
                        ? '0 0 10px rgba(16,185,129,0.15)' 
                        : '0 0 10px rgba(6,182,212,0.15)'
                  }}
                >
                  <span className={themeClasses.accentText}>&lambda;&gt; </span>
                  {thought.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* High-tech Speech Bubble */}
            <AnimatePresence>
              {showSpeechBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 15 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-[90px] right-2 max-w-[260px] cursor-pointer z-50 pointer-events-auto filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                >
                  <div className={`relative px-4 py-3 rounded-xl bg-slate-950/95 border ${themeClasses.border} backdrop-blur-md text-left`}>
                    {/* Glowing Accent Corner line */}
                    <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${theme === 'cyan' ? 'border-cyan-400' : theme === 'pink' ? 'border-pink-400' : 'border-emerald-400'} rounded-tl`} />
                    <p className="text-[11px] font-mono leading-relaxed text-slate-200">
                      Hi developer! I am <span className={`${themeClasses.accentText} font-extrabold`}>Techie</span>. Ask me to optimize your profile, analyze code, or explain views!
                    </p>
                    <div className="flex items-center justify-between mt-1.5 border-t border-white/5 pt-1">
                      <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest">Interactive AI</span>
                      <span className={`text-[8px] font-mono font-bold ${themeClasses.accentText} animate-pulse`}>CLICK TO CHAT &rarr;</span>
                    </div>
                    {/* Speech Bubble Arrow pointing down-right towards the robot's head */}
                    <div className={`absolute bottom-[-6px] right-10 w-3 h-3 rotate-45 bg-slate-950 border-r border-b ${themeClasses.border}`} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Horizontal Typewriter Startup & Status Badge with Cute Robot */}
            <div className="flex flex-row items-center gap-3.5 select-none pointer-events-auto">
              <AnimatePresence>
                {(isStartupPhase || isHovered) && startupTypedText && (
                  <motion.div
                    initial={{ opacity: 0, x: 15, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 15, scale: 0.9 }}
                    className="bg-slate-950/90 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xl backdrop-blur-md"
                    style={{
                      borderColor: theme === 'pink' ? '#ec489950' : theme === 'green' ? '#10b98150' : '#22d3ee50',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-[10px] font-mono font-extrabold tracking-widest text-slate-100 uppercase whitespace-nowrap">
                      {startupTypedText}
                    </span>
                    <span className={`w-1 h-3 ${theme === 'pink' ? 'bg-pink-400' : theme === 'green' ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Pixel Cyberboy Graphic Trigger - Seamless Floating Layout */}
              <motion.div
                key="techie-avatar-toggle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: isHovered ? [0, -4, 0] : 0
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  y: isHovered ? { duration: 2.0, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
                }}
                onClick={() => {
                  // Open chat immediately with no spin animation on click or touch
                  setIsOpen(true);
                }}
                className="relative cursor-pointer select-none transition-all duration-300"
                style={{ 
                  width: "72px", 
                  height: "90px",
                  filter: `drop-shadow(0 0 12px ${theme === 'pink' ? 'rgba(236,72,153,0.45)' : theme === 'green' ? 'rgba(16,185,129,0.45)' : 'rgba(34,211,238,0.45)'})`
                }}
              >
                {/* Cute Round Ball Bot SVG */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 120 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                <defs>
                  {/* Shiny metallic radial gradient for the round ball body */}
                  <radialGradient id="ballBodyGrad" cx="35%" cy="33%" r="65%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0b0f19" />
                  </radialGradient>
                  
                  {/* Soft drop shadow gradient for the floating hover jet */}
                  <radialGradient id="hoverShadowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Ground Hover Glow Jet Shadow */}
                <motion.ellipse
                  cx="60"
                  cy="138"
                  rx="22"
                  ry="5"
                  fill="url(#hoverShadowGrad)"
                  animate={{
                    rx: isHovered ? [22, 27, 22] : [22, 24, 22],
                    opacity: isHovered ? [0.7, 0.9, 0.7] : [0.6, 0.7, 0.6],
                  }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Floating Jet / Gravity Defying Engine Ring */}
                <motion.ellipse
                  cx="60"
                  cy="118"
                  rx="24"
                  ry="6"
                  fill="none"
                  stroke={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'}
                  strokeWidth="2.5"
                  strokeDasharray="4, 3"
                  animate={{
                    y: isHovered ? [0, -4, 0] : [0, -2, 0],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Floating Bobbing Core Group */}
                <motion.g
                  animate={{
                    y: isHovered ? [0, -6, 0] : [0, -3, 0],
                  }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Spiky Anime Hair locks hugging the top of the cute ball head */}
                  <path
                    d="M 32,50 C 26,40 28,26 42,24 C 44,16 54,14 62,20 C 68,14 78,16 82,24 C 88,26 94,36 88,50 C 94,40 92,30 84,26 C 80,18 70,16 64,22 C 58,15 48,16 42,22 C 34,24 30,34 32,50 Z"
                    fill="#1c1917"
                    stroke="#000000"
                    strokeWidth="2.5"
                  />
                  {/* Inner hair depth */}
                  <path
                    d="M 34,48 C 30,40 32,28 42,26 C 45,19 53,17 60,22 C 66,17 75,19 78,26 C 84,28 88,38 86,48 C 84,42 80,32 76,28 C 72,23 64,21 59,25 C 55,20 47,21 43,26 C 39,28 36,36 37,44 Z"
                    fill="#0c0a09"
                  />
                  {/* Hair highlights */}
                  <path
                    d="M 45,28 C 48,25 52,24 55,26"
                    stroke="#2d2a28"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 68,28 C 71,25 75,24 78,26"
                    stroke="#2d2a28"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* The Glossy Round Ball Body Core */}
                  <circle
                    cx="60"
                    cy="74"
                    r="34"
                    fill="url(#ballBodyGrad)"
                    stroke="#000000"
                    strokeWidth="2.5"
                  />

                  {/* Panel Line Accents and Forehead Indicator Light */}
                  <path
                    d="M 32,82 Q 60,94 88,82"
                    fill="none"
                    stroke="#070a13"
                    strokeWidth="2"
                  />
                  <circle cx="60" cy="50" r="3" fill={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} />
                  <circle cx="60" cy="50" r="1.2" fill="#ffffff" />

                  {/* Left Headphone Earcup */}
                  <rect x="20" y="60" width="8" height="24" rx="4" fill="#000000" />
                  <rect x="22" y="64" width="4" height="16" rx="2" fill={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} />
                  <rect x="23" y="68" width="2" height="8" rx="1" fill="#ffffff" opacity="0.6" />

                  {/* Right Headphone Earcup */}
                  <rect x="92" y="60" width="8" height="24" rx="4" fill="#000000" />
                  <rect x="94" y="64" width="4" height="16" rx="2" fill={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} />
                  <rect x="95" y="68" width="2" height="8" rx="1" fill="#ffffff" opacity="0.6" />
                  
                  {/* Headphone Band */}
                  <path
                    d="M 24,62 C 24,35 96,35 96,62"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M 24,62 C 24,35 96,35 96,62"
                    fill="none"
                    stroke={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'}
                    strokeWidth="1.2"
                    opacity="0.6"
                  />

                  {/* Dark Visor Screen */}
                  <rect
                    x="32"
                    y="56"
                    width="56"
                    height="26"
                    rx="13"
                    fill="#000000"
                    stroke="#141a29"
                    strokeWidth="1.5"
                  />

                  {/* Eyes stay in one place, 100% stable and stationary */}
                  <g>
                    {/* Left Cyber Eye */}
                    <circle cx="46" cy="69" r="4.5" fill="#facc15" />
                    <circle cx="46" cy="69" r="2.5" fill={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} />
                    <circle cx="47.5" cy="67.5" r="1.2" fill="#ffffff" />

                    {/* Right Cyber Eye */}
                    <circle cx="74" cy="69" r="4.5" fill="#facc15" />
                    <circle cx="74" cy="69" r="2.5" fill={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} />
                    <circle cx="75.5" cy="67.5" r="1.2" fill="#ffffff" />
                  </g>

                  {/* Cheek Blush & Tiny Digital Neon Mouth Panel */}
                  <rect x="38" y="76" width="4" height="2" fill={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'} opacity="0.8" />
                  <rect x="56" y="86" width="8" height="2" rx="1" fill={theme === 'pink' ? '#f472b6' : theme === 'green' ? '#34d399' : '#22d3ee'} />

                  {/* Waving Left Hand (Character's Right) */}
                  <motion.g
                    style={{ originX: "26px", originY: "96px" }}
                    animate={{
                      rotate: waveState === "start" || waveState === "hover"
                        ? [0, -115, -80, -115, -80, -115, 0]
                        : 0,
                    }}
                    transition={{
                      duration: waveState === "start" ? 2.4 : 1.8,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Floating Left Glove */}
                    <circle cx="26" cy="96" r="7" fill="#000000" />
                    <circle cx="26" cy="96" r="5" fill="#1c1917" />
                    <circle cx="26" cy="96" r="3.5" fill="#facc15" />
                    {/* Glow wrist ring */}
                    <path
                      d="M 21,92 A 5,5 0 0,1 31,92"
                      fill="none"
                      stroke={theme === 'pink' ? '#ec4899' : theme === 'green' ? '#10b981' : '#22d3ee'}
                      strokeWidth="1.5"
                    />
                  </motion.g>

                  {/* Floating Right Hand holding laptop screen (Character's Left) */}
                  <g>
                    <circle cx="94" cy="96" r="7" fill="#000000" />
                    <circle cx="94" cy="96" r="5" fill="#1c1917" />
                    <circle cx="94" cy="96" r="3.5" fill="#facc15" />
                    {/* Floating Grip Fingers */}
                    <rect x="88" y="93" width="2" height="4" rx="0.5" fill="#facc15" />
                    <rect x="91" y="94" width="2" height="4" rx="0.5" fill="#facc15" />
                  </g>

                  {/* Floating Pixel/Vector Cyber Laptop */}
                  <g>
                    {/* Laptop Deck */}
                    <rect x="72" y="90" width="24" height="4" rx="1.5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
                    {/* Keyboard lights flickering */}
                    <rect x="76" y="90" width="3" height="2" fill={typingFlicker ? "#22d3ee" : "#facc15"} />
                    <rect x="81" y="90" width="3" height="2" fill={typingFlicker ? "#facc15" : "#eab308"} />
                    <rect x="86" y="90" width="3" height="2" fill={typingFlicker ? "#38bdf8" : "#22d3ee"} />

                    {/* Laptop Screen Lid */}
                    <g transform="rotate(-6, 82, 76)">
                      <rect x="82" y="66" width="20" height="20" rx="1.5" fill="#334155" stroke="#000000" strokeWidth="1.5" />
                      {/* Glowing Cross Logo on Lid */}
                      <rect x="90" y="74" width="4" height="4" fill={theme === 'pink' ? '#f472b6' : theme === 'green' ? '#34d399' : '#22d3ee'} />
                      <rect x="88" y="75" width="8" height="2" fill={theme === 'pink' ? '#f472b6' : theme === 'green' ? '#34d399' : '#22d3ee'} />
                      <rect x="91" y="72" width="2" height="8" fill={theme === 'pink' ? '#f472b6' : theme === 'green' ? '#34d399' : '#22d3ee'} />
                      <rect x="91" y="75" width="2" height="2" fill="#ffffff" />
                    </g>
                  </g>

                  {/* Floating cyber sparks rising from screen */}
                  <motion.circle 
                    cx="86" 
                    cy="78" 
                    r="1.2" 
                    fill={theme === 'pink' ? '#f472b6' : theme === 'green' ? '#34d399' : '#22d3ee'} 
                    animate={{ y: [-2, -18, -2], opacity: [0, 0.9, 0], scale: [0.8, 1.2, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.1 }}
                  />
                  <motion.circle 
                    cx="92" 
                    cy="76" 
                    r="1.0" 
                    fill="#facc15" 
                    animate={{ y: [0, -22, 0], opacity: [0, 0.85, 0], scale: [0.8, 1.3, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                  />
                </motion.g>
              </svg>

            </motion.div>
          </div>
        </div>
        )}
      </AnimatePresence>
    </div>
  );
}
