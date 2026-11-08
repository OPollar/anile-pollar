"use client";
import { motion } from "framer-motion";
import { Lock, Play, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Atmosphere } from "@/components/Atmosphere";
import { EnterGate } from "@/components/EnterGate";
import { LoadingGate } from "@/components/LoadingGate";
import { MasterArea } from "@/components/MasterSheet";
import { PageBackground } from "@/components/PageBackground";
import { useStore } from "@/lib/store";
import type { ChapterSummary, Sheet, Story } from "@/lib/types";

export function HomeView({
  configured,
  story,
  chapters,
  isMaster,
  sheet,
}: {
  configured: boolean;
  story: Story | null;
  chapters: ChapterSummary[];
  isMaster: boolean;
  sheet: Sheet | null;
}) {
  const entered = useStore((s) => s.entered);
  const enter = useStore((s) => s.enter);
  const [loaded, setLoaded] = useState(false);
  const title = story?.title || "Anile Pollar";
  const first = chapters.find((c) => c.published) || chapters[0];

  return (
    <LoadingGate assets={{ images: story?.home_background_url ? [story.home_background_url] : [] }} title={title} onReady={() => setLoaded(true)}>
      <PageBackground url={story?.home_background_url} dim={0.35} />
      <Atmosphere />
      <EnterGate show={loaded && !entered} title={title} subtitle={story?.tagline} onEnter={enter} />
      <MasterArea sheet={sheet} characterName={story?.character_name || "Personagem"} isMaster={isMaster} />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-24 text-center">
        {!configured && (
          <div className="mb-8 max-w-lg rounded-2xl border border-yellow-400/50 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            ⚠️ O site ainda não está ligado ao Supabase. Defina <b>NEXT_PUBLIC_SUPABASE_URL</b> e <b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b> no Render e faça um novo deploy.
          </div>
        )}
        {configured && !story && (
          <div className="mb-8 max-w-lg rounded-2xl border border-yellow-400/50 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            ⚠️ Não consegui ler a história no banco. Rodou o arquivo <b>supabase/schema.sql</b> no SQL Editor?
          </div>
        )}

        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={loaded ? { opacity: 1, letterSpacing: "0.5em" } : {}}
          transition={{ duration: 1.6 }}
          className="text-xs text-accent"
        >
          {(story?.character_name || "").toUpperCase()}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={loaded ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.3, delay: 0.2 }}
          className="mt-4 font-display text-5xl tracking-[0.1em] text-ink md:text-8xl"
          style={{ textShadow: "0 0 40px rgb(var(--glow) / 0.8), 0 0 90px rgb(var(--primary) / 0.6)" }}
        >
          {title}
        </motion.h1>

        {story?.tagline && (
          <motion.p initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}} transition={{ delay: 0.9, duration: 1 }} className="mt-6 max-w-xl text-lg text-ink/70">
            {story.tagline}
          </motion.p>
        )}

        {first && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.3 }}>
            <Link href={`/capitulo/${first.slug}`} className="btn btn-primary mt-10 !px-8 !py-3 text-lg tracking-[0.2em] shadow-glow animate-pulseGlow">
              <Play size={18} /> COMEÇAR A LER
            </Link>
          </motion.div>
        )}

        {chapters.length > 0 && (
          <motion.ul
            initial="hidden"
            animate={loaded ? "show" : "hidden"}
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 1.6 } } }}
            className="mt-16 grid w-full gap-3 text-left sm:grid-cols-2"
          >
            {chapters.map((c) => (
              <motion.li
                key={c.id}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Link
                  href={`/capitulo/${c.slug}`}
                  className="block rounded-2xl border border-primary/30 bg-base/60 p-5 backdrop-blur-md transition hover:border-glow hover:shadow-glow"
                >
                  <p className="font-display text-xl text-ink">{c.title}</p>
                  {c.subtitle && <p className="mt-1 text-sm tracking-widest text-accent">{c.subtitle}</p>}
                  {!c.published && <p className="mt-2 text-xs text-yellow-300">Rascunho (só você vê)</p>}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </main>

      <footer className="fixed left-4 top-4 z-40">
        <Link
          href={isMaster ? "/admin" : "/login"}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs tracking-widest text-ink/60 backdrop-blur transition hover:border-glow hover:text-white"
        >
          {isMaster ? <Settings size={13} /> : <Lock size={13} />} {isMaster ? "PAINEL" : "MESTRE"}
        </Link>
      </footer>
    </LoadingGate>
  );
}
