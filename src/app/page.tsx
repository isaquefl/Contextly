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
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          <div className="h-1/2 border-b border-zinc-200 dark:border-zinc-800 md:h-auto md:w-1/2 md:border-b-0 md:border-r">
            <DocumentPanel />
          </div>
          <div className="h-1/2 md:h-auto md:w-1/2">
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
