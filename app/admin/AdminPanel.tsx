"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, Plus, Save, ScrollText, Settings, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RichEditor from "@/components/RichEditor";
import { HEADING_FONTS, THEMES } from "@/lib/theme";
import type { Chapter, Sheet, Story } from "@/lib/types";

type Sb = ReturnType<typeof createClient>;
type Tab = "chapters" | "sheets" | "story";
type Notify = (m: string) => void;

const ATTRS = ["for", "des", "con", "int", "sab", "car"] as const;

export default function AdminPanel({
  initialStory,
  initialChapters,
  initialSheets,
}: {
  initialStory: Story;
  initialChapters: Chapter[];
  initialSheets: Sheet[];
}) {
  const sb = useMemo(() => createClient(), []);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chapters");
  const [msg, setMsg] = useState("");

  const notify: Notify = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 4000);
  };

  async function logout() {
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: "chapters", label: "Capítulos", icon: <BookOpen size={16} /> },
    { id: "sheets", label: "Fichas", icon: <Users size={16} /> },
    { id: "story", label: "História e visual", icon: <Settings size={16} /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-primary">Painel do Mestre</h1>
        <button className="btn" onClick={logout}><LogOut size={16} /> Sair</button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn ${tab === t.id ? "bg-primary/25" : "opacity-70"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded border border-primary/50 bg-base px-4 py-2 text-sm shadow-glow">
          {msg}
        </div>
      )}

      {tab === "chapters" && <ChaptersTab sb={sb} initial={initialChapters} notify={notify} />}
      {tab === "sheets" && <SheetsTab sb={sb} initial={initialSheets} notify={notify} />}
      {tab === "story" && <StoryTab sb={sb} initial={initialStory} notify={notify} />}
    </div>
  );
}

/* ---------------- Capítulos ---------------- */

function ChaptersTab({ sb, initial, notify }: { sb: Sb; initial: Chapter[]; notify: Notify }) {
  const [list, setList] = useState<Chapter[]>(initial);
  const [selected, setSelected] = useState<string | number | null>(initial[0]?.id ?? null);
  const current = list.find((c) => c.id === selected) ?? null;

  async function create() {
    const number = list.reduce((m, c) => Math.max(m, c.number), 0) + 1;
    const { data, error } = await sb
      .from("chapters")
      .insert({ number, title: "Novo capítulo", content: "", published: false })
      .select()
      .single();
    if (error) return notify("Erro: " + error.message);
    setList([...list, data as Chapter]);
    setSelected((data as Chapter).id);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="space-y-2">
        <button className="btn w-full" onClick={create}><Plus size={16} /> Novo capítulo</button>
        {list.map((c) => (
          <button
            key={String(c.id)}
            onClick={() => setSelected(c.id)}
            className={`card block w-full !p-3 text-left text-sm ${c.id === selected ? "border-primary" : ""}`}
          >
            <span className="text-xs text-ink/50">Cap. {c.number}{c.published ? "" : " • rascunho"}</span>
            <div className="truncate text-primary">{c.title}</div>
          </button>
        ))}
      </aside>

      {current ? (
        <ChapterEditor
          key={String(current.id)}
          sb={sb}
          chapter={current}
          notify={notify}
          onSaved={(c) => setList(list.map((x) => (x.id === c.id ? c : x)).sort((a, b) => a.number - b.number))}
          onDeleted={() => {
            const rest = list.filter((x) => x.id !== current.id);
            setList(rest);
            setSelected(rest[0]?.id ?? null);
          }}
        />
      ) : (
        <div className="card text-ink/60">Crie ou selecione um capítulo.</div>
      )}
    </div>
  );
}

