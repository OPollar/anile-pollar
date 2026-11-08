import type { CSSProperties } from "react";

export const THEMES: Record<string, { label: string; vars: Record<string, string> }> = {
  ember: {
    label: "Brasa (dourado)",
    vars: { "--primary": "201 162 39", "--accent": "168 50 30", "--glow": "255 170 60", "--bg": "14 11 9", "--ink": "236 226 206" },
  },
  arcane: {
    label: "Arcano (violeta)",
    vars: { "--primary": "139 108 235", "--accent": "70 160 230", "--glow": "150 120 255", "--bg": "10 9 20", "--ink": "226 224 245" },
  },
  forest: {
    label: "Floresta (verde)",
    vars: { "--primary": "110 180 100", "--accent": "190 160 70", "--glow": "120 210 120", "--bg": "8 14 10", "--ink": "225 236 220" },
  },
  blood: {
    label: "Sangue (vermelho)",
    vars: { "--primary": "200 60 60", "--accent": "220 150 90", "--glow": "255 80 80", "--bg": "16 8 9", "--ink": "240 224 224" },
  },
};

export const HEADING_FONTS: Record<string, { label: string; family: string }> = {
  cinzel: { label: "Cinzel", family: "'Cinzel Variable', serif" },
  cormorant: { label: "Cormorant Garamond", family: "'Cormorant Garamond Variable', serif" },
  playfair: { label: "Playfair Display", family: "'Playfair Display Variable', serif" },
  medieval: { label: "MedievalSharp", family: "'MedievalSharp', cursive" },
  uncial: { label: "Uncial Antiqua", family: "'Uncial Antiqua', cursive" },
  special: { label: "Special Elite", family: "'Special Elite', monospace" },
};

export const BODY_FONTS = [
  { label: "Lora", family: "'Lora Variable', serif" },
  { label: "Merriweather", family: "'Merriweather Variable', serif" },
  { label: "Inter", family: "'Inter Variable', sans-serif" },
  { label: "Cormorant Garamond", family: "'Cormorant Garamond Variable', serif" },
  { label: "Special Elite (máquina de escrever)", family: "'Special Elite', monospace" },
  { label: "MedievalSharp", family: "'MedievalSharp', cursive" },
  { label: "Uncial Antiqua", family: "'Uncial Antiqua', cursive" },
];

export function themeVars(theme?: string | null, font?: string | null): CSSProperties {
  const t = THEMES[theme ?? ""] ?? THEMES.ember;
  const f = HEADING_FONTS[font ?? ""] ?? HEADING_FONTS.cinzel;
  return { ...t.vars, "--font-display": f.family } as CSSProperties;
}
