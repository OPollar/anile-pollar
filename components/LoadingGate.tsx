"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Loader } from "./Loader";
import { preloadAll, type Assets } from "@/lib/preload";

/**
 * Cobre a tela até TODAS as mídias estarem prontas (imagens, trilha, vídeo).
 * Os filhos já ficam montados por baixo, então tudo está pronto quando o véu sobe.
 * Há um limite de segurança (20s) para nunca prender o leitor na tela de carregamento.
 */
export function LoadingGate({
  assets,
  title,
  onReady,
  children,
}: {
  assets: Assets;
  title?: string;
  onReady?: () => void;
  children?: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const started = useRef(false);
  const cb = useRef(onReady);
  cb.current = onReady;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setTimeout(() => {
        setReady(true);
        cb.current?.();
      }, 350);
    };
    const safety = setTimeout(finish, 20000);
    preloadAll(assets, setProgress).then(() => {
      clearTimeout(safety);
      finish();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="loader"
            exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)", transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[200]"
          >
            <Loader progress={progress} title={title} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
