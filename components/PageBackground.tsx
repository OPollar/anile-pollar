/** Imagem de fundo (com zoom lento "Ken Burns") ou, sem imagem, um degradê com a cor do tema. */
export function PageBackground({ url, dim = 0.55 }: { url?: string | null; dim?: number }) {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-base">
      {url ? (
        <div
          className="absolute inset-[-4%] animate-kenburns bg-cover bg-center"
          style={{ backgroundImage: `url("${url}")` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 45% at 50% 0%, rgb(var(--primary) / 0.38), transparent 70%)," +
              "radial-gradient(50% 40% at 85% 90%, rgb(var(--accent) / 0.22), transparent 70%)",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgb(var(--bg) / ${dim}), rgb(var(--bg) / ${Math.min(dim + 0.25, 0.95)}))`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgb(var(--bg) / 0.85) 100%)" }}
      />
    </div>
  );
}
