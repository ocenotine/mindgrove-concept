
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

// Adding this interface to ensure TypeScript knows about avatar_url in user metadata
export interface UserMetadata {
  name?: string;
  full_name?: string;
  account_type?: 'student' | 'admin' | 'teacher' | 'institution';
  institution_name?: string;
  domain?: string;
  institution_id?: string;
  bio?: string;
  avatar_url?: string;
}
