import type { Theme } from "./types";

export const DEFAULT_THEME: Theme = {
  primary: "#3b4cff",
  accent: "#a855f7",
  glow: "#7aa2ff",
  bg: "#0b0d14",
  ink: "#e8eaff",
};

export const THEME_PRESETS: { name: string; theme: Theme }[] = [
  { name: "Raio Azul", theme: DEFAULT_THEME },
  { name: "Carmesim", theme: { primary: "#c1121f", accent: "#ff6b35", glow: "#ff4d5a", bg: "#120609", ink: "#ffe8ea" } },
  { name: "Esmeralda", theme: { primary: "#0f9d58", accent: "#2dd4bf", glow: "#5eead4", bg: "#06120e", ink: "#e6fff6" } },
  { name: "Ouro Antigo", theme: { primary: "#b8860b", accent: "#f5c542", glow: "#ffd966", bg: "#110d05", ink: "#fff6dc" } },
  { name: "Violeta Sombrio", theme: { primary: "#6d28d9", accent: "#ec4899", glow: "#c084fc", bg: "#0d0716", ink: "#f5e9ff" } },
  { name: "Gelo", theme: { primary: "#0ea5e9", accent: "#e0f2fe", glow: "#7dd3fc", bg: "#060d14", ink: "#eaf6ff" } },
];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** "#3b4cff" -> "59 76 255" (formato que o Tailwind usa para aplicar transparência) */
export function hexToChannels(hex: string, fallback = "0 0 0"): string {
  if (!HEX.test(hex)) return fallback;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function themeVars(theme?: Partial<Theme> | null): Record<string, string> {
  const t = { ...DEFAULT_THEME, ...(theme || {}) };
  return {
    "--primary": hexToChannels(t.primary, hexToChannels(DEFAULT_THEME.primary)),
    "--accent": hexToChannels(t.accent, hexToChannels(DEFAULT_THEME.accent)),
    "--glow": hexToChannels(t.glow, hexToChannels(DEFAULT_THEME.glow)),
    "--bg": hexToChannels(t.bg, hexToChannels(DEFAULT_THEME.bg)),
    "--ink": hexToChannels(t.ink, hexToChannels(DEFAULT_THEME.ink)),
  };
}

export function themeToCss(theme?: Partial<Theme> | null): string {
  const body = Object.entries(themeVars(theme))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `:root{${body}}`;
}

export function applyThemeToDocument(theme?: Partial<Theme> | null) {
  const root = document.documentElement;
  Object.entries(themeVars(theme)).forEach(([k, v]) => root.style.setProperty(k, v));
}
