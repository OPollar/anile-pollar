import type { Sheet } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const DEFAULT_SHEET: Sheet = {
  name: "",
  subtitle: "Classe · Nível · Origem",
  portrait_url: null,
  sections: [
    {
      id: "s-vitals",
      title: "Vitalidade",
      icon: "🩸",
      fields: [
        { id: "f-hp", label: "Vida", type: "bar", value: "10", max: "10", icon: "❤️", accent: "#a61e1e" },
        { id: "f-mp", label: "Energia", type: "bar", value: "10", max: "10", icon: "⚡", accent: "#2b5fb8" },
        { id: "f-xp", label: "Experiência", type: "bar", value: "0", max: "100", icon: "✨", accent: "#8a6a12" },
      ],
    },
    {
      id: "s-attrs",
      title: "Atributos",
      icon: "⚔️",
      fields: [
        { id: "f-for", label: "Força", type: "number", value: "", icon: "💪", accent: "#7a3b12" },
        { id: "f-agi", label: "Agilidade", type: "number", value: "", icon: "🪶", accent: "#7a3b12" },
        { id: "f-int", label: "Inteligência", type: "number", value: "", icon: "📖", accent: "#7a3b12" },
        { id: "f-car", label: "Carisma", type: "number", value: "", icon: "🎭", accent: "#7a3b12" },
      ],
    },
    {
      id: "s-id",
      title: "Identidade",
      icon: "🪪",
      fields: [
        { id: "f-idade", label: "Idade", type: "text", value: "", icon: "⏳" },
        { id: "f-poder", label: "Poder", type: "text", value: "", icon: "🌩️" },
        { id: "f-origem", label: "Origem", type: "text", value: "", icon: "🏰" },
      ],
    },
    {
      id: "s-skills",
      title: "Habilidades & Fraquezas",
      icon: "🗡️",
      wide: true,
      fields: [
        { id: "f-skills", label: "Habilidades", type: "tags", value: "", tags: [], icon: "✦", accent: "#2f6b3a" },
        { id: "f-weak", label: "Fraquezas", type: "tags", value: "", tags: [], icon: "☠", accent: "#7a1c1c" },
      ],
    },
    {
      id: "s-story",
      title: "Crônica",
      icon: "📜",
      wide: true,
      fields: [
        { id: "f-look", label: "Aparência", type: "textarea", value: "", icon: "👁️" },
        { id: "f-pers", label: "Personalidade", type: "textarea", value: "", icon: "🖤" },
        { id: "f-hist", label: "História", type: "textarea", value: "", icon: "📜" },
      ],
    },
    {
      id: "s-bag",
      title: "Inventário",
      icon: "🎒",
      wide: true,
      fields: [
        { id: "f-inv", label: "Itens", type: "tags", value: "", tags: [], icon: "🎒", accent: "#6b4a12" },
        { id: "f-notes", label: "Anotações", type: "textarea", value: "", icon: "🖋️" },
      ],
    },
  ],
};

/** Aceita o formato novo, o antigo (lista de campos da v1) ou nada. */
export function normalizeSheet(raw: any): Sheet {
  if (raw && Array.isArray(raw.sections)) {
    return { ...DEFAULT_SHEET, ...raw, sections: raw.sections };
  }
  return DEFAULT_SHEET;
}
