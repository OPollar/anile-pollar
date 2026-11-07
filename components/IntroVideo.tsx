"use client";
import { AnimatePresence, motion } from "framer-motion";

export function IntroVideo({ src, show, onDone }: { src?: string | null; show: boolean; onDone: () => void }) {
  return (
    <AnimatePresence>
      {src && show && (
        <motion.div key="intro" className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.8 } }}>
          <video src={src} autoPlay playsInline onEnded={onDone}
                 className="h-full w-full object-cover" />
          <motion.button onClick={onDone}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
            className="absolute bottom-8 right-8 rounded-full border border-accent/60 bg-black/50 px-6 py-2
                       tracking-widest text-white backdrop-blur hover:shadow-[0_0_24px_var(--accent)]">
            PULAR ⏭
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
