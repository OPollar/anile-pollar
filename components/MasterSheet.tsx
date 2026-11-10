"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ImagePlus, Minus, Plus, Settings2, Trash2, X, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Atmosphere } from "./Atmosphere";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SHEET, uid } from "@/lib/sheet";
import { uploadMedia } from "@/lib/upload";
import type { Role, Sheet, SheetField, SheetFieldType, SheetSection } from "@/lib/types";

/** Borda "rasgada" do pergaminho (fixa, sem aleatoriedade a cada render). */
const RAGGED = (() => {
  let seed = 11;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const n = 36;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(2)}% ${(r() * 1.1).toFixed(2)}%`);
  for (let i = 1; i <= n; i++) pts.push(`${(100 - r() * 0.8).toFixed(2)}% ${((i / n) * 100).toFixed(2)}%`);
  for (let i = n - 1; i >= 0; i--) pts.push(`${((i / n) * 100).toFixed(2)}% ${(100 - r() * 1.1).toFixed(2)}%`);
  for (let i = n - 1; i > 0; i--) pts.push(`${(r() * 0.8).toFixed(2)}% ${((i / n) * 100).toFixed(2)}%`);
  return `polygon(${pts.join(",")})`;
})();

const INK = "#6b3a14";

/**
 * Botão fixo + ficha do personagem.
 *  - Player: "MINHA FICHA"      - Mestre: "ÁREA DO MESTRE"   (ambos editam)
 *  - Visitante sem login: nada aparece.
 * A segurança real está no banco (RLS): sem papel, não lê nem grava.
 */
export function MasterArea({ sheet, characterName, role }: { sheet: Sheet | null; characterName: string; role: Role | null }) {
  const [open, setOpen] = useState(false);
  if (!role) return null;
  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-accent/70 bg-black/60 px-5 py-3 text-sm tracking-[0.25em] text-white backdrop-blur-md animate-pulseGlow"
      >
        <Zap size={16} className="text-glow" /> {role === "master" ? "ÁREA DO MESTRE" : "MINHA FICHA"}
      </motion.button>
      <SheetModal open={open} onClose={() => setOpen(false)} initial={sheet ?? DEFAULT_SHEET} characterName={characterName} />
    </>
  );
}

type Status = "idle" | "saving" | "saved" | "error";

function SheetModal({ open, onClose, initial, characterName }: { open: boolean; onClose: () => void; initial: Sheet; characterName: string }) {
  const [sheet, setSheet] = useState<Sheet>(() => ({ ...initial, name: initial.name || characterName }));
  const [custom, setCustom] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [portraitBusy, setPortraitBusy] = useState(false);
  const sheetRef = useRef(sheet);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const fileInput = useRef<HTMLInputElement>(null);

  const flush = useCallback(async () => {
    if (!dirty.current) return;
    dirty.current = false;
    setStatus("saving");
    const { error } = await createClient().from("character_sheets").upsert({ id: 1, data: sheetRef.current });
    if (error) {
      dirty.current = true;
      setStatus("error");
      setError(error.message);
    } else {
      setError("");
      setStatus("saved");
    }
  }, []);

  /** Toda alteração passa por aqui e é salva sozinha ~1s depois de parar de digitar. */
  const edit = useCallback(
    (fn: (s: Sheet) => Sheet) => {
      const next = fn(sheetRef.current);
      sheetRef.current = next;
      setSheet(next);
      dirty.current = true;
      setStatus("idle");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 1000);
    },
    [flush]
  );

  const close = useCallback(() => {
    clearTimeout(timer.current);
    flush();
    onClose();
  }, [flush, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => void flush(), [flush]);

  const patchSection = (sid: string, p: Partial<SheetSection>) =>
    edit((s) => ({ ...s, sections: s.sections.map((x) => (x.id === sid ? { ...x, ...p } : x)) }));
  const patchField = (sid: string, fid: string, p: Partial<SheetField>) =>
    edit((s) => ({
      ...s,
      sections: s.sections.map((x) => (x.id === sid ? { ...x, fields: x.fields.map((f) => (f.id === fid ? { ...f, ...p } : f)) } : x)),
    }));
  const move = <T,>(list: T[], i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return list;
    const c = [...list];
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  };

  const pickPortrait = async (file?: File) => {
    if (!file) return;
    setPortraitBusy(true);
    setError("");
    try {
      const url = await uploadMedia(file, "images", { folder: "sheet", maxDim: 1200 });
      edit((s) => ({ ...s, portrait_url: url }));
    } catch (e: any) {
      setError(e.message || "Falha ao enviar o retrato.");
    } finally {
      setPortraitBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const statusText = status === "saving" ? "gravando…" : status === "saved" ? "✓ salvo" : status === "error" ? "erro ao salvar" : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] grid place-items-center bg-black/70 p-2 backdrop-blur-[3px] sm:p-4"
          style={{ perspective: 1600 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          {/* fumaça atrás do pergaminho */}
          <Atmosphere lightning={false} density={22} z={1} />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, rotateX: 28, y: 70, scale: 0.88 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, rotateX: -12, y: 40, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 130, damping: 20 }}
            className="relative z-[2] w-[min(1040px,100%)]"
            style={{ filter: "drop-shadow(0 28px 50px rgba(0,0,0,0.8))", transformOrigin: "50% 100%" }}
          >
            <div className="parchment" style={{ clipPath: RAGGED }}>
              {/* moldura dupla e ornamentos de canto */}
              <div aria-hidden className="pointer-events-none absolute inset-3 z-10 border-[3px] border-double" style={{ borderColor: "rgba(90,55,20,0.65)" }}>
                {["left-0 top-0 -translate-x-1/2 -translate-y-1/2", "right-0 top-0 translate-x-1/2 -translate-y-1/2", "left-0 bottom-0 -translate-x-1/2 translate-y-1/2", "right-0 bottom-0 translate-x-1/2 translate-y-1/2"].map((c) => (
                  <span key={c} className={`absolute ${c} text-xl leading-none`} style={{ color: INK }}>
                    ❖
                  </span>
                ))}
              </div>

              <div className="relative max-h-[90vh] overflow-y-auto px-6 pb-10 pt-8 md:px-14 md:pt-11">
                {/* barra de controles */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <button onClick={() => setCustom((c) => !c)} className={`ink-btn ${custom ? "on" : ""}`}>
                    <Settings2 size={14} /> {custom ? "Terminar de personalizar" : "Personalizar ficha"}
                  </button>
                  {custom && (
                    <button
                      onClick={() =>
                        edit((s) => ({
                          ...s,
                          sections: [...s.sections, { id: uid(), title: "Nova seção", icon: "✦", fields: [{ id: uid(), label: "Novo campo", type: "textarea", value: "", icon: "✦" }] }],
                        }))
                      }
                      className="ink-btn"
                    >
                      <Plus size={14} /> Seção
                    </button>
                  )}
                  <span className="ml-auto text-sm italic" style={{ color: status === "error" ? "#8b1a1a" : INK }}>
                    {statusText}
                  </span>
                  <button onClick={close} aria-label="Fechar" className="ink-btn !px-2">
                    <X size={16} />
                  </button>
                </div>
                {error && <p className="mb-4 rounded border border-[#8b1a1a]/50 bg-[#8b1a1a]/10 p-2 text-sm text-[#6b1010]">{error}</p>}

                {/* CABEÇALHO */}
                <header className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <div className="relative shrink-0">
                    <div className="relative h-[210px] w-[160px] overflow-hidden rounded-[3px] border-[5px] border-double bg-[#d9c28b]/70" style={{ borderColor: "#6b3a14", boxShadow: "inset 0 0 20px rgba(60,30,5,.6), 0 4px 10px rgba(60,30,5,.4)" }}>
                      {sheet.portrait_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sheet.portrait_url} alt="Retrato" decoding="async" className="h-full w-full object-cover" style={{ filter: "sepia(0.35) contrast(1.05)" }} />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-6xl opacity-40" style={{ color: INK }}>
                          ⚔
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex justify-center gap-2">
                      <button className="ink-btn" onClick={() => fileInput.current?.click()} disabled={portraitBusy}>
                        <ImagePlus size={13} /> {portraitBusy ? "…" : sheet.portrait_url ? "Trocar" : "Retrato"}
                      </button>
                      {sheet.portrait_url && (
                        <button className="ink-btn !px-2" aria-label="Remover retrato" onClick={() => edit((s) => ({ ...s, portrait_url: null }))}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <input ref={fileInput} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => pickPortrait(e.target.files?.[0])} />
                  </div>

                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="ink-label mb-1">Ficha de personagem</p>
                    <motion.div initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}>
                      <input
                        className="ink-display w-full bg-transparent text-center text-3xl font-bold outline-none placeholder:opacity-40 sm:text-left md:text-5xl"
                        value={sheet.name ?? ""}
                        placeholder={characterName}
                        onChange={(e) => edit((s) => ({ ...s, name: e.target.value }))}
                        aria-label="Nome do personagem"
                      />
                    </motion.div>
                    <input
                      className="ink-input mt-2 text-center italic sm:text-left"
                      value={sheet.subtitle ?? ""}
                      placeholder="Classe · Nível · Origem"
                      onChange={(e) => edit((s) => ({ ...s, subtitle: e.target.value }))}
                      aria-label="Subtítulo"
                    />
                    <div className="mt-4 flex items-center gap-3" style={{ color: INK }}>
                      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #6b3a14)" }} />
                      <span>❦</span>
                      <span className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, #6b3a14)" }} />
                    </div>
                  </div>
                  <div className="wax-seal hidden shrink-0 sm:grid" aria-hidden>
                    ⚡
                  </div>
                </header>

                {/* SEÇÕES */}
                <div className="grid gap-5 md:grid-cols-2">
                  {sheet.sections.map((sec, si) => (
                    <motion.section
                      key={sec.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + Math.min(si * 0.08, 0.6), duration: 0.6 }}
                      className={`ink-card p-4 ${sec.wide ? "md:col-span-2" : ""}`}
                    >
                      {custom ? (
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <input className="ink-input !w-12 text-center" maxLength={4} value={sec.icon ?? ""} onChange={(e) => patchSection(sec.id, { icon: e.target.value })} aria-label="Ícone da seção" />
                          <input className="ink-input min-w-0 flex-1" value={sec.title} onChange={(e) => patchSection(sec.id, { title: e.target.value })} aria-label="Título da seção" />
                          <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={!!sec.wide} onChange={(e) => patchSection(sec.id, { wide: e.target.checked })} /> larga
                          </label>
                          <button className="ink-btn !px-1.5" aria-label="Subir seção" onClick={() => edit((s) => ({ ...s, sections: move(s.sections, si, -1) }))}><ArrowUp size={14} /></button>
                          <button className="ink-btn !px-1.5" aria-label="Descer seção" onClick={() => edit((s) => ({ ...s, sections: move(s.sections, si, 1) }))}><ArrowDown size={14} /></button>
                          <button
                            className="ink-btn !px-1.5"
                            aria-label="Apagar seção"
                            onClick={() => confirm(`Apagar a seção "${sec.title}" e tudo dentro dela?`) && edit((s) => ({ ...s, sections: s.sections.filter((x) => x.id !== sec.id) }))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="ink-display mb-3 flex items-center gap-2 border-b pb-2 text-lg font-bold" style={{ borderColor: "rgba(90,55,20,0.4)" }}>
                          <span aria-hidden>{sec.icon}</span> {sec.title}
                        </h3>
                      )}

                      <div className="space-y-4">
                        {sec.fields.map((f, fi) => (
                          <FieldView
                            key={f.id}
                            f={f}
                            custom={custom}
                            onChange={(p) => patchField(sec.id, f.id, p)}
                            onUp={() => patchSection(sec.id, { fields: move(sec.fields, fi, -1) })}
                            onDown={() => patchSection(sec.id, { fields: move(sec.fields, fi, 1) })}
                            onDelete={() => patchSection(sec.id, { fields: sec.fields.filter((x) => x.id !== f.id) })}
                          />
                        ))}
                      </div>

                      {custom && (
                        <button
                          className="ink-btn mt-4"
                          onClick={() => patchSection(sec.id, { fields: [...sec.fields, { id: uid(), label: "Novo campo", type: "text", value: "", icon: "✦" }] })}
                        >
                          <Plus size={14} /> Campo
                        </button>
                      )}
                    </motion.section>
                  ))}
                </div>

                <p className="mt-8 text-center text-sm italic" style={{ color: "rgba(90,55,20,0.7)" }}>
                  ✦ tudo o que você escreve aqui é guardado sozinho ✦
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const TYPE_LABELS: Record<SheetFieldType, string> = {
  text: "Texto curto",
  textarea: "Texto longo",
  number: "Número",
  bar: "Barra (atual/máx)",
  tags: "Etiquetas",
};

function FieldView({
  f,
  custom,
  onChange,
  onUp,
  onDown,
  onDelete,
}: {
  f: SheetField;
  custom: boolean;
  onChange: (p: Partial<SheetField>) => void;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  const accent = f.accent || INK;
  return (
    <div>
      {custom ? (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded border border-dashed border-[#6b3a14]/50 p-1.5">
          <input className="ink-input !w-10 text-center !text-base" maxLength={4} value={f.icon ?? ""} onChange={(e) => onChange({ icon: e.target.value })} aria-label="Ícone" />
          <input className="ink-input min-w-0 flex-1 !text-base" value={f.label} onChange={(e) => onChange({ label: e.target.value })} aria-label="Nome do campo" />
          <input type="color" value={f.accent || "#6b3a14"} onChange={(e) => onChange({ accent: e.target.value })} className="h-7 w-7 cursor-pointer bg-transparent" aria-label="Cor" />
          <select
            className="ink-select"
            value={f.type}
            aria-label="Tipo"
            onChange={(e) => {
              const type = e.target.value as SheetFieldType;
              onChange({ type, max: type === "bar" ? f.max || "10" : f.max, tags: type === "tags" ? f.tags || [] : f.tags });
            }}
          >
            {(Object.keys(TYPE_LABELS) as SheetFieldType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <button className="ink-btn !px-1.5" onClick={onUp} aria-label="Subir"><ArrowUp size={13} /></button>
          <button className="ink-btn !px-1.5" onClick={onDown} aria-label="Descer"><ArrowDown size={13} /></button>
          <button className="ink-btn !px-1.5" onClick={onDelete} aria-label="Apagar campo"><Trash2 size={13} /></button>
        </div>
      ) : (
        <p className="ink-label mb-1" style={f.accent ? { color: f.accent } : undefined}>
          <span aria-hidden>{f.icon}</span> {f.label}
        </p>
      )}

      {f.type === "textarea" && <textarea className="ink-lines" value={f.value} placeholder="Escreva aqui…" onChange={(e) => onChange({ value: e.target.value })} />}
      {(f.type === "text" || f.type === "number") && (
        <input className="ink-input" type={f.type} value={f.value} placeholder="…" onChange={(e) => onChange({ value: e.target.value })} />
      )}
      {f.type === "bar" && <BarField f={f} accent={accent} onChange={onChange} />}
      {f.type === "tags" && <TagsField f={f} accent={accent} onChange={onChange} />}
    </div>
  );
}

function BarField({ f, accent, onChange }: { f: SheetField; accent: string; onChange: (p: Partial<SheetField>) => void }) {
  const cur = parseFloat(f.value) || 0;
  const max = parseFloat(f.max || "0") || 0;
  const pct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
  const step = (d: number) => onChange({ value: String(Math.max(0, cur + d)) });
  return (
    <div>
      <div className="relative h-5 overflow-hidden rounded-[3px] border" style={{ borderColor: "rgba(60,30,5,0.8)", background: "linear-gradient(#3b2410, #5a3a1a)", boxShadow: "inset 0 2px 5px rgba(0,0,0,.6)" }}>
        <motion.div
          className="h-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 70%, white), ${accent} 55%, color-mix(in srgb, ${accent} 70%, black))`, boxShadow: `0 0 10px ${accent}` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-center gap-2">
        <button className="ink-btn !px-1.5 !py-0" onClick={() => step(-1)} aria-label="Diminuir"><Minus size={13} /></button>
        <input className="ink-input !w-14 text-center" type="number" value={f.value} onChange={(e) => onChange({ value: e.target.value })} aria-label="Valor atual" />
        <span>/</span>
        <input className="ink-input !w-14 text-center" type="number" value={f.max ?? ""} onChange={(e) => onChange({ max: e.target.value })} aria-label="Valor máximo" />
        <button className="ink-btn !px-1.5 !py-0" onClick={() => step(1)} aria-label="Aumentar"><Plus size={13} /></button>
      </div>
    </div>
  );
}

function TagsField({ f, accent, onChange }: { f: SheetField; accent: string; onChange: (p: Partial<SheetField>) => void }) {
  const tags = f.tags || [];
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().replace(/,$/, "");
    if (!t) return;
    onChange({ tags: [...tags, t] });
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {tags.map((t, i) => (
            <motion.span
              key={t + i}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="inline-flex items-center gap-1 rounded-[3px] border px-2 py-0.5 text-[1.05rem]"
              style={{ borderColor: accent, color: "#2b1608", background: `color-mix(in srgb, ${accent} 16%, transparent)` }}
            >
              {t}
              <button aria-label={`Remover ${t}`} className="opacity-60 hover:opacity-100" onClick={() => onChange({ tags: tags.filter((_, j) => j !== i) })}>
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <input
        className="ink-input mt-2"
        value={draft}
        placeholder="Digite e aperte Enter…"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}
