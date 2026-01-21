
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Source {
  id: string;
  docTitle: string;
  snippet: string;
  score: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  sources?: Source[];
  confidence?: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  uploadDate: number;
  chunkCount: number;
}

export interface Chunk {
  id: string;
  docId: string;
  docTitle: string;
  text: string;
  embedding?: number[]; // Placeholder for vector search
}

export interface AppState {
  messages: Message[];
  documents: Document[];
  isThinking: boolean;
  logs: string[];
  cache: Record<string, { answer: string; sources: Source[]; confidence: number }>;
}
