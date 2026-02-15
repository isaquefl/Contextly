'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  chunkText,
  estimateTokens,
  type TextChunk,
} from '@/lib/chunking';
import type { StrictMode } from '@/lib/types';

interface DocumentState {
  name: string;
  text: string;
  chunks: TextChunk[];
  fileType?: 'pdf' | 'docx' | 'txt' | 'paste';
}

interface AppContextValue {
  document: DocumentState | null;
  setDocument: (doc: DocumentState | null) => void;
  strictMode: StrictMode;
  setStrictMode: (mode: StrictMode) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  highlightChunkId: number | null;
  setHighlightChunkId: (id: number | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  loadFromText: (text: string, name?: string) => void;
  loadFromExtraction: (text: string, name: string) => void;
  estimatedTokens: number;
  clearDocument: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [strictMode, setStrictMode] = useState<StrictMode>('strict');
  const [darkMode, setDarkMode] = useState(false);
  const [highlightChunkId, setHighlightChunkId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFromText = useCallback((text: string, name = 'Pasted text') => {
    const t = text.trim();
    if (!t) {
      setDocument(null);
      return;
    }
    const chunks = chunkText(t);
    setDocument({
      name,
      text: t,
      chunks,
      fileType: 'paste',
    });
  }, []);

  const loadFromExtraction = useCallback((text: string, name: string) => {
    const chunks = chunkText(text);
    setDocument({
      name,
      text,
      chunks,
    });
  }, []);

  const clearDocument = useCallback(() => {
    setDocument(null);
    setHighlightChunkId(null);
    setSearchQuery('');
  }, []);

  const estimatedTokens = useMemo(() => {
    if (!document?.text) return 0;
    return estimateTokens(document.text);
  }, [document?.text]);

  const value = useMemo<AppContextValue>(
    () => ({
      document,
      setDocument,
      strictMode,
      setStrictMode,
      darkMode,
      setDarkMode,
      highlightChunkId,
      setHighlightChunkId,
      searchQuery,
      setSearchQuery,
      loadFromText,
      loadFromExtraction,
      estimatedTokens,
      clearDocument,
    }),
    [
      document,
      strictMode,
      darkMode,
      highlightChunkId,
      searchQuery,
      loadFromText,
      loadFromExtraction,
      estimatedTokens,
      clearDocument,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
