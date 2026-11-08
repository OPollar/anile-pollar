"use client";
import { AnimatePresence, motion } from "framer-motion";
import { SkipForward } from "lucide-react";
import { useEffect, useRef } from "react";

/** Vídeo de abertura em tela cheia, com botão "Pular". Se falhar, pula sozinho. */
export function IntroVideo({ src, show, onDone }: { src?: string | null; show: boolean; onDone: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!show || !v) return;
    v.play().catch(() => {
      // Se o navegador recusar com som, tenta mudo (melhor do que travar).
      v.muted = true;
      v.play().catch(onDone);
    });
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {src && show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[180] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9 } }}
        >
          <video
            ref={ref}
            src={src}
            playsInline
            preload="auto"
            onEnded={onDone}
            onError={onDone}
            className="h-full w-full object-cover"
          />
          <motion.button
            onClick={onDone}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-8 right-8 flex items-center gap-2 rounded-full border border-glow/60 bg-black/50 px-6 py-2.5 text-sm tracking-[0.3em] text-white backdrop-blur transition-shadow hover:shadow-glow"
          >
            PULAR <SkipForward size={16} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
