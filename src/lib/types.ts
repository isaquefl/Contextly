export interface DocumentState {
  name: string;
  text: string;
  chunks: import('./chunking').TextChunk[];
  fileType?: 'pdf' | 'docx' | 'txt' | 'paste';
}

export type StrictMode = 'strict' | 'assisted';

export interface ChatCitation {
  chunkId: number;
  excerpt: string;
}

export interface AppSettings {
  strictMode: StrictMode;
  darkMode: boolean;
  maxTokensPerSession: number;
}
