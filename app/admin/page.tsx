import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStory } from "@/lib/data";
import type { Chapter, Sheet } from "@/lib/types";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: master } = await sb.from("masters").select("id").eq("id", user.id).maybeSingle();
  if (!master) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="card">
          <h1 className="font-display text-2xl text-primary">Conta sem permissão</h1>
          <p className="mt-3 text-sm text-ink/80">
            Você entrou, mas esta conta ainda não está na tabela <code>masters</code>. No Supabase, abra o SQL Editor e rode:
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-3 text-xs">
{`insert into public.masters (id, name)
values ('${user.id}', 'Mestre');`}
          </pre>
        </div>
      </div>
    );
  }

  const [story, chapters, sheets] = await Promise.all([
    getStory(),
    sb.from("chapters").select("*").order("number", { ascending: true }),
    sb.from("character_sheets").select("*").order("name", { ascending: true }),
  ]);

  return (
    <AdminPanel
      initialStory={story}
      initialChapters={(chapters.data ?? []) as Chapter[]}
      initialSheets={(sheets.data ?? []) as Sheet[]}
    />
  );
}
