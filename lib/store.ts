import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  /** O leitor já clicou em "Entrar"? (libera áudio/vídeo com som nos navegadores) */
  entered: boolean;
  enter: () => void;
  /** Volume da trilha (0..1), lembrado entre visitas */
  volume: number;
  setVolume: (v: number) => void;
  musicOn: boolean;
  setMusicOn: (v: boolean) => void;
  /** Quantos áudios inline estão tocando agora (a trilha abaixa o volume enquanto >0) */
  ducking: number;
  duck: (delta: number) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      entered: false,
      enter: () => set({ entered: true }),
      volume: 0.5,
      setVolume: (volume) => set({ volume }),
      musicOn: true,
      setMusicOn: (musicOn) => set({ musicOn }),
      ducking: 0,
      duck: (delta) => set((s) => ({ ducking: Math.max(0, s.ducking + delta) })),
    }),
    {
      name: "anile-prefs",
      partialize: (s) => ({ volume: s.volume }),
      skipHydration: true, // reidratamos no cliente (evita erro de hidratação)
    }
  )
);
