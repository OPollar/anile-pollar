"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Plus, Save, Settings2, Trash2, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Sheet, SheetField } from "@/lib/types";

const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Botão fixo "Área do Mestre" + ficha do personagem.
 *  - Leitor: só vê (e só se o Mestre deixou a ficha pública).
 *  - Mestre logado: edita valores, nomes, ícones, cores e cria/remove campos.
 * A segurança de verdade está no banco (RLS): mesmo mexendo no navegador, leitor não consegue gravar.
 */
export function MasterArea({ sheet, characterName, isMaster }: { sheet: Sheet | null; characterName: string; isMaster: boolean }) {
  const [open, setOpen] = useState(false);
  if (!sheet && !isMaster) return null;
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
        <Zap size={16} className="text-glow" /> ÁREA DO MESTRE
      </motion.button>
      <MasterSheet open={open} onClose={() => setOpen(false)} sheet={sheet} characterName={characterName} isMaster={isMaster} />
    </>
  );
}

function MasterSheet({
  open,
  onClose,
  sheet,
  characterName,
  isMaster,
}: {
  open: boolean;
  onClose: () => void;
  sheet: Sheet | null;
  characterName: string;
  isMaster: boolean;
}) {
  const [fields, setFields] = useState<SheetField[]>(sheet?.fields || []);
  const [isPublic, setIsPublic] = useState(sheet?.public ?? true);
  const [custom, setCustom] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const patch = (id: string, p: Partial<SheetField>) => setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...p } : f)));
  const move = (i: number, d: -1 | 1) =>
    setFields((fs) => {
      const j = i + d;
      if (j < 0 || j >= fs.length) return fs;
      const c = [...fs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  const save = async () => {
    setStatus("saving");
    setError("");
    const { error } = await createClient().from("character_sheets").upsert({ id: 1, fields, public: isPublic });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] grid place-items-center bg-black/75 p-3 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="max-h-[90vh] w-[min(960px,100%)] overflow-y-auto rounded-3xl border border-primary/50 bg-base/95 p-5 shadow-glowlg md:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.4em] text-accent">FICHA DO PERSONAGEM</p>
                <h2 className="font-display text-3xl text-ink md:text-4xl" style={{ textShadow: "0 0 24px rgb(var(--glow) / 0.7)" }}>
                  {characterName}
                </h2>
              </div>
              <button onClick={onClose} aria-label="Fechar" className="rounded-full border border-white/20 p-2 text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {fields.length === 0 && <p className="text-ink/50">A ficha ainda está vazia.</p>}

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className={`rounded-2xl border bg-black/30 p-4 ${f.type === "textarea" ? "md:col-span-2" : ""}`}
                  style={{ borderColor: `${f.accent || "#7aa2ff"}99`, boxShadow: `0 0 18px ${f.accent || "#7aa2ff"}22` }}
                >
                  {isMaster && custom ? (
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                      <input
                        value={f.icon || ""}
                        onChange={(e) => patch(f.id, { icon: e.target.value })}
                        className="w-12 rounded bg-white/10 px-2 py-1 text-center"
                        aria-label="Ícone"
                        maxLength={4}
                      />
                      <input
                        value={f.label}
                        onChange={(e) => patch(f.id, { label: e.target.value })}
                        className="min-w-0 flex-1 rounded bg-white/10 px-2 py-1 uppercase tracking-widest text-ink"
                        aria-label="Nome do campo"
                      />
                      <input
                        type="color"
                        value={f.accent || "#7aa2ff"}
                        onChange={(e) => patch(f.id, { accent: e.target.value })}
                        className="h-8 w-8 cursor-pointer rounded bg-transparent"
                        aria-label="Cor do campo"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => patch(f.id, { type: e.target.value as SheetField["type"] })}
                        className="rounded bg-white/10 px-2 py-1"
                        aria-label="Tipo"
                      >
                        <option value="text" className="text-black">Texto curto</option>
                        <option value="textarea" className="text-black">Texto longo</option>
                        <option value="number" className="text-black">Número</option>
                      </select>
                      <button onClick={() => move(i, -1)} aria-label="Subir" className="rounded p-1 hover:bg-white/10"><ArrowUp size={16} /></button>
                      <button onClick={() => move(i, 1)} aria-label="Descer" className="rounded p-1 hover:bg-white/10"><ArrowDown size={16} /></button>
                      <button onClick={() => setFields((fs) => fs.filter((x) => x.id !== f.id))} aria-label="Apagar campo" className="rounded p-1 text-red-400 hover:bg-red-500/20"><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <p className="mb-2 text-xs uppercase tracking-[0.3em]" style={{ color: f.accent || "rgb(var(--accent))" }}>
                      {f.icon} {f.label}
                    </p>
                  )}

                  {f.type === "textarea" ? (
                    <textarea
                      readOnly={!isMaster}
                      value={f.value}
                      onChange={(e) => patch(f.id, { value: e.target.value })}
                      rows={4}
                      className="w-full resize-y bg-transparent text-ink outline-none placeholder:text-white/25"
                      placeholder={isMaster ? "Escreva aqui..." : "—"}
                    />
                  ) : (
                    <input
                      readOnly={!isMaster}
                      type={f.type}
                      value={f.value}
                      onChange={(e) => patch(f.id, { value: e.target.value })}
                      className="w-full bg-transparent text-lg text-ink outline-none placeholder:text-white/25"
                      placeholder={isMaster ? "Escreva aqui..." : "—"}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {isMaster && (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <button
                  onClick={() => setCustom((c) => !c)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${custom ? "border-accent bg-accent/20" : "border-white/25"}`}
                >
                  <Settings2 size={16} /> Personalizar campos
                </button>
                {custom && (
                  <button
                    onClick={() => setFields((fs) => [...fs, { id: uid(), label: "Novo campo", type: "textarea", value: "", icon: "✦", accent: "#a855f7" }])}
                    className="flex items-center gap-2 rounded-full border border-accent px-4 py-2 text-sm"
                  >
                    <Plus size={16} /> Campo
                  </button>
                )}
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
                  <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-[rgb(var(--accent))]" />
                  Leitores podem ver a ficha
                </label>
                <button
                  onClick={save}
                  disabled={status === "saving"}
                  className="ml-auto flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                >
                  <Save size={16} /> {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo ✓" : "Salvar ficha"}
                </button>
                {status === "error" && <p className="w-full text-sm text-red-400">Erro ao salvar: {error}</p>}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
