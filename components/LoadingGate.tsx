"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { preloadAll } from "@/lib/preload";

export function LoadingGate({ assets, children }: { assets: Parameters<typeof preloadAll>[0]; children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    preloadAll(assets, setProgress).then(() => setTimeout(() => setReady(true), 400));
  }, []);

  return (
    <>
      <AnimatePresence>
        {!ready && (
          <motion.div key="loader" className="fixed inset-0 z-[200] grid place-items-center bg-base"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(12px)", transition: { duration: 0.9 } }}>
            <motion.svg width="90" height="90" viewBox="0 0 24 24" fill="var(--glow)"
              animate={{ opacity: [0.3, 1, 0.3], filter: ["drop-shadow(0 0 4px var(--glow))", "drop-shadow(0 0 22px var(--glow))", "drop-shadow(0 0 4px var(--glow))"] }}
              transition={{ duration: 1.4, repeat: Infinity }}>
              <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
            </motion.svg>
            <div className="absolute bottom-24 h-[3px] w-64 overflow-hidden rounded bg-white/10">
              <motion.div className="h-full bg-gradient-to-r from-primary to-accent"
                animate={{ width: `${progress * 100}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {ready && children}
    </>
  );
}
