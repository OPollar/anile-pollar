import Link from "next/link";

export default function SiteHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary/20 bg-base/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="font-display text-lg tracking-wider text-primary">
          {title}
        </Link>
        <nav className="flex gap-5 text-sm text-ink/80">
          <Link href="/" className="hover:text-primary">Início</Link>
          <Link href="/personagens" className="hover:text-primary">Personagens</Link>
          <Link href="/admin" className="text-ink/50 hover:text-primary">Mestre</Link>
        </nav>
      </div>
    </header>
  );
}
