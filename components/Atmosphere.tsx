"use client";
import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; ph: number };
type Bolt = { pts: { x: number; y: number }[][]; life: number; max: number };

/**
 * Fundo vivo: partículas flutuando (brasas/poeira de luz) + raios ocasionais.
 * Usa a cor --glow do tema, então muda sozinho com o personagem.
 */
type Puff = { x: number; y: number; size: number; vx: number; vy: number; rot: number; vr: number; age: number; life: number; peak: number; flip: number };

export function Atmosphere({
  lightning = true,
  density = 55,
  smoke = true,
  z = 1,
}: {
  lightning?: boolean;
  density?: number;
  smoke?: boolean;
  z?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, last = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let rgb = "122,162,255";
    let smokeRgb = "200,205,230";
    let sprite: HTMLCanvasElement | null = null;
    // Sprite de uma "baforada" de fumaça: várias manchas suaves sobrepostas, desenhadas uma vez só.
    const buildSprite = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      for (let i = 0; i < 9; i++) {
        const cx = 128 + (Math.random() - 0.5) * 90;
        const cy = 128 + (Math.random() - 0.5) * 90;
        const r = 50 + Math.random() * 55;
        const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${smokeRgb},0.55)`);
        grad.addColorStop(0.5, `rgba(${smokeRgb},0.2)`);
        grad.addColorStop(1, `rgba(${smokeRgb},0)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, 256, 256);
      }
      return c;
    };
    const readColor = () => {
      const st = getComputedStyle(document.documentElement);
      const v = st.getPropertyValue("--glow").trim();
      if (v) rgb = v.split(/\s+/).join(",");
      // fumaça = mistura do brilho do tema com o tom do texto (fica pálida, mas "da cor" do personagem)
      const a = (v || "122 162 255").split(/\s+/).map(Number);
      const b = (st.getPropertyValue("--ink").trim() || "232 234 255").split(/\s+/).map(Number);
      const next = a.map((x, i) => Math.round(x * 0.45 + b[i] * 0.55)).join(",");
      if (next !== smokeRgb || !sprite) {
        smokeRgb = next;
        if (smoke) sprite = buildSprite();
      }
    };
    readColor();
    const colorTimer = setInterval(readColor, 2000);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.round(density * Math.min(1, (window.innerWidth * window.innerHeight) / 900000 + 0.35));
    const mk = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 8,
      vy: -(4 + Math.random() * 14),
      a: 0.25 + Math.random() * 0.6,
      ph: Math.random() * Math.PI * 2,
    });
    const parts: P[] = Array.from({ length: count }, mk);

    const puffCount = smoke ? (window.innerWidth < 700 ? 7 : 13) : 0;
    const spawnPuff = (initial: boolean): Puff => {
      const size = 380 + Math.random() * 520;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + size * 0.3,
        size,
        vx: (Math.random() - 0.5) * 14,
        vy: -(10 + Math.random() * 16),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.08,
        age: initial ? Math.random() * 12 : 0,
        life: 22 + Math.random() * 16,
        peak: 0.07 + Math.random() * 0.09,
        flip: Math.random() < 0.5 ? 1 : -1,
      };
    };
    const puffs: Puff[] = Array.from({ length: puffCount }, () => spawnPuff(true));

    const bolts: Bolt[] = [];
    let flash = 0;
    let nextStrike = performance.now() + 3000 + Math.random() * 5000;

    const makePath = (x: number, y: number, ang: number, len: number, jag: number) => {
      const pts = [{ x, y }];
      let cx = x, cy = y, a = ang;
      const seg = 14;
      for (let d = 0; d < len; d += seg) {
        a += (Math.random() - 0.5) * jag;
        cx += Math.sin(a) * seg;
        cy += Math.cos(a) * seg;
        pts.push({ x: cx, y: cy });
      }
      return pts;
    };
    const strike = () => {
      const x = w * (0.1 + Math.random() * 0.8);
      const main = makePath(x, -10, (Math.random() - 0.5) * 0.4, h * (0.45 + Math.random() * 0.4), 0.9);
      const paths = [main];
      for (let i = 0; i < 3; i++) {
        const from = main[Math.floor(main.length * (0.2 + Math.random() * 0.6))];
        paths.push(makePath(from.x, from.y, (Math.random() - 0.5) * 1.6, h * 0.18, 1.1));
      }
      bolts.push({ pts: paths, life: 0, max: 0.55 });
      flash = 1;
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.shadowBlur = 0;

      if (sprite) {
        for (let i = 0; i < puffs.length; i++) {
          const f = puffs[i];
          f.age += dt;
          if (f.age > f.life || f.y < -f.size) { puffs[i] = spawnPuff(false); continue; }
          f.x += (f.vx + Math.sin(now / 4000 + i) * 8) * dt;
          f.y += f.vy * dt;
          f.rot += f.vr * dt;
          const t = f.age / f.life;
          const fade = Math.sin(Math.PI * t); // surge, domina, some
          const grow = 0.75 + t * 0.9;
          const sz = f.size * grow;
          ctx.save();
          ctx.globalAlpha = f.peak * fade;
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rot);
          ctx.scale(f.flip, 1);
          ctx.drawImage(sprite, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }
      }

      for (const p of parts) {
        p.x += (p.vx + Math.sin(now / 1500 + p.ph) * 6) * dt;
        p.y += p.vy * dt;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const tw = 0.6 + 0.4 * Math.sin(now / 700 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${p.a * tw})`;
        ctx.shadowColor = `rgba(${rgb},0.9)`;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (lightning) {
        if (now > nextStrike) {
          strike();
          if (Math.random() < 0.35) setTimeout(strike, 140);
          nextStrike = now + 5000 + Math.random() * 9000;
        }
        if (flash > 0) {
          ctx.fillStyle = `rgba(${rgb},${flash * 0.1})`;
          ctx.fillRect(0, 0, w, h);
          flash = Math.max(0, flash - dt * 2.5);
        }
        for (let i = bolts.length - 1; i >= 0; i--) {
          const b = bolts[i];
          b.life += dt;
          if (b.life > b.max) { bolts.splice(i, 1); continue; }
          const k = 1 - b.life / b.max;
          const alpha = k * (0.6 + 0.4 * Math.sin(b.life * 90));
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          b.pts.forEach((path, idx) => {
            ctx.beginPath();
            path.forEach((pt, j) => (j ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
            ctx.strokeStyle = `rgba(${rgb},${alpha * (idx ? 0.55 : 1)})`;
            ctx.shadowColor = `rgba(${rgb},1)`;
            ctx.shadowBlur = 22;
            ctx.lineWidth = idx ? 1.2 : 2.4;
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
            ctx.shadowBlur = 0;
            ctx.lineWidth = idx ? 0.5 : 1;
            ctx.stroke();
          });
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(draw); }
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(colorTimer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [lightning, density, smoke]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: z }} />;
}
