
export interface Document {
  id: string;
  title: string;
  content: string;
  fileType?: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  description?: string;
  pages?: number;
  lastAccessed?: string;
  thumbnail?: string;
  tags?: string[];
  status?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  front_content: string; // Must match exactly the DB columns
  back_content: string;  // Must match exactly the DB columns
  documentId: string;
  document_id?: string;  // DB column name
  createdAt: string;
  created_at?: string;   // DB column name
  lastReviewed?: string;
  confidence?: number;
  userId: string;
  user_id?: string;      // DB column name
  updated_at?: string;   // DB column name
}
