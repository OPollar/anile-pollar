import { createClient } from "./supabase/client";

import { compressImage, fmtMB, HARD_LIMIT_BYTES } from "./compress";

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

export type UploadOptions = {
  /** pasta dentro do bucket (padrão: o tipo). "sheet" = retrato da ficha */
  folder?: string;
  /** lado maior máximo das imagens, em px */
  maxDim?: number;
  /** recebe mensagens de progresso ("Comprimindo...", "12 MB → 1,2 MB") */
  onStatus?: (msg: string) => void;
};

/**
 * Envia um arquivo para o Supabase Storage (bucket "media") e devolve a URL pública.
 * Imagens são comprimidas antes (WebP) para ficarem sempre abaixo do limite de 50 MB.
 */
export async function uploadMedia(file: File, kind: MediaKind, opts: UploadOptions = {}): Promise<string> {
  const supabase = createClient();
  let f = file;

  if (kind === "images") {
    opts.onStatus?.("Comprimindo imagem...");
    try {
      f = await compressImage(file, opts.maxDim);
    } catch (e: any) {
      throw new Error(e.message || "Não consegui processar a imagem.");
    }
    if (f !== file) opts.onStatus?.(`Imagem otimizada: ${fmtMB(file.size)} → ${fmtMB(f.size)}`);
  }

  if (f.size > HARD_LIMIT_BYTES) {
    throw new Error(
      `Arquivo de ${fmtMB(f.size)} passa do limite de 50 MB. ` +
        (kind === "images" ? "Use uma imagem menor (ou JPEG/PNG em vez de GIF)." : "Comprima o arquivo antes de enviar (ex.: MP3 128 kbps / MP4 H.264).")
    );
  }

  const path = `${opts.folder || kind}/${Date.now()}-${safeName(f.name)}`;
  const { error } = await supabase.storage.from("media").upload(path, f, {
    cacheControl: "31536000",
    upsert: false,
    contentType: f.type || undefined,
  });
  if (error) {
    if (/exceeded|too large|size/i.test(error.message)) {
      throw new Error("Arquivo grande demais (o limite do plano grátis é 50 MB).");
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
