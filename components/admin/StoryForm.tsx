"use client";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageBackground } from "@/components/PageBackground";
import { applyThemeToDocument, THEME_PRESETS } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import type { Story, Theme } from "@/lib/types";
import { MediaField } from "./MediaField";

const COLOR_LABELS: { key: keyof Theme; label: string; hint: string }[] = [
  { key: "primary", label: "Cor principal", hint: "botões e bordas" },
  { key: "accent", label: "Cor de destaque", hint: "detalhes e brilhos" },
  { key: "glow", label: "Cor do brilho / raios", hint: "raios e partículas" },
  { key: "bg", label: "Cor de fundo", hint: "fundo escuro" },
  { key: "ink", label: "Cor do texto", hint: "texto geral" },
];

export function StoryForm({ story }: { story: Story }) {
  const router = useRouter();
  const [title, setTitle] = useState(story.title);
  const [tagline, setTagline] = useState(story.tagline || "");
  const [name, setName] = useState(story.character_name);
  const [bg, setBg] = useState(story.home_background_url);
  const [theme, setTheme] = useState<Theme>(story.theme);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  // Prévia ao vivo: o site inteiro já muda de cor enquanto você escolhe.
  useEffect(() => applyThemeToDocument(theme), [theme]);

  const save = async () => {
    setStatus("saving");
    setError("");
    const { error } = await createClient()
      .from("story")
      .update({ title: title.trim(), tagline: tagline.trim() || null, character_name: name.trim(), theme, home_background_url: bg })
      .eq("id", 1);
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <>
      <PageBackground url={bg} dim={0.5} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 flex items-center gap-3">
          <Link href="/admin" className="btn !px-3"><ArrowLeft size={16} /> Painel</Link>
          <h1 className="mr-auto font-display text-2xl">História &amp; tema</h1>
          <button className="btn btn-primary" onClick={save} disabled={status === "saving"}>
            <Save size={16} /> {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo ✓" : "Salvar"}
          </button>
        </header>
        {error && <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}

        <section className="mb-6 space-y-4 rounded-2xl border border-primary/30 bg-base/75 p-5 backdrop-blur">
          <div>
            <label className="mb-1 block text-xs tracking-widest text-ink/60">TÍTULO DA HISTÓRIA</label>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest text-ink/60">FRASE DE EFEITO</label>
            <input className="field" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest text-ink/60">NOME DO PERSONAGEM PRINCIPAL</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <MediaField label="Fundo da página inicial" kind="images" value={bg} onChange={setBg} />
        </section>

        <section className="rounded-2xl border border-primary/30 bg-base/75 p-5 backdrop-blur">
          <h2 className="mb-1 font-display text-lg">Tema do personagem</h2>
          <p className="mb-4 text-sm text-ink/50">As cores do site inteiro (raios, botões, brilhos) seguem estas escolhas.</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {THEME_PRESETS.map((p) => (
              <button key={p.name} className="btn !px-3 !py-1.5 text-xs" onClick={() => setTheme(p.theme)}>
                <span className="h-3 w-3 rounded-full" style={{ background: p.theme.primary }} />
                <span className="h-3 w-3 rounded-full" style={{ background: p.theme.accent }} />
                {p.name}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {COLOR_LABELS.map(({ key, label, hint }) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
                <input type="color" value={theme[key]} onChange={(e) => setTheme({ ...theme, [key]: e.target.value })} className="h-10 w-14 cursor-pointer rounded bg-transparent" />
                <span><span className="block text-sm">{label}</span><span className="text-xs text-ink/40">{hint}</span></span>
              </label>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
