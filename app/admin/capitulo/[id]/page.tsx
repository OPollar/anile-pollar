import { notFound } from "next/navigation";
import { ChapterEditor } from "@/components/admin/ChapterEditor";
import { getChapterById } from "@/lib/data";

export default async function EditChapterPage({ params }: { params: { id: string } }) {
  const chapter = await getChapterById(params.id);
  if (!chapter) notFound();
  return <ChapterEditor chapter={chapter} />;
}
