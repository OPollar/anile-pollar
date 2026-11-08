export type Assets = {
  images?: string[];
  audio?: string[];
  video?: string | null;
};

const timeout = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function loadImage(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });
}

function loadMedia(url: string, tag: "audio" | "video", event: string) {
  return new Promise<void>((resolve) => {
    const el = document.createElement(tag);
    el.preload = "auto";
    el.addEventListener(event, () => resolve(), { once: true });
    el.addEventListener("error", () => resolve(), { once: true });
    el.src = url;
    el.load();
  });
}

/**
 * Pré-carrega tudo e relata o progresso (0..1).
 * Cada recurso tem um tempo-limite: se algo travar (ex.: iOS não pré-carrega mídia),
 * o site NÃO fica preso na tela de carregamento.
 */
export async function preloadAll(assets: Assets, onProgress: (p: number) => void) {
  const tasks: Promise<unknown>[] = [];
  const unique = (l?: string[]) => Array.from(new Set((l || []).filter(Boolean)));

  unique(assets.images).forEach((u) => tasks.push(Promise.race([loadImage(u), timeout(12000)])));
  unique(assets.audio).forEach((u) => tasks.push(Promise.race([loadMedia(u, "audio", "canplaythrough"), timeout(6000)])));
  if (assets.video) tasks.push(Promise.race([loadMedia(assets.video, "video", "canplay"), timeout(6000)]));

  if (tasks.length === 0) {
    onProgress(1);
    return;
  }
  let done = 0;
  await Promise.all(tasks.map((t) => t.finally(() => onProgress(++done / tasks.length))));
}

/** Percorre o JSON do Tiptap e devolve as imagens usadas no texto. */
export function collectContentImages(doc: any): string[] {
  const out: string[] = [];
  const walk = (n: any) => {
    if (!n) return;
    if (n.type === "livingImage" && n.attrs?.src) out.push(n.attrs.src);
    (n.content || []).forEach(walk);
  };
  walk(doc);
  return out;
}
