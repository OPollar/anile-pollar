"use client";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export type ImageEffect = "full" | "float" | "breathe" | "light" | "parallax" | "none";
export type ImageSize = "sm" | "md" | "lg" | "full";

export const IMAGE_EFFECTS: { value: ImageEffect; label: string }[] = [
  { value: "full", label: "Completo (recomendado)" },
  { value: "float", label: "Flutuar" },
  { value: "breathe", label: "Respirar" },
  { value: "light", label: "Brilho de luz" },
  { value: "parallax", label: "Parallax (mouse)" },
  { value: "none", label: "Parado" },
];

export const IMAGE_SIZES: { value: ImageSize; label: string; width: string }[] = [
  { value: "sm", label: "Pequena", width: "40%" },
  { value: "md", label: "Média", width: "65%" },
  { value: "lg", label: "Grande", width: "85%" },
  { value: "full", label: "Total", width: "100%" },
];

/**
 * Qualquer PNG/JPEG vira uma imagem "viva": flutua, respira, reage ao mouse (parallax 3D)
 * e ganha brilho de luz — tudo automático, sem o Mestre configurar nada.
 */
export function LivingImageFx({
  src,
  alt = "",
  effect = "full",
  size = "md",
}: {
  src: string;
  alt?: string;
  effect?: ImageEffect;
  size?: ImageSize;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 16 });
  const sy = useSpring(my, { stiffness: 70, damping: 16 });
  const rotateY = useTransform(sx, [-1, 1], [-7, 7]);
  const rotateX = useTransform(sy, [-1, 1], [7, -7]);
  const tx = useTransform(sx, [-1, 1], [-12, 12]);
  const ty = useTransform(sy, [-1, 1], [-12, 12]);

  const on = !reduce && effect !== "none";
  const float = on && (effect === "full" || effect === "float");
  const breathe = on && (effect === "full" || effect === "breathe");
  const light = on && (effect === "full" || effect === "light");
  const tilt = on && (effect === "full" || effect === "parallax");
  const glow = on && effect !== "parallax";

  const onMove = (e: React.PointerEvent) => {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const width = IMAGE_SIZES.find((s) => s.value === size)?.width ?? "65%";

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate mx-auto my-10"
      style={{ width, maxWidth: "100%", perspective: 900 }}
    >
      {glow && (
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-3xl blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.9), transparent 70%)" }}
          animate={{ opacity: [0.18, 0.5, 0.18], scale: [0.92, 1.06, 0.92] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.div
        animate={float ? { y: [0, -12, 0] } : undefined}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div style={tilt ? { x: tx, y: ty, rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}>
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            animate={breathe ? { scale: [1, 1.025, 1] } : undefined}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} draggable={false} decoding="async" loading="lazy" className="block h-auto w-full select-none" />
            {light && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                style={{
                  background: "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                }}
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
