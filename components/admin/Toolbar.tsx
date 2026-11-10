"use client";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Highlighter, Heading1, Heading2, Heading3,
  ImagePlus, Italic, List, ListOrdered, Minus, Music, Quote, Redo2, Strikethrough, Underline, Undo2, RemoveFormatting,
} from "lucide-react";
import { useRef, useState } from "react";
import { FONTS } from "@/lib/fonts";
import { uploadMedia } from "@/lib/upload";

const SIZES = [12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 64];
const LINE_HEIGHTS = ["1.2", "1.4", "1.6", "1.8", "2", "2.4", "3"];

function Btn({ active, onClick, title, children, disabled }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      // mousedown + preventDefault mantém a seleção do texto no editor
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`grid h-9 w-9 place-items-center rounded-lg transition hover:bg-white/15 disabled:opacity-30 ${active ? "bg-primary text-white shadow-glow" : "text-ink/80"}`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-6 w-px bg-white/15" />;

export function Toolbar({ editor, onError }: { editor: Editor; onError: (m: string) => void }) {
  const imgInput = useRef<HTMLInputElement>(null);
  const audInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"" | "img" | "aud">("");

  const ts = editor.getAttributes("textStyle");
  const currentFont = FONTS.find((f) => f.stack === ts.fontFamily)?.stack || "";
  const currentSize = ts.fontSize ? String(parseInt(ts.fontSize)) : "";
  const block = editor.getAttributes("paragraph").lineHeight || editor.getAttributes("heading").lineHeight || "";

  const upload = async (file: File | undefined, kind: "images" | "audio") => {
    if (!file) return;
    setBusy(kind === "images" ? "img" : "aud");
    try {
      const url = await uploadMedia(file, kind);
      if (kind === "images") editor.chain().focus().setLivingImage({ src: url, alt: "" }).run();
      else editor.chain().focus().setAudioInline({ src: url, title: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (e: any) {
      onError(e.message || "Falha no envio.");
    } finally {
      setBusy("");
      if (imgInput.current) imgInput.current.value = "";
      if (audInput.current) audInput.current.value = "";
    }
  };

  const c = () => editor.chain().focus();

  return (
    <div className="sticky top-[57px] z-30 flex flex-wrap items-center gap-1 rounded-2xl border border-primary/40 bg-base/95 p-2 backdrop-blur">
      <Btn title="Desfazer" onClick={() => c().undo().run()} disabled={!editor.can().undo()}><Undo2 size={16} /></Btn>
      <Btn title="Refazer" onClick={() => c().redo().run()} disabled={!editor.can().redo()}><Redo2 size={16} /></Btn>
      <Sep />

      <select
        className="field !w-44 !py-1.5 text-sm"
        value={currentFont}
        onChange={(e) => (e.target.value ? c().setFontFamily(e.target.value).run() : c().unsetFontFamily().run())}
        title="Fonte"
      >
        <option value="">Fonte do capítulo</option>
        {FONTS.map((f) => <option key={f.key} value={f.stack}>{f.label.split(" — ")[0]}</option>)}
      </select>
      <select
        className="field !w-24 !py-1.5 text-sm"
        value={currentSize}
        onChange={(e) => (e.target.value ? c().setFontSize(`${e.target.value}px`).run() : c().unsetFontSize().run())}
        title="Tamanho"
      >
        <option value="">Tamanho</option>
        {SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
      </select>
      <select
        className="field !w-24 !py-1.5 text-sm"
        value={block}
        onChange={(e) => (e.target.value ? c().setLineHeight(e.target.value).run() : c().unsetLineHeight().run())}
        title="Espaçamento entre linhas"
      >
        <option value="">Linhas</option>
        {LINE_HEIGHTS.map((s) => <option key={s} value={s}>{s}×</option>)}
      </select>
      <Sep />

      <Btn title="Negrito" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}><Bold size={16} /></Btn>
      <Btn title="Itálico" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}><Italic size={16} /></Btn>
      <Btn title="Sublinhado" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()}><Underline size={16} /></Btn>
      <Btn title="Riscado" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()}><Strikethrough size={16} /></Btn>

      <label title="Cor do texto" className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-lg hover:bg-white/15">
        <span className="text-sm font-bold" style={{ color: ts.color || "inherit", textShadow: ts.color ? "0 0 6px " + ts.color : "none" }}>A</span>
        <span className="absolute bottom-1.5 h-[3px] w-5 rounded" style={{ background: ts.color || "rgb(var(--ink))" }} />
        <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={ts.color || "#e8eaff"} onChange={(e) => c().setColor(e.target.value).run()} />
      </label>
      <label title="Cor de destaque (marca-texto)" className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-lg hover:bg-white/15">
        <Highlighter size={16} />
        <input type="color" className="absolute inset-0 cursor-pointer opacity-0" defaultValue="#a855f7" onChange={(e) => c().setHighlight({ color: e.target.value }).run()} />
      </label>
      <Btn title="Limpar formatação" onClick={() => c().unsetAllMarks().unsetFontSize().run()}><RemoveFormatting size={16} /></Btn>
      <Sep />

      <Btn title="Título 1" active={editor.isActive("heading", { level: 1 })} onClick={() => c().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></Btn>
      <Btn title="Título 2" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
      <Btn title="Título 3" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></Btn>
      <Sep />

      <Btn title="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => c().setTextAlign("left").run()}><AlignLeft size={16} /></Btn>
      <Btn title="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => c().setTextAlign("center").run()}><AlignCenter size={16} /></Btn>
      <Btn title="Alinhar à direita" active={editor.isActive({ textAlign: "right" })} onClick={() => c().setTextAlign("right").run()}><AlignRight size={16} /></Btn>
      <Btn title="Justificar" active={editor.isActive({ textAlign: "justify" })} onClick={() => c().setTextAlign("justify").run()}><AlignJustify size={16} /></Btn>
      <Sep />

      <Btn title="Lista" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}><List size={16} /></Btn>
      <Btn title="Lista numerada" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
      <Btn title="Citação" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}><Quote size={16} /></Btn>
      <Btn title="Linha divisória" onClick={() => c().setHorizontalRule().run()}><Minus size={16} /></Btn>
      <Sep />

      <button type="button" className="btn !rounded-lg !px-3 !py-1.5" disabled={busy === "img"} onClick={() => imgInput.current?.click()} title="Inserir imagem animada (PNG/JPEG)">
        <ImagePlus size={16} /> {busy === "img" ? "Enviando..." : "Imagem"}
      </button>
      <button type="button" className="btn !rounded-lg !px-3 !py-1.5" disabled={busy === "aud"} onClick={() => audInput.current?.click()} title="Inserir áudio no ponto do cursor">
        <Music size={16} /> {busy === "aud" ? "Enviando..." : "Áudio"}
      </button>
      <input ref={imgInput} type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => upload(e.target.files?.[0], "images")} />
      <input ref={audInput} type="file" hidden accept="audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/mp4,audio/aac" onChange={(e) => upload(e.target.files?.[0], "audio")} />
    </div>
  );
}
