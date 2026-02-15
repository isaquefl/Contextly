'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

const ANALYSIS_TYPES = [
  { id: 'executive', label: 'Executive summary' },
  { id: 'technical', label: 'Technical summary' },
  { id: 'keyPoints', label: 'Key points' },
  { id: 'keyQuestions', label: 'Key questions' },
  { id: 'obligations', label: 'Extract obligations' },
  { id: 'risks', label: 'Extract risks' },
  { id: 'dates', label: 'Extract dates' },
  { id: 'monetary', label: 'Extract monetary values' },
  { id: 'clauses', label: 'Critical clauses' },
] as const;

export function AnalysisButtons({
  onResult,
}: {
  onResult: (type: string, result: string) => void;
}) {
  const { document } = useApp();
  const [loading, setLoading] = useState<string | null>(null);

  if (!document?.text?.trim()) return null;

  const run = async (type: string) => {
    setLoading(type);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: document.text, type }),
      });
      const data = await res.json();
      if (res.ok) onResult(type, data.result);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {ANALYSIS_TYPES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => run(id)}
          disabled={!!loading}
          className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200"
        >
          {loading === id ? '...' : label}
        </button>
      ))}
    </div>
  );
}
