import React, { useEffect, useRef } from "react";
import { AppTheme } from "../types";

interface CyberCoreBackgroundProps {
  theme: AppTheme;
}

interface CircuitTrace {
  points: { x: number; y: number }[];
  progress: number;
  speed: number;
  width: number;
  color: string;
}

interface FloatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseOffset: number;
}

function CyberCoreBackground({ theme }: CyberCoreBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color configurations tailored to the selected theme (at very low opacities)
    const getThemeColors = (activeTheme: AppTheme) => {
      switch (activeTheme) {
        case "pink":
          return {
            primary: "rgba(236, 72, 153, 0.08)",       // very soft pink
            bright: "rgba(236, 72, 153, 0.35)",       // subtle pink glow
            secondary: "rgba(168, 85, 247, 0.05)",    // soft purple
            particle: "rgba(253, 164, 186, 0.25)",    // light pink
            grid: "rgba(236, 72, 153, 0.015)"         // ultra faint grid
          };
        case "green":
          return {
            primary: "rgba(16, 185, 129, 0.08)",      // very soft emerald
            bright: "rgba(52, 211, 153, 0.35)",       // subtle emerald glow
            secondary: "rgba(110, 231, 183, 0.05)",   // soft mint
            particle: "rgba(167, 243, 208, 0.25)",    // light emerald
            grid: "rgba(16, 185, 129, 0.015)"
          };
        case "cyan":
        default:
          return {
            primary: "rgba(6, 182, 212, 0.08)",       // very soft cyan
            bright: "rgba(34, 211, 238, 0.38)",       // subtle cyan glow
            secondary: "rgba(59, 130, 246, 0.05)",    // soft blue
            particle: "rgba(165, 243, 252, 0.25)",    // light cyan
            grid: "rgba(6, 182, 212, 0.015)"
          };
      }
    };

    let colors = getThemeColors(theme);

    // Core interactive elements
    let traces: CircuitTrace[] = [];
    let particles: FloatParticle[] = [];
    let mouse = { x: -1000, y: -1000, radius: 180 };

    // Initialize Circuit Traces radiating from the center chip
    const initCircuitTraces = (centerX: number, centerY: number) => {
      traces = [];
      const numTraces = 14;

      for (let i = 0; i < numTraces; i++) {
        const points = [];
        const baseAngle = (i / numTraces) * Math.PI * 2 + (Math.random() * 0.2 - 0.1);
        
        // Start on the edge of the central processor block (approx 50px radius)
        const startDist = 45;
        let x = centerX + Math.cos(baseAngle) * startDist;
        let y = centerY + Math.sin(baseAngle) * startDist;
        points.push({ x, y });

        // Add 2 to 3 diagonal and horizontal segments
        let currentX = x;
        let currentY = y;
        let currentAngle = baseAngle;
        const segmentCount = Math.floor(Math.random() * 2) + 2;

        for (let s = 0; s < segmentCount; s++) {
          const distance = Math.random() * 120 + 80;
          
          // Circuit lines usually bend at 45 or 90 degree increments
          const bend = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? Math.PI / 4 : Math.PI / 2);
          currentAngle += bend;

          currentX += Math.cos(currentAngle) * distance;
          currentY += Math.sin(currentAngle) * distance;

          // Keep within reasonable screen bounds
          points.push({ x: currentX, y: currentY });
        }

        traces.push({
          points,
          progress: Math.random(),
          speed: Math.random() * 0.0012 + 0.0006,
          width: Math.random() * 0.8 + 0.5,
          color: i % 2 === 0 ? colors.bright : colors.primary
        });
      }
    };

    // Initialize floating ambient code particles
    const initParticles = () => {
      particles = [];
      const maxParticles = 30;
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2.2 + 1,
          alpha: Math.random() * 0.25 + 0.1,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initCircuitTraces(width / 2, height / 2);
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const centerX = width / 2;
    const centerY = height / 2;
    initCircuitTraces(centerX, centerY);
    initParticles();

    let radarAngle1 = 0;
    let radarAngle2 = Math.PI;
    let time = 0;

    // Side telemetry lines cache (re-rendered slowly)
    const techTelemetryLeft = Array.from({ length: 6 }, () => ({
      val: Math.random().toString(16).substring(2, 6).toUpperCase(),
      progress: Math.random()
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.008;
      
      // Update rotation angles for HUD circles
      radarAngle1 += 0.0025;
      radarAngle2 -= 0.0015;

      colors = getThemeColors(theme);
      const cX = width / 2;
      const cY = height / 2;

      // --- 1. Draw subtle background grid ---
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // --- 2. Draw rotating HUD concentric circles (Center Motherboard Hub) ---
      // Inner Circle (Ticks and degrees)
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(cX, cY, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Middle Segmented Circle (Radar sweeps / Dashes)
      ctx.beginPath();
      ctx.setLineDash([8, 12]);
      ctx.arc(cX, cY, 110, radarAngle1, radarAngle1 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer Fine Circle with tick markers
      ctx.beginPath();
      ctx.arc(cX, cY, 170, 0, Math.PI * 2);
      ctx.globalAlpha = 0.12;
      ctx.stroke();

      // Radar sweep ray (very soft)
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(cX + Math.cos(radarAngle1) * 170, cY + Math.sin(radarAngle1) * 170);
      ctx.strokeStyle = colors.bright;
      ctx.globalAlpha = 0.06;
      ctx.stroke();

      // Draw crosshair axes extending from hub
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      // Horizontal crosshair ticks
      ctx.moveTo(cX - 280, cY); ctx.lineTo(cX - 180, cY);
      ctx.moveTo(cX + 180, cY); ctx.lineTo(cX + 280, cY);
      // Vertical crosshair ticks
      ctx.moveTo(cX, cY - 280); ctx.lineTo(cX, cY - 180);
      ctx.moveTo(cX, cY + 180); ctx.lineTo(cX, cY + 280);
      ctx.stroke();

      // --- 3. Draw Central Processor Chip Block ---
      const chipSize = 55;
      ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
      ctx.strokeStyle = colors.bright;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = colors.bright;
      
      // Draw main silicon square
      ctx.beginPath();
      ctx.rect(cX - chipSize / 2, cY - chipSize / 2, chipSize, chipSize);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw chip connectors (pins) extending outward
      ctx.fillStyle = colors.bright;
      ctx.globalAlpha = 0.35;
      const pinCount = 4;
      const pinOffset = chipSize / (pinCount + 1);

      for (let p = 1; p <= pinCount; p++) {
        const d = -chipSize / 2;
        // Top Pins
        ctx.fillRect(cX + d + p * pinOffset - 1, cY + d - 6, 2, 6);
        // Bottom Pins
        ctx.fillRect(cX + d + p * pinOffset - 1, cY + chipSize / 2, 2, 6);
        // Left Pins
        ctx.fillRect(cX + d - 6, cY + d + p * pinOffset - 1, 6, 2);
        // Right Pins
        ctx.fillRect(cX + chipSize / 2, cY + d + p * pinOffset - 1, 6, 2);
      }

      // --- 4. Draw Circuit Traces & Floating Glow Packets ---
      traces.forEach((trace) => {
        // Draw underlying static circuit trace path
        ctx.beginPath();
        ctx.moveTo(trace.points[0].x, trace.points[0].y);
        for (let j = 1; j < trace.points.length; j++) {
          ctx.lineTo(trace.points[j].x, trace.points[j].y);
        }
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = trace.width;
        ctx.globalAlpha = 0.18;
        ctx.stroke();

        // Increment trace signal pulse progress
        trace.progress += trace.speed;
        if (trace.progress > 1.0) {
          trace.progress = 0;
        }

        // Calculate current position of the active pulse on the segmented path
        const totalSegments = trace.points.length - 1;
        const activeSegmentFloat = trace.progress * totalSegments;
        const segmentIdx = Math.floor(activeSegmentFloat);
        const segmentProgress = activeSegmentFloat - segmentIdx;

        if (segmentIdx < totalSegments) {
          const p1 = trace.points[segmentIdx];
          const p2 = trace.points[segmentIdx + 1];
          const pulseX = p1.x + (p2.x - p1.x) * segmentProgress;
          const pulseY = p1.y + (p2.y - p1.y) * segmentProgress;

          // React to mouse attraction/repulsion slightly
          let pulseAlpha = 0.5;
          const dx = pulseX - mouse.x;
          const dy = pulseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            pulseAlpha = 0.9;
          }

          // Draw the glowing electric packet
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, trace.width * 2.0 + 1.2, 0, Math.PI * 2);
          ctx.fillStyle = colors.bright;
          ctx.globalAlpha = pulseAlpha * 0.4;
          ctx.shadowBlur = 6;
          ctx.shadowColor = colors.bright;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // --- 5. Draw Faint Floating Tech-Data Nodes ---
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulse = Math.sin(time * 2 + p.pulseOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.particle;
        ctx.globalAlpha = p.alpha * pulse;
        ctx.fill();

        // Connect nearby particles with faint web lines to mimic sonar constellations
        particles.forEach((other) => {
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 0.4;
            ctx.globalAlpha = (1.0 - distance / 90) * 0.04;
            ctx.stroke();
          }
        });
      });

      // --- 6. Draw Margins Telemetry Panels (From Video Concept) ---
      // Draw subtle ticks and small radar widgets in left/right margins
      ctx.fillStyle = colors.primary;
      ctx.strokeStyle = colors.primary;
      ctx.font = "8px monospace";

      // Left telemetry
      ctx.globalAlpha = 0.15;
      ctx.fillText("SYS_STATUS: READY", 30, 80);
      ctx.fillText("CORE_LOAD: 2.4%", 30, 95);
      
      // Draw tiny scrolling telemetry streams on left
      techTelemetryLeft.forEach((item, idx) => {
        if (Math.random() < 0.004) {
          item.val = Math.random().toString(16).substring(2, 6).toUpperCase();
        }
        ctx.fillText(`TRK_0${idx}: [${item.val}]`, 30, 130 + idx * 16);
      });

      // Minimalist scope grid on bottom-right corner
      const scopeX = width - 100;
      const scopeY = height - 100;
      ctx.beginPath();
      ctx.arc(scopeX, scopeY, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(scopeX, scopeY, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(scopeX - 45, scopeY); ctx.lineTo(scopeX + 45, scopeY);
      ctx.moveTo(scopeX, scopeY - 45); ctx.lineTo(scopeX, scopeY + 45);
      ctx.stroke();

      // Sweeping hand on corner scope
      ctx.beginPath();
      ctx.moveTo(scopeX, scopeY);
      ctx.lineTo(scopeX + Math.cos(-time * 1.5) * 35, scopeY + Math.sin(-time * 1.5) * 35);
      ctx.strokeStyle = colors.bright;
      ctx.globalAlpha = 0.3;
      ctx.stroke();

      // Reset global parameters
      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

export default React.memo(CyberCoreBackground);