function ChapterEditor({
  sb, chapter, notify, onSaved, onDeleted,
}: {
  sb: Sb; chapter: Chapter; notify: Notify; onSaved: (c: Chapter) => void; onDeleted: () => void;
}) {
  const [number, setNumber] = useState(chapter.number);
  const [title, setTitle] = useState(chapter.title);
  const [summary, setSummary] = useState(chapter.summary ?? "");
  const [cover, setCover] = useState(chapter.cover_url ?? "");
  const [music, setMusic] = useState(chapter.music_url ?? "");
  const [published, setPublished] = useState(!!chapter.published);
  const [content, setContent] = useState(chapter.content ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { data, error } = await sb
      .from("chapters")
      .update({ number, title, summary: summary || null, cover_url: cover || null, music_url: music || null, published, content })
      .eq("id", chapter.id)
      .select()
      .single();
    setBusy(false);
    if (error) return notify("Erro: " + error.message);
    onSaved(data as Chapter);
    notify("Capítulo salvo ✔");
  }

  async function remove() {
    if (!confirm(`Apagar "${chapter.title}" para sempre?`)) return;
    const { error } = await sb.from("chapters").delete().eq("id", chapter.id);
    if (error) return notify("Erro: " + error.message);
    onDeleted();
    notify("Capítulo apagado");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
        <div>
          <label className="label">Número</label>
          <input type="number" className="input" value={number} onChange={(e) => setNumber(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Título</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Resumo (aparece no card da página inicial)</label>
        <textarea className="input" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Imagem de capa (URL)</label>
          <input className="input" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Trilha sonora do capítulo (URL .mp3)</label>
          <input className="input" value={music} onChange={(e) => setMusic(e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <RichEditor value={content} onChange={setContent} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-primary" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publicado (visível para os leitores)
        </label>
        <div className="flex gap-2">
          <button className="btn-danger" onClick={remove}><Trash2 size={16} /> Apagar</button>
          <button className="btn" onClick={save} disabled={busy}><Save size={16} /> {busy ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Fichas ---------------- */

function SheetsTab({ sb, initial, notify }: { sb: Sb; initial: Sheet[]; notify: Notify }) {
  const [list, setList] = useState<Sheet[]>(initial);
  const [selected, setSelected] = useState<string | number | null>(initial[0]?.id ?? null);
  const current = list.find((s) => s.id === selected) ?? null;

  async function create() {
    const { data, error } = await sb
      .from("character_sheets")
      .insert({ name: "Novo personagem", level: 1, attributes: { for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 } })
      .select()
      .single();
    if (error) return notify("Erro: " + error.message);
    setList([...list, data as Sheet]);
    setSelected((data as Sheet).id);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="space-y-2">
        <button className="btn w-full" onClick={create}><Plus size={16} /> Nova ficha</button>
        {list.map((s) => (
          <button
            key={String(s.id)}
            onClick={() => setSelected(s.id)}
            className={`card block w-full !p-3 text-left text-sm ${s.id === selected ? "border-primary" : ""}`}
          >
            <div className="truncate text-primary">{s.name}</div>
            <span className="text-xs text-ink/50">{[s.race, s.klass].filter(Boolean).join(" • ")}</span>
          </button>
        ))}
      </aside>

      {current ? (
        <SheetEditor
          key={String(current.id)}
          sb={sb}
          sheet={current}
          notify={notify}
          onSaved={(s) => setList(list.map((x) => (x.id === s.id ? s : x)))}
          onDeleted={() => {
            const rest = list.filter((x) => x.id !== current.id);
            setList(rest);
            setSelected(rest[0]?.id ?? null);
          }}
        />
      ) : (
        <div className="card text-ink/60">Crie ou selecione uma ficha.</div>
      )}
    </div>
  );
}

function SheetEditor({
  sb, sheet, notify, onSaved, onDeleted,
}: {
  sb: Sb; sheet: Sheet; notify: Notify; onSaved: (s: Sheet) => void; onDeleted: () => void;
}) {
  const [name, setName] = useState(sheet.name);
  const [race, setRace] = useState(sheet.race ?? "");
  const [klass, setKlass] = useState(sheet.klass ?? "");
  const [level, setLevel] = useState(sheet.level ?? 1);
  const [hp, setHp] = useState(sheet.hp ?? 0);
  const [avatar, setAvatar] = useState(sheet.avatar_url ?? "");
  const [backstory, setBackstory] = useState(sheet.backstory ?? "");
  const [attrs, setAttrs] = useState<Record<string, number>>({
    for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10,
    ...((sheet.attributes as Record<string, number>) ?? {}),
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { data, error } = await sb
      .from("character_sheets")
      .update({
        name, race: race || null, klass: klass || null, level, hp,
        avatar_url: avatar || null, backstory: backstory || null, attributes: attrs,
      })
      .eq("id", sheet.id)
      .select()
      .single();
    setBusy(false);
    if (error) return notify("Erro: " + error.message);
    onSaved(data as Sheet);
    notify("Ficha salva ✔");
  }

  async function remove() {
    if (!confirm(`Apagar a ficha de "${sheet.name}"?`)) return;
    const { error } = await sb.from("character_sheets").delete().eq("id", sheet.id);
    if (error) return notify("Erro: " + error.message);
    onDeleted();
    notify("Ficha apagada");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nome</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Foto (URL)</label>
          <input className="input" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Raça</label>
          <input className="input" value={race} onChange={(e) => setRace(e.target.value)} />
        </div>
        <div>
          <label className="label">Classe</label>
          <input className="input" value={klass} onChange={(e) => setKlass(e.target.value)} />
        </div>
        <div>
          <label className="label">Nível</label>
          <input type="number" className="input" value={level} onChange={(e) => setLevel(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Pontos de vida</label>
          <input type="number" className="input" value={hp} onChange={(e) => setHp(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ATTRS.map((k) => (
          <div key={k}>
            <label className="label">{k.toUpperCase()}</label>
            <input
              type="number"
              className="input text-center"
              value={attrs[k]}
              onChange={(e) => setAttrs({ ...attrs, [k]: Number(e.target.value) || 0 })}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="label">História</label>
        <textarea className="input" rows={8} value={backstory} onChange={(e) => setBackstory(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn-danger" onClick={remove}><Trash2 size={16} /> Apagar</button>
        <button className="btn" onClick={save} disabled={busy}><Save size={16} /> {busy ? "Salvando..." : "Salvar"}</button>
      </div>
    </div>
  );
}

/* ---------------- História e visual ---------------- */

function StoryTab({ sb, initial, notify }: { sb: Sb; initial: Story; notify: Notify }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle ?? "");
  const [cover, setCover] = useState(initial.cover_url ?? "");
  const [music, setMusic] = useState(initial.music_url ?? "");
  const [theme, setTheme] = useState(initial.theme ?? "ember");
  const [font, setFont] = useState(initial.heading_font ?? "cinzel");
  const [synopsis, setSynopsis] = useState(initial.synopsis ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { error } = await sb.from("story").upsert({
      id: 1, title, subtitle: subtitle || null, cover_url: cover || null, music_url: music || null,
      theme, heading_font: font, synopsis: synopsis || null,
    });
    setBusy(false);
    if (error) return notify("Erro: " + error.message);
    notify("História salva ✔");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Título do site</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Subtítulo</label>
          <input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Imagem de fundo da capa (URL)</label>
          <input className="input" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Trilha sonora geral (URL .mp3)</label>
          <input className="input" value={music} onChange={(e) => setMusic(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Paleta de cores</label>
          <select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>
            {Object.entries(THEMES).map(([k, t]) => (
              <option key={k} value={k}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fonte dos títulos</label>
          <select className="input" value={font} onChange={(e) => setFont(e.target.value)}>
            {Object.entries(HEADING_FONTS).map(([k, f]) => (
              <option key={k} value={k}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Sinopse (HTML simples permitido, ex.: &lt;p&gt;texto&lt;/p&gt;)</label>
        <textarea className="input" rows={6} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <button className="btn" onClick={save} disabled={busy}><ScrollText size={16} /> {busy ? "Salvando..." : "Salvar"}</button>
      </div>
    </div>
  );
}
