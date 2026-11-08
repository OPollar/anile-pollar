import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Chapter, ChapterSummary, Sheet, Story } from "./types";

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

export const getIsMaster = cache(async (): Promise<boolean> => {
  if (!configured()) return false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.rpc("is_master");
    return data === true;
  } catch {
    return false;
  }
});

/** Garante que quem acessa é o Mestre; senão manda para o login. */
export async function requireMaster() {
  if (!(await getIsMaster())) redirect("/login");
}

/** Capítulos: leitores só recebem os publicados (RLS); o Mestre recebe todos. */
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

/** Ficha: devolve null se não existir ou se estiver privada e quem pede não é o Mestre. */
export const getSheet = cache(async (): Promise<Sheet | null> => {
  if (!configured()) return null;
  try {
    const { data } = await createClient().from("character_sheets").select("fields,public").eq("id", 1).maybeSingle();
    return (data as Sheet) ?? null;
  } catch {
    return null;
  }
});
