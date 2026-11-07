export async function preloadAll({ images = [], audio = [], video }: { images?: string[]; audio?: string[]; video?: string|null },
                                 onProgress: (p: number) => void) {
  const tasks: Promise<unknown>[] = [];
  images.forEach(u => tasks.push(new Promise(r => { const i = new Image(); i.onload = i.onerror = r as any; i.src = u; })));
  audio.forEach(u => tasks.push(fetch(u).then(r => r.blob())));
  if (video) tasks.push(new Promise(r => { const v = document.createElement("video");
    v.preload = "auto"; v.oncanplaythrough = v.onerror = r as any; v.src = video; }));
  let done = 0;
  await Promise.all(tasks.map(t => t.finally(() => onProgress(++done / tasks.length))));
}
