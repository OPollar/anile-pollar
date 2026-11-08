import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { getChapters, getStory } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [story, chapters] = await Promise.all([getStory(), getChapters()]);

  return (
    <>
      <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden text-center">
        {story.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.cover_url} alt="" className="absolute inset-0 -z-20 h-full w-full animate-kenburns object-cover opacity-60" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-base/30 via-base/60 to-base" />
        <FadeIn className="px-6">
          <h1
            className="font-display text-5xl text-primary md:text-7xl"
            style={{ textShadow: "0 0 40px rgb(var(--glow) / 0.5)" }}
          >
            {story.title}
          </h1>
          {story.subtitle && <p className="mt-4 text-lg italic text-ink/80 md:text-xl">{story.subtitle}</p>}
          {chapters.length > 0 && (
            <Link href={`/capitulo/${chapters[0].number}`} className="btn mt-8 animate-pulseGlow">
              Começar a ler
            </Link>
          )}
        </FadeIn>
      </section>

      {story.synopsis && (
        <section className="mx-auto max-w-3xl px-6 py-12">
          <FadeIn>
            <div className="chapter-body" dangerouslySetInnerHTML={{ __html: story.synopsis }} />
          </FadeIn>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-6 font-display text-2xl text-primary">Capítulos</h2>
        {chapters.length === 0 ? (
          <p className="text-ink/60">Nenhum capítulo publicado ainda.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {chapters.map((c, i) => (
              <FadeIn key={String(c.id)} delay={Math.min(i, 6) * 0.05}>
                <Link href={`/capitulo/${c.number}`} className="card block h-full transition hover:border-primary/60 hover:shadow-glow">
                  <span className="text-xs uppercase tracking-widest text-ink/50">Capítulo {c.number}</span>
                  <h3 className="mt-1 font-display text-xl text-primary">{c.title}</h3>
                  {c.summary && <p className="mt-2 line-clamp-3 text-sm text-ink/70">{c.summary}</p>}
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
