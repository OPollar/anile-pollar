import { prisma } from "@/lib/prisma";
import { ChapterView } from "./ChapterView"; // ou o componente que renderiza o capítulo
import { ThemeProvider } from "@/components/ThemeProvider";

export default async function Page({ params }: { params: { slug: string } }) {
  // Busca o capítulo e o personagem associado no Supabase
  const chapter = await prisma.chapter.findUnique({
    where: { slug: params.slug },
    include: { story: { include: { character: true } } },
  });

  if (!chapter) {
    return (
      <div className="grid min-h-screen place-items-center bg-black text-white">
        <h1 className="text-2xl">Capítulo não encontrado ou ainda não publicado.</h1>
      </div>
    );
  }

  const character = chapter.story.character;

  return (
    <ThemeProvider theme={character.theme as Record<string, string>}>
      <main className="min-h-screen bg-base text-white relative selection:bg-accent selection:text-white">
        {/* Aqui entra a visão do capítulo com todas as animações */}
        <div className="p-8 text-center">
          <h1 className="text-5xl font-bold mb-4">{chapter.title}</h1>
          <p className="text-xl text-white/70 mb-8">{chapter.subtitle}</p>
          <div className="max-w-2xl mx-auto text-left bg-black/40 p-6 rounded-2xl border border-primary/30">
            {/* Renderização simples do conteúdo JSON do Tiptap */}
            <p className="italic text-white/60">Conteúdo carregado dinamicamente do banco de dados do Supabase.</p>
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}
