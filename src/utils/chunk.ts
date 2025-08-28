export interface ChunkOptions {
  maxCharsPerChunk: number; // soft cap; function ensures not to exceed this
}

export function chunkText(text: string, options: ChunkOptions): string[] {
  const max = Math.max(1000, options.maxCharsPerChunk); // enforce reasonable floor
  if (text.length <= max) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + max, text.length);

    // Try to cut on newline or sentence boundary for cleaner chunks
    const slice = text.slice(start, end);
    let cut = slice.lastIndexOf('\n');
    if (cut < max * 0.6) {
      const period = slice.lastIndexOf('. ');
      if (period > 0) cut = period + 1;
    }
    if (cut <= 0) cut = slice.length;

    chunks.push(slice.slice(0, cut));
    start += cut;
  }
  return chunks;
}


