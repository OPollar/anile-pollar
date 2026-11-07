"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Field = { id: string; label: string; type: "text"|"textarea"|"number"; value: any; style?: { icon?: string; accent?: string } };

export function MasterSheet({ open, onClose, character }: any) {
  const isMaster = true; // no painel mestre
  const [fields, setFields] = useState<Field[]>(character?.sheet?.fields || []);

  const update = (id: string, value: any) => setFields(fs => fs.map(f => f.id === id ? { ...f, value } : f));
  const save = () => fetch("/api/ficha", { method: "PUT", body: JSON.stringify({ characterId: character.id, fields }) });
  const addField = () => setFields(fs => [...fs, { id: crypto.randomUUID(), label: "Novo campo", type: "textarea", value: "", style: { icon: "✦" } }]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[150] grid place-items-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[85vh] w-[min(900px,92vw)] overflow-y-auto rounded-3xl border border-primary/50 bg-base/95 p-8
                       shadow-[0_0_60px_var(--glow)]">
            <h2 className="mb-6 text-3xl text-glow">{character?.name}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map(f => (
                <label key={f.id} className="rounded-xl border p-3" style={{ borderColor: f.style?.accent ?? "var(--primary)" }}>
                  {isMaster
                    ? <input className="mb-1 w-full bg-transparent text-sm uppercase tracking-widest text-accent"
                             value={f.label} onChange={e => setFields(fs => fs.map(x => x.id === f.id ? { ...x, label: e.target.value } : x))}/>
                    : <span className="text-sm uppercase tracking-widest text-accent">{f.style?.icon} {f.label}</span>}
                  {f.type === "textarea"
                    ? <textarea readOnly={!isMaster} value={f.value} onChange={e => update(f.id, e.target.value)}
                        className="h-28 w-full resize-none bg-transparent text-white outline-none" />
                    : <input readOnly={!isMaster} type={f.type} value={f.value} onChange={e => update(f.id, e.target.value)}
                        className="w-full bg-transparent text-white outline-none" />}
                </label>
              ))}
            </div>
            {isMaster && (
              <div className="mt-6 flex gap-3">
                <button onClick={addField} className="rounded-full border border-accent px-4 py-2">+ Campo</button>
                <button onClick={save} className="rounded-full bg-primary px-6 py-2 text-white">Salvar ficha</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
