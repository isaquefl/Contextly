'use client';

import { useCallback, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPT = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export function FileUpload() {
  const { loadFromExtraction } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_SIZE) {
        setError('File too large. Maximum size is 50MB.');
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/extract', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Extraction failed');

        loadFromExtraction(data.text, data.name);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to process file');
      } finally {
        setLoading(false);
      }
    },
    [loadFromExtraction]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-6 py-8 text-center transition hover:border-emerald-500 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:border-emerald-500 dark:hover:bg-zinc-800/50"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onInputChange}
          className="hidden"
        />
        {loading ? (
          <p className="text-sm text-zinc-500">Extracting text...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Drop a file or click to upload
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              PDF, DOCX, TXT — max 50MB
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
