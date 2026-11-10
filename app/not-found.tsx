import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-6xl text-glow">404</p>
        <p className="mt-3 text-ink/70">Esta página se perdeu na tempestade.</p>
        <Link href="/" className="btn mt-6">← Voltar ao início</Link>
      </div>
    </main>
  );
}
