"use client";
import { motion } from "framer-motion";
import { LogIn, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Atmosphere } from "@/components/Atmosphere";
import { PageBackground } from "@/components/PageBackground";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setBusy(false);
      setError(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message);
      return;
    }
    const { data: ok } = await supabase.rpc("is_master");
    if (ok !== true) {
      await supabase.auth.signOut();
      setBusy(false);
      setError("Este usuário existe, mas não está cadastrado como Mestre (tabela masters).");
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <>
      <PageBackground dim={0.3} />
      <Atmosphere />
      <main className="relative z-10 grid min-h-screen place-items-center px-4">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-sm rounded-3xl border border-primary/40 bg-base/80 p-8 shadow-glowlg backdrop-blur-md"
        >
          <div className="mb-6 flex flex-col items-center gap-2">
            <Zap size={36} className="text-glow drop-shadow-[0_0_14px_rgb(var(--glow))]" />
            <h1 className="font-display text-2xl tracking-[0.25em]">MESTRE</h1>
            <p className="text-sm text-ink/50">Acesso ao painel da história</p>
          </div>
          <label className="mb-1 block text-xs tracking-widest text-ink/60">E-MAIL</label>
          <input className="field mb-4" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="mb-1 block text-xs tracking-widest text-ink/60">SENHA</label>
          <input className="field mb-5" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}
          <button className="btn btn-primary w-full !py-3 tracking-widest" disabled={busy}>
            <LogIn size={16} /> {busy ? "ENTRANDO..." : "ENTRAR"}
          </button>
          <Link href="/" className="mt-5 block text-center text-xs text-ink/50 hover:text-ink">← voltar à história</Link>
        </motion.form>
      </main>
    </>
  );
}
