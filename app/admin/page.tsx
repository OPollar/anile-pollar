import Link from "next/link";
import { Eye, Palette } from "lucide-react";
import { getChapterList, getStory } from "@/lib/data";
import { ChapterList } from "@/components/admin/ChapterList";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminPage() {
  const [chapters, story] = await Promise.all([getChapterList(), getStory()]);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="text-xs tracking-[0.4em] text-accent">PAINEL DO PLAYER</p>
          <h1 className="font-display text-3xl">{story?.title || "Minha história"}</h1>
        </div>
        <Link href="/admin/historia" className="btn"><Palette size={16} /> História &amp; tema</Link>
        <Link href="/" className="btn"><Eye size={16} /> Ver site</Link>
        <LogoutButton />
      </header>
      <ChapterList initial={chapters} />
      <p className="mt-10 text-sm text-ink/50">
        💡 A <b>ficha do personagem</b> é editada direto no site (por você e pelo Mestre): abra qualquer capítulo e clique em <b>MINHA FICHA</b>.
      </p>
    </main>
  );
}
