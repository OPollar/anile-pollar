import FadeIn from "@/components/FadeIn";
import { getSheets } from "@/lib/data";

export const dynamic = "force-dynamic";

const ATTRS: [string, string][] = [
  ["for", "FOR"], ["des", "DES"], ["con", "CON"], ["int", "INT"], ["sab", "SAB"], ["car", "CAR"],
];

export default async function Characters() {
  const sheets = await getSheets();
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl text-primary">Personagens</h1>
      {sheets.length === 0 ? (
        <p className="text-ink/60">Nenhuma ficha cadastrada ainda.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sheets.map((s, i) => (
            <FadeIn key={String(s.id)} delay={Math.min(i, 6) * 0.05}>
              <div className="card h-full">
                <div className="flex gap-4">
                  {s.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.avatar_url} alt={s.name} className="h-20 w-20 rounded-full border border-primary/40 object-cover" />
                  )}
                  <div>
                    <h2 className="font-display text-xl text-primary">{s.name}</h2>
                    <p className="text-sm text-ink/70">
                      {[s.race, s.klass].filter(Boolean).join(" • ")}
                      {s.level ? ` — nível ${s.level}` : ""}
                    </p>
                    {s.hp != null && <p className="text-sm text-accent">PV {s.hp}</p>}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-6 gap-2 text-center">
                  {ATTRS.map(([k, label]) => (
                    <div key={k} className="rounded border border-primary/20 py-1">
                      <div className="text-[10px] tracking-widest text-ink/50">{label}</div>
                      <div className="text-lg text-primary">{(s.attributes as Record<string, number> | null)?.[k] ?? "–"}</div>
                    </div>
                  ))}
                </div>
                {s.backstory && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/80">{s.backstory}</p>}
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
