"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChapterSummary } from "@/lib/types";

export function ChapterList({ initial }: { initial: ChapterSummary[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    setError("");
    const position = items.length ? Math.max(...items.map((c) => c.position)) + 1 : 1;
    const { data, error } = await createClient()
      .from("chapters")
      .insert({ title: `Capítulo ${position}`, slug: `capitulo-${Date.now().toString(36)}`, position })
      .select("id")
      .single();
    if (error || !data) {
      setBusy(false);
      setError(error?.message || "Não foi possível criar.");
      return;
    }
    router.push(`/admin/capitulo/${data.id}`);
  };

  const togglePublish = async (c: ChapterSummary) => {
    const { error } = await createClient().from("chapters").update({ published: !c.published }).eq("id", c.id);
    if (error) return setError(error.message);
    setItems((l) => l.map((x) => (x.id === c.id ? { ...x, published: !c.published } : x)));
  };

  const remove = async (c: ChapterSummary) => {
    if (!confirm(`Apagar "${c.title}" para sempre?`)) return;
    const { error } = await createClient().from("chapters").delete().eq("id", c.id);
    if (error) return setError(error.message);
    setItems((l) => l.filter((x) => x.id !== c.id));
  };

  const move = async (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const a = items[i], b = items[j];
    const supabase = createClient();
    const r1 = await supabase.from("chapters").update({ position: b.position }).eq("id", a.id);
    const r2 = await supabase.from("chapters").update({ position: a.position }).eq("id", b.id);
    if (r1.error || r2.error) return setError((r1.error || r2.error)!.message);
    const copy = [...items];
    copy[i] = { ...b, position: a.position };
    copy[j] = { ...a, position: b.position };
    // mantém a ordem visual: troca as posições e reordena
    setItems(copy.sort((x, y) => x.position - y.position));
    router.refresh();
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl">Capítulos</h2>
        <button className="btn btn-primary" onClick={create} disabled={busy}>
          <Plus size={16} /> {busy ? "Criando..." : "Novo capítulo"}
        </button>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-ink/50">Nenhum capítulo ainda. Crie o primeiro!</p>}
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((c, i) => (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-base/70 p-4 backdrop-blur"
            >
              <div className="flex flex-col">
                <button aria-label="Subir" onClick={() => move(i, -1)} className="text-ink/40 hover:text-white"><ArrowUp size={14} /></button>
                <button aria-label="Descer" onClick={() => move(i, 1)} className="text-ink/40 hover:text-white"><ArrowDown size={14} /></button>
              </div>
              <div className="mr-auto min-w-0">
                <p className="truncate font-display text-lg">{c.title}{c.subtitle && <span className="ml-2 text-sm text-accent">· {c.subtitle}</span>}</p>
                <p className="truncate text-xs text-ink/40">/capitulo/{c.slug}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${c.published ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                {c.published ? "Publicado" : "Rascunho"}
              </span>
              <button className="btn" onClick={() => togglePublish(c)} title={c.published ? "Despublicar" : "Publicar"}>
                {c.published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <Link className="btn" href={`/capitulo/${c.slug}`} target="_blank">Ver</Link>
              <Link className="btn btn-primary" href={`/admin/capitulo/${c.id}`}><Pencil size={15} /> Editar</Link>
              <button className="btn btn-danger" onClick={() => remove(c)} aria-label="Apagar"><Trash2 size={15} /></button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
