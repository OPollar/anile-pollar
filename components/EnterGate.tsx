"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";

/**
 * O navegador só libera áudio/vídeo com som depois de um clique do leitor.
 * Este portal elegante é esse clique — e depois dele tudo toca automaticamente.
 */
export function EnterGate({ show, title, subtitle, onEnter }: { show: boolean; title: string; subtitle?: string | null; onEnter: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[150] grid place-items-center bg-base/85 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7 } }}
        >
          <div className="flex flex-col items-center gap-6 px-6 text-center">
            <motion.h1
              className="font-display text-4xl tracking-[0.15em] text-ink md:text-6xl"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1 }}
              style={{ textShadow: "0 0 30px rgb(var(--glow) / 0.8)" }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p className="max-w-md text-ink/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {subtitle}
              </motion.p>
            )}
            <motion.button
              onClick={onEnter}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="mt-4 flex items-center gap-3 rounded-full border border-glow/60 bg-primary/30 px-9 py-3 text-lg tracking-[0.3em] text-white backdrop-blur animate-pulseGlow"
            >
              <Zap size={18} className="text-glow" /> ENTRAR
            </motion.button>
            <p className="text-xs tracking-widest text-ink/40">🎧 melhor com fones de ouvido</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
