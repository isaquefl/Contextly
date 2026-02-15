'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FileUpload } from './FileUpload';

function HighlightedText({
  text,
  highlight,
  highlightAll,
}: {
  text: string;
  highlight: string;
  highlightAll?: boolean;
}) {
  const parts: { text: string; highlight?: boolean }[] = [];

  if (highlightAll) {
    parts.push({ text, highlight: true });
  } else if (highlight) {
    const re = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    let lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      parts.push({ text: text.slice(lastIndex, m.index) });
      parts.push({ text: m[1], highlight: true });
      lastIndex = m.index + m[1].length;
    }
    parts.push({ text: text.slice(lastIndex) });
  } else {
    parts.push({ text });
  }

  return (
    <span>
      {parts.map((p, i) =>
        p.highlight ? (
          <mark
            key={i}
            className="bg-amber-200 text-amber-900 dark:bg-amber-800/60 dark:text-amber-100"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function DocumentPanel() {
  const {
    document,
    strictMode,
    setStrictMode,
    searchQuery,
    setSearchQuery,
    highlightChunkId,
    setHighlightChunkId,
    loadFromText,
    clearDocument,
    estimatedTokens,
  } = useApp();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pasteValue, setPasteValue] = useState('');

  const debouncedLoad = useCallback(() => {
    const t = pasteValue.trim();
    if (t) loadFromText(t, 'Pasted text');
    else if (document?.fileType === 'paste') clearDocument();
  }, [pasteValue, loadFromText, document?.fileType, clearDocument]);

  useEffect(() => {
    const t = setTimeout(debouncedLoad, 400);
    return () => clearTimeout(t);
  }, [debouncedLoad]);

  useEffect(() => {
    if (highlightChunkId && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-chunk="${highlightChunkId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightChunkId]);

  const hasContent = (document?.text ?? '').trim().length > 0;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Document
          </h2>
          {hasContent && (
            <button
              onClick={() => {
                clearDocument();
                setPasteValue('');
              }}
              className="text-xs text-zinc-500 hover:text-red-500 dark:hover:text-zinc-400"
            >
              Clear
            </button>
          )}
        </div>

        {hasContent && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Mode:</span>
          <button
            onClick={() => setStrictMode('strict')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              strictMode === 'strict'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300'
            }`}
          >
            Strict
          </button>
          <button
            onClick={() => setStrictMode('assisted')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              strictMode === 'assisted'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300'
            }`}
          >
            Assisted
          </button>
        </div>

        {hasContent && (
          <p className="text-xs text-zinc-500">
            ~{estimatedTokens.toLocaleString()} tokens · {document?.chunks.length ?? 0} chunks
          </p>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {!hasContent ? (
          <div className="space-y-4">
            <FileUpload />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <span className="relative block text-center text-xs text-zinc-400">
                or paste below
              </span>
            </div>
            <textarea
              ref={textareaRef}
              placeholder="Paste or type your document here..."
              value={pasteValue}
              className="min-h-[120px] w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              onChange={(e) => setPasteValue(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-2 font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {document?.name && (
              <p className="mb-2 text-xs text-zinc-500">{document.name}</p>
            )}
            {document?.chunks.map((chunk) => (
              <div
                key={chunk.id}
                data-chunk={chunk.id}
                onClick={() =>
                  setHighlightChunkId(highlightChunkId === chunk.id ? null : chunk.id)
                }
                className={`cursor-pointer rounded-lg p-2 transition ${
                  highlightChunkId === chunk.id
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="text-xs text-zinc-400">[{chunk.id}] </span>
                <HighlightedText
                  text={chunk.text}
                  highlight={searchQuery}
                  highlightAll={highlightChunkId === chunk.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
