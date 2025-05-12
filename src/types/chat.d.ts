
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  documentId?: string | null;
  documentTitle?: string | null;
  lastUpdated: Date;
}
