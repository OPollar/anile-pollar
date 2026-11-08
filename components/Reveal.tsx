"use client";
import { useEffect } from "react";

/** Faz cada parágrafo/bloco do texto aparecer suavemente quando entra na tela. */
export function useRevealOnScroll(container: React.RefObject<HTMLElement>, enabled: boolean, deps: unknown[] = []) {
  useEffect(() => {
    const root = container.current;
    if (!enabled || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".ProseMirror > *"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    targets.forEach((t) => {
      t.classList.add("reveal");
      io.observe(t);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}
