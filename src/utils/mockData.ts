
// Define the Document interface with camelCase properties and snake_case compatibility
export interface Document {
  id: string;
  title: string;
  content: string;
  fileType?: string;
  filePath?: string;
  userId?: string;
  user_id: string; // Required for compatibility with Supabase
  createdAt?: string;
  updatedAt?: string;
  summary?: string;
  description?: string;
  lastAccessed?: string;
  pages?: number;
  thumbnail?: string;
}

// Define the Flashcard interface 
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  front_content?: string;
  back_content?: string;
  documentId: string;
  createdAt: string;
  userId: string;
}

// No mock data needed as we're using real data from Supabase
