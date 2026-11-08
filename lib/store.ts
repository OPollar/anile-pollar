import { create } from "zustand";

type MusicState = {
  playing: boolean;
  volume: number;
  override: string | null; // trilha do capítulo aberto (sobrepõe a trilha geral)
  toggle: () => void;
  setVolume: (v: number) => void;
  setOverride: (src: string | null) => void;
};

export const useMusic = create<MusicState>((set) => ({
  playing: false,
  volume: 0.5,
  override: null,
  toggle: () => set((s) => ({ playing: !s.playing })),
  setVolume: (volume) => set({ volume }),
  setOverride: (override) => set({ override }),
}));
