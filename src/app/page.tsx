'use client';

import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { DocumentPanel } from '@/components/DocumentPanel';
import { ChatPanel } from '@/components/ChatPanel';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode } = useApp();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return <>{children}</>;
}

function MainContent() {
  return (
    <ThemeWrapper>
      <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r border-zinc-200 dark:border-zinc-800">
            <DocumentPanel />
          </div>
          <div className="w-1/2">
            <ChatPanel />
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
