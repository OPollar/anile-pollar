import { cache } from "react";
import { createClient } from "./supabase/server";
import type { Chapter, Sheet, Story } from "./types";

export const DEFAULT_STORY: Story = {
  id: 1,
  title: "Anile Pollar",
  subtitle: "Uma crônica de aventura",
  synopsis: null,
  cover_url: null,
  music_url: null,
  theme: "ember",
  heading_font: "cinzel",
};

// Todas as leituras são "à prova de falha": se o Supabase estiver fora do ar ou
// as variáveis de ambiente faltarem, o site ainda abre (vazio) em vez de quebrar.

export const getStory = cache(async (): Promise<Story> => {
  try {
    const { data } = await createClient().from("story").select("*").eq("id", 1).maybeSingle();
    if (!data) return DEFAULT_STORY;
    return {
      id: 1,
      title: data.title || DEFAULT_STORY.title,
      subtitle: data.subtitle ?? null,
      synopsis: data.synopsis ?? null,
      cover_url: data.cover_url ?? null,
      music_url: data.music_url ?? null,
      theme: data.theme || "ember",
      heading_font: data.heading_font || "cinzel",
    };
  } catch {
    return DEFAULT_STORY;
  }
});

export const getChapters = cache(async (): Promise<Chapter[]> => {
  try {
    const { data } = await createClient()
      .from("chapters")
      .select("id, number, title, summary, cover_url, published")
      .order("number", { ascending: true });
    return (data ?? []) as Chapter[];
  } catch {
    return [];
  }
});

export async function getChapter(n: number): Promise<Chapter | null> {
  try {
    const { data } = await createClient().from("chapters").select("*").eq("number", n).maybeSingle();
    return (data as Chapter) ?? null;
  } catch {
    return null;
  }
}

export async function getSheets(): Promise<Sheet[]> {
  try {
    const { data } = await createClient().from("character_sheets").select("*").order("name", { ascending: true });
    return (data ?? []) as Sheet[];
  } catch {
    return [];
  }
}
