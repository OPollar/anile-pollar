"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, Home } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Atmosphere } from "@/components/Atmosphere";
import { EnterGate } from "@/components/EnterGate";
import { IntroVideo } from "@/components/IntroVideo";
import { LoadingGate } from "@/components/LoadingGate";
import { MasterArea } from "@/components/MasterSheet";
import { MusicPlayer } from "@/components/MusicPlayer";
import { PageBackground } from "@/components/PageBackground";
import { useRevealOnScroll } from "@/components/Reveal";
import { getExtensions } from "@/lib/editor/extensions";
import { typographyStyle } from "@/lib/fonts";
import { collectContentImages } from "@/lib/preload";
import { useStore } from "@/lib/store";
import type { Chapter, Role, Sheet } from "@/lib/types";

type Nav = { slug: string; title: string } | null;

export function ChapterView({
  chapter,
  storyTitle,
  characterName,
  prev,
  next,
  role,
  sheet,
}: {
  chapter: Chapter;
  storyTitle: string;
  characterName: string;
  prev: Nav;
  next: Nav;
  role: Role | null;
  sheet: Sheet | null;
}) {
  const entered = useStore((s) => s.entered);
  const enter = useStore((s) => s.enter);
  const [loaded, setLoaded] = useState(false);
  const [introDone, setIntroDone] = useState(!chapter.intro_video_url);
  const contentRef = useRef<HTMLDivElement>(null);

  const assets = useMemo(
    () => ({
      images: [chapter.background_url, ...collectContentImages(chapter.content)].filter(Boolean) as string[],
      audio: chapter.music_url ? [chapter.music_url] : [],
      video: chapter.intro_video_url,
    }),
    [chapter]
  );

  const extensions = useMemo(() => getExtensions(), []);
  const editor = useEditor({
    editable: false,
    content: chapter.content,
    extensions,
    immediatelyRender: false,
  });

  const phase = !loaded ? "loading" : !entered ? "gate" : !introDone ? "intro" : "read";
  const reading = phase === "read";
  useRevealOnScroll(contentRef, reading && !!editor, [editor]);

  return (
    <LoadingGate assets={assets} title={storyTitle} onReady={() => setLoaded(true)}>
      <PageBackground url={chapter.background_url} />
      <Atmosphere />

      <EnterGate show={phase === "gate"} title={storyTitle} subtitle={`${chapter.title}${chapter.subtitle ? " — " + chapter.subtitle : ""}`} onEnter={enter} />
      <IntroVideo src={chapter.intro_video_url} show={phase === "intro"} onDone={() => setIntroDone(true)} />
      <MusicPlayer src={chapter.music_url} active={reading} />
      <MasterArea sheet={sheet} characterName={characterName} role={role} />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-sm" style={{ background: "linear-gradient(to bottom, rgb(var(--bg) / 0.8), transparent)" }}>
        <Link href="/" className="flex items-center gap-2 text-sm tracking-widest text-ink/80 transition hover:text-white hover:drop-shadow-[0_0_10px_rgb(var(--glow))]">
          <Home size={16} /> {storyTitle}
        </Link>
        {!chapter.published && (
          <span className="flex items-center gap-1 rounded-full border border-yellow-400/50 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
            <Eye size={12} /> Rascunho — só o Player vê
          </span>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-40 pt-28 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={reading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <h1 className="font-display text-4xl tracking-[0.12em] text-ink md:text-6xl" style={{ textShadow: "0 0 32px rgb(var(--glow) / 0.75)" }}>
            {chapter.title}
          </h1>
          {chapter.subtitle && <p className="mt-3 text-lg tracking-[0.35em] text-accent">{chapter.subtitle.toUpperCase()}</p>}
          <motion.div
            className="mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-glow to-transparent"
            initial={{ width: 0 }}
            animate={reading ? { width: "70%" } : {}}
            transition={{ duration: 1.4, delay: 0.5 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={reading ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.35 }}
          ref={contentRef}
          className="story-content rounded-3xl border border-primary/30 bg-base/55 p-6 shadow-glowlg backdrop-blur-md md:p-12"
          style={typographyStyle(chapter.typography)}
        >
          <EditorContent editor={editor} />
        </motion.div>

        <nav className="mt-12 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link href={`/capitulo/${prev.slug}`} className="btn justify-start !rounded-2xl !py-4 text-left">
              <ArrowLeft size={18} /> <span><span className="block text-xs text-ink/50">ANTERIOR</span>{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/capitulo/${next.slug}`} className="btn btn-primary justify-end !rounded-2xl !py-4 text-right">
              <span><span className="block text-xs text-white/60">PRÓXIMO</span>{next.title}</span> <ArrowRight size={18} />
            </Link>
          ) : (
            <Link href="/" className="btn justify-end !rounded-2xl !py-4">Voltar ao início</Link>
          )}
        </nav>
      </main>
    </LoadingGate>
  );
}
