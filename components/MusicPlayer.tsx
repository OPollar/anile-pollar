"use client";
import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function MusicPlayer({ src, start }: { src?: string | null; start: boolean }) {
  const howl = useRef<Howl | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (!src) return;
    howl.current = new Howl({ src: [src], loop: true, volume: 0, html5: true });
    return () => { howl.current?.fade(howl.current.volume(), 0, 600); howl.current?.unload(); };
  }, [src]);

  useEffect(() => {
    if (start && howl.current && !playing) {
      howl.current.play(); howl.current.fade(0, volume, 1500); setPlaying(true);
    }
  }, [start]);

  const toggle = () => {
    const h = howl.current; if (!h) return;
    if (playing) { h.fade(volume, 0, 400); setTimeout(() => h.pause(), 400); }
    else { h.play(); h.fade(0, volume, 600); }
    setPlaying(!playing);
  };
  const onVol = (v: number) => { setVolume(v); howl.current?.volume(v); };

  if (!src) return null;
  return (
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-full border border-primary/40
                 bg-black/60 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_var(--glow)]">
      <button onClick={toggle} className="text-glow text-lg">{playing ? "❚❚" : "▶"}</button>
      <input type="range" min={0} max={1} step={0.01} value={volume}
             onChange={(e) => onVol(+e.target.value)} className="w-24 accent-[var(--accent)]" />
    </motion.div>
  );
}
