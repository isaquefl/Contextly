'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { AnalysisButtons } from './AnalysisButtons';
import type { TextChunk } from '@/lib/chunking';

export function ChatPanel() {
  const {
    document,
    strictMode,
    estimatedTokens,
  } = useApp();
  const bodyRef = useRef<{
    context: string;
    chunks: TextChunk[];
    strictMode: string;
  }>({ context: '', chunks: [], strictMode: 'strict' });

  bodyRef.current = {
    context: document?.text ?? '',
    chunks: document?.chunks ?? [],
    strictMode,
  };

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => bodyRef.current,
    }),
  });

  const handleAnalysisResult = useCallback(
    (type: string, result: string) => {
      const label = type.replace(/([A-Z])/g, ' $1').trim();
      sendMessage({
        text: `[Analysis: ${label}]\n\n${result}`,
      });
    },
    [sendMessage]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const textarea = form.querySelector('textarea');
    const text = textarea?.value?.trim();
    if (text) {
      sendMessage({ text });
      textarea!.value = '';
    }
  };

  const handleExport = useCallback(
    (format: 'md' | 'txt') => {
      const content = messages
        .map((m) => {
          const role = m.role === 'user' ? '**You:**' : '**Contextly:**';
          const t = m.parts
            ?.filter((p) => p.type === 'text')
            .map((p) => (p as { text?: string }).text)
            .join('') ?? '';
          return `${role}\n${t}`;
        })
        .join('\n\n');

      const blob = new Blob([content], {
        type: format === 'md' ? 'text/markdown' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `contextly-chat-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [messages]
  );

  const copyAll = useCallback(() => {
    const text = messages
      .map((m) => {
        const role = m.role === 'user' ? 'You:' : 'Contextly:';
        const t = m.parts
          ?.filter((p) => p.type === 'text')
          .map((p) => (p as { text?: string }).text)
          .join('') ?? '';
        return `${role}\n${t}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(text);
  }, [messages]);

  const hasDoc = !!document?.text?.trim();

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col gap-2 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Chat
        </h2>
        <AnalysisButtons onResult={handleAnalysisResult} />
        {messages.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={copyAll}
              className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300"
            >
              Copy
            </button>
            <button
              onClick={() => handleExport('md')}
              className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300"
            >
              Export MD
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300"
            >
              Export TXT
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              {hasDoc
                ? 'Ask questions about your document.'
                : 'Upload or paste a document to get started.'}
            </p>
            {hasDoc && (
              <p className="mt-2 text-xs text-zinc-400">
                ~{estimatedTokens.toLocaleString()} tokens in context
              </p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'user'
                ? 'ml-8 flex justify-end'
                : 'mr-8 flex justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                  : 'bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700'
              }`}
            >
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.parts?.map((part, i) =>
                  part.type === 'text' ? (
                    <span key={i}>{(part as { text?: string }).text}</span>
                  ) : null
                )}
              </div>
            </div>
          </div>
        ))}

        {status === 'streaming' && (
          <div className="ml-8 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-400">Thinking...</span>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex gap-2">
          <textarea
            name="message"
            rows={1}
            disabled={status === 'streaming'}
            placeholder="Ask a question or upload a document..."
            className="flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={status === 'streaming'}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
