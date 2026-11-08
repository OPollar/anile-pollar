"use client";
import { motion } from "framer-motion";

/** Tela de carregamento. Mesmo visual no carregamento inicial e nas trocas de página. */
export function Loader({ progress, title }: { progress?: number | null; title?: string }) {
  const pct = progress == null ? null : Math.round(progress * 100);
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-base">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(50% 40% at 50% 50%, rgb(var(--primary) / 0.28), transparent 70%)" }}
      />
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative grid h-36 w-36 place-items-center">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-glow/40"
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-3 rounded-full border-2 border-transparent border-t-accent border-r-glow"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
          <motion.svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="rgb(var(--glow))"
            animate={{
              opacity: [0.35, 1, 0.5, 1, 0.35],
              filter: [
                "drop-shadow(0 0 4px rgb(var(--glow)))",
                "drop-shadow(0 0 22px rgb(var(--glow)))",
                "drop-shadow(0 0 6px rgb(var(--glow)))",
                "drop-shadow(0 0 26px rgb(var(--glow)))",
                "drop-shadow(0 0 4px rgb(var(--glow)))",
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
          </motion.svg>
        </div>

        {title && <p className="font-display text-xl tracking-[0.3em] text-ink/80">{title}</p>}

        <div className="h-[3px] w-64 overflow-hidden rounded bg-white/10">
          {pct == null ? (
            <motion.div
              className="h-full w-1/3 rounded bg-gradient-to-r from-primary to-accent"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <motion.div
              className="h-full rounded bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${pct}%` }}
              transition={{ ease: "easeOut" }}
            />
          )}
        </div>
        <p className="text-xs tracking-[0.35em] text-ink/50">
          {pct == null ? "CARREGANDO" : `CARREGANDO ${pct}%`}
        </p>
      </div>
    </div>
  );
}
