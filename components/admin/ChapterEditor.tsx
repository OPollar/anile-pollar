"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import { ArrowLeft, Eye, Save } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageBackground } from "@/components/PageBackground";
import { getExtensions } from "@/lib/editor/extensions";
import { DEFAULT_TYPOGRAPHY, FONTS, typographyStyle } from "@/lib/fonts";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/upload";
import type { Chapter, Typography } from "@/lib/types";
import { MediaField } from "./MediaField";
import { Toolbar } from "./Toolbar";

export function ChapterEditor({ chapter }: { chapter: Chapter }) {
  const [title, setTitle] = useState(chapter.title);
  const [subtitle, setSubtitle] = useState(chapter.subtitle || "");
  const [slug, setSlug] = useState(chapter.slug);
  const [published, setPublished] = useState(chapter.published);
  const [bg, setBg] = useState(chapter.background_url);
  const [music, setMusic] = useState(chapter.music_url);
  const [video, setVideo] = useState(chapter.intro_video_url);
  const [typo, setTypo] = useState<Typography>({ ...DEFAULT_TYPOGRAPHY, ...chapter.typography });
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const slugTouched = useRef(false);

  const extensions = useMemo(() => getExtensions({ placeholder: "Escreva a sua história aqui..." }), []);
  const editor = useEditor({
    extensions,
    content: chapter.content,
    immediatelyRender: false,
    onUpdate: () => setDirty(true),
  });

  // Marca "alterado" em qualquer campo do formulário
  const mark = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setDirty(true);
  };

  const save = useCallback(async () => {
    if (!editor) return;
    setStatus("saving");
    setError("");
    const finalSlug = slugify(slug || title);
    const { error } = await createClient()
      .from("chapters")
      .update({
        title: title.trim() || "Sem título",
        subtitle: subtitle.trim() || null,
        slug: finalSlug,
        content: editor.getJSON(),
        background_url: bg,
        music_url: music,
        intro_video_url: video,
        typography: typo,
        published,
      })
      .eq("id", chapter.id);
    if (error) {
      setStatus("error");
      setError(/duplicate|unique/i.test(error.message) ? "Já existe outro capítulo com esse endereço (slug). Mude o slug." : error.message);
      return;
    }
    setSlug(finalSlug);
    setDirty(false);
    setStatus("saved");
    setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2500);
  }, [editor, slug, title, subtitle, bg, music, video, typo, published, chapter.id]);

  // Ctrl/Cmd+S salva
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  // Avisa antes de sair com alterações não salvas
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setT = <K extends keyof Typography>(k: K, v: Typography[K]) => {
    setTypo((t) => ({ ...t, [k]: v }));
    setDirty(true);
  };

  return (
    <>
      <PageBackground url={bg} dim={0.5} />
      <header className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-white/10 bg-base/90 px-4 py-2.5 backdrop-blur">
        <Link href="/admin" className="btn !px-3" onClick={(e) => dirty && !confirm("Você tem alterações não salvas. Sair mesmo assim?") && e.preventDefault()}>
          <ArrowLeft size={16} /> Painel
        </Link>
        <span className="mr-auto text-sm text-ink/60">
          {status === "saving" ? "Salvando..." : status === "saved" ? "✓ Salvo" : dirty ? "● Alterações não salvas" : "Tudo salvo"}
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => mark(setPublished)(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
          Publicado
        </label>
        <Link href={`/capitulo/${chapter.slug}`} target="_blank" className="btn"><Eye size={16} /> Ver no site</Link>
        <button className="btn btn-primary" onClick={save} disabled={status === "saving"}>
          <Save size={16} /> Salvar
        </button>
      </header>

      {error && <p className="mx-4 mt-3 rounded-lg bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field font-display text-lg" placeholder="Título (ex.: Capítulo 1)" value={title} onChange={(e) => { mark(setTitle)(e.target.value); if (!slugTouched.current && !published) setSlug(slugify(e.target.value)); }} />
            <input className="field" placeholder="Subtítulo (ex.: o início)" value={subtitle} onChange={(e) => mark(setSubtitle)(e.target.value)} />
          </div>

          {editor && <Toolbar editor={editor} onError={setError} />}

          <div
            className="story-content min-h-[60vh] rounded-3xl border border-primary/30 bg-base/55 p-6 shadow-glowlg backdrop-blur-md md:p-10"
            style={typographyStyle(typo)}
          >
            <EditorContent editor={editor} />
          </div>
          <p className="text-center text-xs text-ink/40">Isto é uma prévia fiel: é assim que o leitor verá o texto. Clique numa imagem para escolher o efeito.</p>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-[70px] lg:max-h-[calc(100vh-90px)] lg:overflow-y-auto lg:pr-1">
          <Panel title="Endereço (slug)">
            <input className="field" value={slug} onChange={(e) => { slugTouched.current = true; mark(setSlug)(e.target.value); }} />
            <p className="mt-1 text-xs text-ink/40">/capitulo/{slugify(slug || title)}</p>
          </Panel>

          <Panel title="Fundo da página">
            <MediaField label="Imagem de fundo" kind="images" value={bg} onChange={mark(setBg)} />
          </Panel>

          <Panel title="Trilha sonora (MP3)">
            <MediaField label="Música do capítulo" hint="Toca em loop, com player e volume para o leitor." kind="audio" value={music} onChange={mark(setMusic)} />
          </Panel>

          <Panel title="Vídeo de abertura">
            <MediaField label="Vídeo em tela cheia (opcional)" hint="MP4 até 50 MB. O leitor vê o botão “Pular”." kind="video" value={video} onChange={mark(setVideo)} />
          </Panel>

          <Panel title="Texto do capítulo">
            <label className="mb-1 block text-xs text-ink/60">Fonte padrão</label>
            <select className="field mb-3" value={typo.fontFamily} onChange={(e) => setT("fontFamily", e.target.value)}>
              {FONTS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
            <label className="mb-1 block text-xs text-ink/60">Tamanho: {typo.fontSize}px</label>
            <input type="range" min={14} max={30} value={typo.fontSize} onChange={(e) => setT("fontSize", +e.target.value)} className="mb-3 w-full accent-[rgb(var(--accent))]" />
            <label className="mb-1 block text-xs text-ink/60">Espaçamento entre linhas: {typo.lineHeight.toFixed(1)}</label>
            <input type="range" min={1.2} max={2.6} step={0.1} value={typo.lineHeight} onChange={(e) => setT("lineHeight", +e.target.value)} className="mb-3 w-full accent-[rgb(var(--accent))]" />
            <label className="flex items-center gap-3 text-xs text-ink/60">
              Cor do texto
              <input type="color" value={typo.color} onChange={(e) => setT("color", e.target.value)} className="h-8 w-12 cursor-pointer rounded bg-transparent" />
            </label>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-primary/30 bg-base/75 p-4 backdrop-blur">
      <h3 className="mb-3 font-display text-sm tracking-[0.2em] text-accent">{title.toUpperCase()}</h3>
      {children}
    </section>
  );
}
