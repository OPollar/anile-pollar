"use client";
import { useEffect } from "react";
import { useMusic } from "@/lib/store";

// Coloque dentro de uma página para que ela use uma trilha própria.
export default function MusicOverride({ src }: { src: string | null | undefined }) {
  const setOverride = useMusic((s) => s.setOverride);
  useEffect(() => {
    setOverride(src || null);
    return () => setOverride(null);
  }, [src, setOverride]);
  return null;
}
