"use client";
import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { uploadMedia, type MediaKind } from "@/lib/upload";

const ACCEPT: Record<MediaKind, string> = {
  images: "image/png,image/jpeg,image/webp,image/gif",
  audio: "audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/mp4,audio/aac",
  video: "video/mp4,video/webm",
};

/** Envia um arquivo para o Supabase Storage (ou aceita uma URL colada) e mostra uma prévia. */
export function MediaField({
  label,
  hint,
  kind,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  kind: MediaKind;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      onChange(await uploadMedia(file, kind, { onStatus: setNote }));
    } catch (e: any) {
      setError(e.message || "Falha no envio.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-ink/50">{hint}</p>}
      {value && kind === "images" && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-28 w-full rounded-xl object-cover" />}
      {value && kind === "audio" && <audio src={value} controls className="w-full" />}
      {value && kind === "video" && <video src={value} controls className="h-32 w-full rounded-xl bg-black" />}
      <div className="flex gap-2">
        <button type="button" className="btn flex-1" onClick={() => input.current?.click()} disabled={busy}>
          <Upload size={15} /> {busy ? "Processando..." : value ? "Trocar" : "Enviar arquivo"}
        </button>
        {value && (
          <button type="button" className="btn btn-danger" onClick={() => onChange(null)} aria-label="Remover">
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={ACCEPT[kind]} hidden onChange={(e) => pick(e.target.files?.[0])} />
      <input
        className="field !py-1.5 text-xs"
        placeholder="ou cole uma URL"
        value={value || ""}
        onChange={(e) => onChange(e.target.value.trim() || null)}
      />
      {note && !error && <p className="text-xs text-emerald-300">{note}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
