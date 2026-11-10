const MB = 1024 * 1024;
/** Meta de tamanho depois de comprimir (bem abaixo do limite de 50 MB do Supabase). */
export const TARGET_BYTES = 6 * MB;
export const HARD_LIMIT_BYTES = 50 * MB;

export const fmtMB = (b: number) => (b / MB >= 0.1 ? (b / MB).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");

const toBlob = (c: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob | null>((res) => c.toBlob(res, type, q));

async function decode(file: File): Promise<{ src: CanvasImageSource; w: number; h: number }> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { src: bmp, w: bmp.width, h: bmp.height };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error("Não consegui abrir esta imagem."));
        i.src = url;
      });
      return { src: img, w: img.naturalWidth, h: img.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Comprime a imagem NO NAVEGADOR antes de enviar:
 *  - reduz para no máximo `maxDim` px no lado maior;
 *  - converte para WebP (mantém transparência de PNG) e baixa a qualidade aos poucos
 *    até ficar abaixo de ~6 MB (sempre muito abaixo dos 50 MB);
 *  - GIF/SVG não são mexidos; imagens já leves também ficam como estão.
 * Quem "descomprime" é o próprio navegador, automaticamente, ao exibir a imagem.
 */
export async function compressImage(file: File, maxDim = 2400): Promise<File> {
  const type = file.type;
  if (!type.startsWith("image/") || type === "image/gif" || type === "image/svg+xml") return file;

  const { src, w, h } = await decode(file);
  const scale0 = Math.min(1, maxDim / Math.max(w, h));
  const needsResize = scale0 < 1;
  if (!needsResize && file.size <= 800 * 1024) return file; // já é leve

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  let scale = scale0;
  let q = 0.86;
  let best: Blob | null = null;
  for (let i = 0; i < 12; i++) {
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);

    let blob = await toBlob(canvas, "image/webp", q);
    if (!blob || blob.type !== "image/webp") {
      // Navegador sem WebP no canvas: PNG mantém transparência, JPEG é menor.
      blob = await toBlob(canvas, type === "image/png" ? "image/png" : "image/jpeg", q);
    }
    if (!blob) return file;
    best = blob;
    if (blob.size <= TARGET_BYTES) break;
    if (q > 0.58) q -= 0.1;
    else scale *= 0.75;
  }

  if (!best) return file;
  // Se não ajudou (e não precisava redimensionar), mantém o original.
  if (!needsResize && best.size >= file.size && file.size < HARD_LIMIT_BYTES) return file;

  const ext = best.type === "image/webp" ? "webp" : best.type === "image/png" ? "png" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "imagem";
  return new File([best], `${base}.${ext}`, { type: best.type });
}
