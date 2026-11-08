import Link from "next/link";
import { notFound } from "next/navigation";
import MusicOverride from "@/components/MusicOverride";
import { getChapter, getChapters } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ChapterPage({ params }: { params: { id: string } }) {
  const n = Number(params.id);
  if (!Number.isInteger(n)) notFound();

  const [chapter, all] = await Promise.all([getChapter(n), getChapters()]);
  if (!chapter) notFound();

  const idx = all.findIndex((c) => c.number === n);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <MusicOverride src={chapter.music_url} />
      <p className="text-xs uppercase tracking-widest text-ink/50">Capítulo {chapter.number}</p>
      <h1 className="mt-1 font-display text-4xl text-primary" style={{ textShadow: "0 0 30px rgb(var(--glow) / 0.35)" }}>
        {chapter.title}
      </h1>
      {chapter.published === false && (
        <p className="mt-3 rounded border border-accent/50 px-3 py-1 text-sm text-accent">Rascunho — só o Mestre vê isto.</p>
      )}
      {chapter.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={chapter.cover_url} alt="" className="mt-6 w-full rounded-lg border border-primary/20 object-cover" />
      )}
      <div className="chapter-body mt-8" dangerouslySetInnerHTML={{ __html: chapter.content ?? "" }} />

      <nav className="mt-14 flex items-center justify-between border-t border-primary/20 pt-6 text-sm">
        {prev ? <Link href={`/capitulo/${prev.number}`} className="btn">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/capitulo/${next.number}`} className="btn">{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
