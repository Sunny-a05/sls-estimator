"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * PixelCanvas — formless.xyz-inspired interactive background
 * adapted for SLS (Selective Laser Sintering) aesthetic.
 *
 * Instead of square pixels, draws organic circular "powder" particles
 * in varying sizes — echoing the actual SLS powder bed.
 *
 * Mouse proximity illuminates particles with a warm radial spotlight.
 * Ambient warm glow layers breathe slowly under the particle field.
 *
 * Designed to be placed as a fixed full-page background.
 */

interface PixelCanvasProps {
  /** Approximate grid spacing for particle placement */
  spacing?: number;
  /** Mouse glow warm color (RGB) */
  glowColor?: [number, number, number];
  /** Radius of the mouse spotlight in px */
  glowRadius?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  r: number; // radius
  baseAlpha: number;
  phase: number; // unique shimmer phase
  drift: number; // subtle drift speed
}

export function PixelCanvas({
  spacing = 18,
  glowColor = [200, 16, 46],
  glowRadius = 220,
  className = "",
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  // Build particle grid — called on resize
  const buildParticles = useCallback(
    (w: number, h: number) => {
      const particles: Particle[] = [];
      const cols = Math.ceil(w / spacing) + 2;
      const rows = Math.ceil(h / spacing) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Jitter position for organic feel (not a perfect grid)
          const jitterX = (Math.random() - 0.5) * spacing * 0.6;
          const jitterY = (Math.random() - 0.5) * spacing * 0.6;

          particles.push({
            x: col * spacing + jitterX,
            y: row * spacing + jitterY,
            r: 1.2 + Math.random() * 2.5, // 1.2–3.7px radius (powder-like)
            baseAlpha: 0.08 + Math.random() * 0.18, // subtle idle visibility
            phase: Math.random() * Math.PI * 2,
            drift: 0.3 + Math.random() * 0.7,
          });
        }
      }

      particlesRef.current = particles;
    },
    [spacing]
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const { w, h, dpr } = sizeRef.current;
      const cw = w * dpr;
      const ch = h * dpr;
      const mx = mouseRef.current.x * dpr;
      const my = mouseRef.current.y * dpr;
      const gr = glowRadius * dpr;
      const particles = particlesRef.current;

      // Clear with warm base
      ctx.fillStyle = "#FAF9F7";
      ctx.fillRect(0, 0, cw, ch);

      // Ambient warm glow layers (breathing radial gradients)
      const glows = [
        { fx: 0.12, fy: 0.25, c: [220, 180, 150], rad: 400, op: 0.06 },
        { fx: 0.78, fy: 0.15, c: [210, 170, 130], rad: 350, op: 0.05 },
        { fx: 0.5, fy: 0.7, c: [240, 200, 160], rad: 500, op: 0.05 },
        { fx: 0.85, fy: 0.75, c: [200, 16, 46], rad: 300, op: 0.03 },
        { fx: 0.3, fy: 0.9, c: [230, 190, 140], rad: 350, op: 0.04 },
      ];

      for (const g of glows) {
        const breathe = 1 + Math.sin(time * 0.0006 + g.fx * 12) * 0.18;
        const cx = g.fx * cw;
        const cy = g.fy * ch;
        const r = g.rad * dpr * breathe;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(
          0,
          `rgba(${g.c[0]}, ${g.c[1]}, ${g.c[2]}, ${g.op})`
        );
        grad.addColorStop(
          1,
          `rgba(${g.c[0]}, ${g.c[1]}, ${g.c[2]}, 0)`
        );
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }

      // Draw powder particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const px = p.x * dpr;
        const py = p.y * dpr;
        const pr = p.r * dpr;

        // Shimmer: subtle alpha oscillation
        const shimmer = Math.sin(time * 0.001 * p.drift + p.phase) * 0.06;

        // Mouse proximity
        const dx = px - mx;
        const dy = py - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseT = Math.max(0, 1 - dist / gr);
        const mouseIntensity = mouseT * mouseT; // quadratic falloff

        // Final alpha
        const alpha = Math.min(
          p.baseAlpha + shimmer + mouseIntensity * 0.45,
          0.85
        );

        if (alpha < 0.01) continue;

        // Color: blend from warm gray to glow color near mouse
        const idleR = 210, idleG = 205, idleB = 198;
        const r = Math.round(idleR + (glowColor[0] - idleR) * mouseIntensity * 0.7);
        const g = Math.round(idleG + (glowColor[1] - idleG) * mouseIntensity * 0.7);
        const b = Math.round(idleB + (glowColor[2] - idleB) * mouseIntensity * 0.7);

        // Scale up slightly near mouse
        const scale = 1 + mouseIntensity * 0.6;

        ctx.beginPath();
        ctx.arc(px, py, pr * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      // Mouse spotlight soft radial overlay
      if (mx > -1000) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, gr);
        grad.addColorStop(
          0,
          `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0.05)`
        );
        grad.addColorStop(
          0.4,
          `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0.02)`
        );
        grad.addColorStop(
          1,
          `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0)`
        );
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }
    },
    [glowColor, glowRadius]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = document.documentElement.scrollHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      sizeRef.current = { w, h, dpr };
      buildParticles(w, h);
    };

    resize();

    // Observe body size changes (e.g., route transitions, content loading)
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY + window.scrollY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const loop = (t: number) => {
      draw(ctx, t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [draw, buildParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}
