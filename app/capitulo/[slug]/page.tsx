import { notFound } from "next/navigation";
import { getChapterBySlug, getChapterList, getIsMaster, getSheet, getStory } from "@/lib/data";
import { ChapterView } from "./ChapterView";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ch = await getChapterBySlug(params.slug).catch(() => null);
  return { title: ch ? `${ch.title}${ch.subtitle ? " — " + ch.subtitle : ""}` : "Capítulo" };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const [chapter, story, list, isMaster, sheet] = await Promise.all([
    getChapterBySlug(params.slug),
    getStory(),
    getChapterList(),
    getIsMaster(),
    getSheet(),
  ]);
  if (!chapter) notFound();

  const published = list.filter((c) => c.published);
  const idx = published.findIndex((c) => c.id === chapter.id);
  const prev = idx > 0 ? published[idx - 1] : null;
  const next = idx >= 0 && idx < published.length - 1 ? published[idx + 1] : null;

  return (
    <ChapterView
      chapter={chapter}
      storyTitle={story?.title || "Anile Pollar"}
      characterName={story?.character_name || "Personagem"}
      prev={prev ? { slug: prev.slug, title: prev.title } : null}
      next={next ? { slug: next.slug, title: next.title } : null}
      isMaster={isMaster}
      sheet={sheet}
    />
  );
}
