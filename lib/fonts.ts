import type { Typography } from "./types";

// As fontes são instaladas via npm (@fontsource) e importadas em app/layout.tsx,
// então funcionam offline/no Render sem depender do Google Fonts.
export const FONTS = [
  { key: "lora", label: "Lora — leitura clássica", stack: "'Lora Variable', Georgia, serif" },
  { key: "inter", label: "Inter — moderna", stack: "'Inter Variable', system-ui, sans-serif" },
  { key: "cinzel", label: "Cinzel — épica", stack: "'Cinzel Variable', Georgia, serif" },
  { key: "playfair", label: "Playfair — elegante", stack: "'Playfair Display Variable', Georgia, serif" },
  { key: "cormorant", label: "Cormorant — refinada", stack: "'Cormorant Garamond Variable', Georgia, serif" },
  { key: "merriweather", label: "Merriweather — confortável", stack: "'Merriweather Variable', Georgia, serif" },
  { key: "uncial", label: "Uncial Antiqua — runas", stack: "'Uncial Antiqua', Georgia, serif" },
  { key: "medieval", label: "MedievalSharp — medieval", stack: "'MedievalSharp', Georgia, serif" },
  { key: "typewriter", label: "Special Elite — máquina de escrever", stack: "'Special Elite', 'Courier New', monospace" },
] as const;

export const DEFAULT_TYPOGRAPHY: Typography = {
  fontFamily: "lora",
  fontSize: 19,
  lineHeight: 1.8,
  color: "#e8eaff",
};

export function fontStack(key?: string): string {
  return (FONTS.find((f) => f.key === key) || FONTS[0]).stack;
}

export function typographyStyle(t?: Partial<Typography> | null): React.CSSProperties {
  const ty = { ...DEFAULT_TYPOGRAPHY, ...(t || {}) };
  return {
    fontFamily: fontStack(ty.fontFamily),
    fontSize: `${ty.fontSize}px`,
    lineHeight: ty.lineHeight,
    color: ty.color,
  };
}
