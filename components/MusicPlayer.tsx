"use client";
import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { Pause, Play, Volume2 } from "lucide-react";
import { useMusic } from "@/lib/store";

export default function MusicPlayer({ src }: { src: string | null }) {
  const { playing, volume, override, toggle, setVolume } = useMusic();
  const track = override || src;
  const howl = useRef<Howl | null>(null);

  // Troca de trilha
  useEffect(() => {
    if (!track) return;
    const h = new Howl({ src: [track], loop: true, html5: true, volume: useMusic.getState().volume });
    howl.current = h;
    if (useMusic.getState().playing) h.play();
    return () => {
      h.unload();
      howl.current = null;
    };
  }, [track]);

  // Play / pause
  useEffect(() => {
    const h = howl.current;
    if (!h) return;
    if (playing) {
      if (!h.playing()) h.play();
    } else {
      h.pause();
    }
  }, [playing, track]);

  // Volume
  useEffect(() => {
    howl.current?.volume(volume);
  }, [volume]);

  if (!track) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full border border-primary/40 bg-base/90 px-4 py-2 shadow-glow backdrop-blur">
      <button onClick={toggle} aria-label={playing ? "Pausar trilha" : "Tocar trilha"} className="text-primary">
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <Volume2 size={16} className="text-ink/60" />
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-20 accent-primary"
        aria-label="Volume"
      />
    </div>
  );
}
