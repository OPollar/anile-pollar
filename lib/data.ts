import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Chapter, ChapterSummary, Role, Sheet, Story } from "./types";
import { DEFAULT_SHEET, normalizeSheet } from "./sheet";

export const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const getStory = cache(async (): Promise<Story | null> => {
  if (!configured()) return null;
  try {
    const { data } = await createClient().from("story").select("*").eq("id", 1).maybeSingle();
    return (data as Story) ?? null;
  } catch {
    return null;
  }
});

/** Quem está logado: "player" (escreve), "master" (lê + ficha) ou null (visitante). */
export const getRole = cache(async (): Promise<Role | null> => {
  if (!configured()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.rpc("my_role");
    return data === "player" || data === "master" ? data : null;
  } catch {
    return null;
  }
});

/** Só o Player entra no painel; qualquer outro volta para o login. */
export async function requirePlayer() {
  if ((await getRole()) !== "player") redirect("/login");
}

/** Capítulos: leitores e Mestre só recebem os publicados (RLS); o Player recebe todos. */
export const getChapterList = cache(async (): Promise<ChapterSummary[]> => {
  if (!configured()) return [];
  try {
    const { data } = await createClient()
      .from("chapters")
      .select("id,position,slug,title,subtitle,published,updated_at")
      .order("position", { ascending: true });
    return (data as ChapterSummary[]) ?? [];
  } catch {
    return [];
  }
});

export async function getChapterBySlug(slug: string): Promise<Chapter | null> {
  const { data } = await createClient().from("chapters").select("*").eq("slug", slug).maybeSingle();
  return (data as Chapter) ?? null;
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const { data } = await createClient().from("chapters").select("*").eq("id", id).maybeSingle();
  return (data as Chapter) ?? null;
}

/** Ficha: só Player e Mestre enxergam (RLS). Visitante recebe null. */
export const getSheet = cache(async (): Promise<Sheet | null> => {
  if (!configured()) return null;
  try {
    const { data } = await createClient().from("character_sheets").select("data").eq("id", 1).maybeSingle();
    if (!data) return null;
    return normalizeSheet((data as { data: unknown }).data ?? DEFAULT_SHEET);
  } catch {
    return null;
  }
});
