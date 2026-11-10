"use client";
import { Howl } from "howler";
import { motion } from "framer-motion";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

const DUCK = 0.25; // volume relativo da trilha enquanto um áudio do texto toca

/** Player flutuante da trilha sonora do capítulo (play/pause + volume). */
export function MusicPlayer({ src, active }: { src?: string | null; active: boolean }) {
  const volume = useStore((s) => s.volume);
  const setVolume = useStore((s) => s.setVolume);
  const musicOn = useStore((s) => s.musicOn);
  const setMusicOn = useStore((s) => s.setMusicOn);
  const ducking = useStore((s) => s.ducking);
  const howl = useRef<Howl | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Cria/destroi a trilha quando o capítulo muda.
  useEffect(() => {
    if (!src) return;
    const h = new Howl({ src: [src], loop: true, volume: 0, html5: true, preload: true });
    h.on("playerror", () => h.once("unlock", () => h.play()));
    howl.current = h;
    return () => {
      howl.current = null;
      try {
        h.fade(h.volume(), 0, 500);
      } catch {}
      setTimeout(() => h.unload(), 600);
    };
  }, [src]);

  // Liga/desliga e ajusta volume (com fade suave).
  useEffect(() => {
    const h = howl.current;
    if (!h) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (active && musicOn) {
      if (!h.playing()) h.play();
      h.fade(h.volume(), volume * (ducking > 0 ? DUCK : 1), 500);
    } else {
      h.fade(h.volume(), 0, 400);
      t = setTimeout(() => h.pause(), 420);
    }
    return () => t && clearTimeout(t);
  }, [active, musicOn, volume, ducking, src]);

  if (!src || !mounted) return null;
  const playing = active && musicOn;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      onHoverStart={() => setOpen(true)}
      onHoverEnd={() => setOpen(false)}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-full border border-primary/50 bg-black/60 py-2 pl-2 pr-4 shadow-glow backdrop-blur-md"
    >
      <button
        onClick={() => setMusicOn(!musicOn)}
        aria-label={playing ? "Pausar trilha sonora" : "Tocar trilha sonora"}
        className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition hover:scale-110"
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-px" />}
      </button>

      {playing ? (
        <span className="flex h-4 items-end gap-[2px]" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-full w-[3px] origin-bottom rounded bg-glow animate-bars" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </span>
      ) : (
        <Music2 size={16} className="text-glow/70" aria-hidden />
      )}

      <div className="flex items-center gap-2">
        <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} aria-label="Mudo" className="text-white/80 hover:text-white">
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          aria-label="Volume da trilha"
          onChange={(e) => setVolume(+e.target.value)}
          onFocus={() => setOpen(true)}
          className={`h-1 cursor-pointer accent-accent transition-all duration-300 ${open ? "w-24 opacity-100" : "w-0 opacity-0 sm:w-24 sm:opacity-100"}`}
        />
      </div>
    </motion.div>
  );
}
