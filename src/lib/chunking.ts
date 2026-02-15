/**
 * Intelligent text chunking for RAG
 * Splits document into overlapping chunks with IDs for citation
 */

export interface TextChunk {
  id: number;
  text: string;
  startIndex: number;
  endIndex: number;
}

const DEFAULT_CHUNK_SIZE = 800;
const OVERLAP = 100;

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = OVERLAP
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let startIndex = 0;
  let chunkId = 1;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i] + '\n\n';
    if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
      const endIndex = startIndex + currentChunk.length;
      chunks.push({
        id: chunkId++,
        text: currentChunk.trim(),
        startIndex,
        endIndex,
      });
      const overlapText = currentChunk.slice(-overlap);
      const overlapStart = currentChunk.length - overlap;
      startIndex = startIndex + overlapStart;
      currentChunk = overlapText + para;
    } else {
      currentChunk += para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: chunkId,
      text: currentChunk.trim(),
      startIndex,
      endIndex: startIndex + currentChunk.length,
    });
  }

  return chunks;
}

export function findRelevantChunks(
  chunks: TextChunk[],
  query: string,
  maxChunks = 5
): TextChunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const scored = chunks.map((chunk) => {
    const text = chunk.text.toLowerCase();
    const score = queryTerms.reduce(
      (acc, term) => acc + (text.includes(term) ? 1 : 0),
      0
    );
    return { chunk, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map((s) => s.chunk);
}

export function chunksToContext(chunks: TextChunk[]): string {
  return chunks
    .map((c) => `[Chunk ${c.id}]\n${c.text}`)
    .join('\n\n---\n\n');
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
