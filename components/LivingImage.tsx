"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export function LivingImage({ src, alt = "", intensity = 12 }: { src: string; alt?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 15 });
  const sy = useSpring(my, { stiffness: 60, damping: 15 });
  const x = useTransform(sx, [-1, 1], [-intensity, intensity]);
  const y = useTransform(sy, [-1, 1], [-intensity, intensity]);
  const rotateY = useTransform(sx, [-1, 1], [-4, 4]);
  const rotateX = useTransform(sy, [-1, 1], [4, -4]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
         className="relative my-8 [perspective:900px]">
      <motion.div aria-hidden
        className="absolute inset-0 -z-10 rounded-3xl blur-3xl"
        style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.img src={src} alt={alt} draggable={false}
        className="mx-auto max-w-full rounded-2xl"
        style={{ x, y, rotateX, rotateY }}
        animate={{ translateY: [0, -10, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}
