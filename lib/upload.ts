import { createClient } from "./supabase/client";

export type MediaKind = "images" | "audio" | "video";

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 50);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base || "arquivo"}${ext ? "." + ext : ""}`;
}

/** Envia um arquivo para o Supabase Storage (bucket "media") e devolve a URL pública. */
export async function uploadMedia(file: File, kind: MediaKind): Promise<string> {
  const supabase = createClient();
  const path = `${kind}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    if (/exceeded|too large|size/i.test(error.message)) {
      throw new Error("Arquivo grande demais (o limite do plano grátis é 50 MB). Comprima e tente de novo.");
    }
    throw new Error(error.message);
  }
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "capitulo"
  );
}
