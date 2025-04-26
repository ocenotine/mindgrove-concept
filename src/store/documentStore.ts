
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

// Define the Document type that matches Supabase schema
export interface Document {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  file_path: string | null;
  file_type: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

// Define flashcard type
export interface Flashcard {
  question: string;
  answer: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<Document[]>;
  fetchDocumentById: (id: string) => Promise<Document | null>;
  createDocument: (document: Partial<Document> & { title: string; user_id: string }) => Promise<Document | null>;
  uploadDocument: (file: File, title: string, userId: string) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  setDocumentSummary: (documentId: string, summary: string) => Promise<void>;
  saveFlashcards: (documentId: string, flashcards: Flashcard[]) => Promise<void>;
  generateSummary: (documentId: string) => Promise<string>;
  generateFlashcards: (documentId: string) => Promise<string[]>;
  searchDocuments: (query: string) => Document[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch documents from Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*');
      
      if (error) throw new Error(error.message);
      
      const documents = data || [];
      set({ documents, isLoading: false });
      return documents;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },
  
  fetchDocumentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch document by ID from Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      const document = data as Document;
      set({ currentDocument: document, isLoading: false });
      return document;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },
  
  createDocument: async (document) => {
    set({ isLoading: true, error: null });
    try {
      // Create document in Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert([document])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      const newDocument = data as Document;
      set((state) => ({ 
        documents: [...state.documents, newDocument], 
        isLoading: false 
      }));
      
      return newDocument;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },
  
  uploadDocument: async (file: File, title: string, userId: string): Promise<Document | null> => {
    set({ isLoading: true, error: null });
    try {
      // Upload file to Supabase storage
      const filePath = `documents/${userId}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) throw new Error(storageError.message);
      
      // Get public URL of the uploaded file
      const { data } = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);
      
      const file_path = data.publicUrl;
      
      // Create document record in Supabase
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert([{ 
          title,
          user_id: userId,
          file_path,
          file_type: file.type,
          content: '' // You might want to extract text content here
        }])
        .select('*')
        .single();
      
      if (documentError) throw new Error(documentError.message);
      
      const newDocument = documentData as Document;
      
      set((state) => ({
        documents: [...state.documents, newDocument],
        isLoading: false
      }));
      
      return newDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      // Remove from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Update local state by removing the document
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  setDocumentSummary: async (documentId: string, summary: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ summary })
        .eq('id', documentId);
        
      if (error) throw error;
      
      // Update the document in state if it exists
      set(state => {
        const updatedDocuments = state.documents.map(doc => 
          doc.id === documentId ? { ...doc, summary } : doc
        );
        
        const updatedCurrentDocument = state.currentDocument?.id === documentId
          ? { ...state.currentDocument, summary }
          : state.currentDocument;
          
        return {
          documents: updatedDocuments,
          currentDocument: updatedCurrentDocument
        };
      });
    } catch (error) {
      console.error('Error updating document summary:', error);
    }
  },
  
  saveFlashcards: async (documentId: string, flashcards: Flashcard[]): Promise<void> => {
    try {
      // In a real implementation, you would save these to a flashcards table
      console.log('Saving flashcards for document:', documentId, flashcards);
      
      // For demonstration purposes, just log them
      // In a real implementation, you would insert them into a flashcards table
      for (const flashcard of flashcards) {
        const { error } = await supabase
          .from('flashcards')
          .insert({
            document_id: documentId,
            front_content: flashcard.question,
            back_content: flashcard.answer,
            user_id: get().currentDocument?.user_id || ''
          });
          
        if (error) console.error('Error saving flashcard:', error);
      }
    } catch (error) {
      console.error('Error saving flashcards:', error);
    }
  },
  
  generateSummary: async (documentId: string): Promise<string> => {
    set({ isLoading: true, error: null });
    try {
      // Call Supabase function to generate summary
      // const { data, error } = await supabase
      //   .functions
      //   .invoke('generate-summary', {
      //     body: { documentId }
      //   });
        
      // if (error) throw new Error(error.message);
      
      // set({ isLoading: false });
      
      // return data;
      
      // Mock summary generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      set({ isLoading: false });
      return 'This is a mock summary.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return 'Failed to generate summary.';
    }
  },
  
  generateFlashcards: async (documentId: string): Promise<string[]> => {
    set({ isLoading: true, error: null });
    try {
      // Call Supabase function to generate flashcards
      // const { data, error } = await supabase
      //   .functions
      //   .invoke('generate-flashcards', {
      //     body: { documentId }
      //   });
        
      // if (error) throw new Error(error.message);
      
      // set({ isLoading: false });
      
      // return data;
      
      // Mock flashcard generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      set({ isLoading: false });
      return ['Mock flashcard 1', 'Mock flashcard 2'];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return ['Failed to generate flashcards.'];
    }
  },
  
  searchDocuments: (query: string): Document[] => {
    // Mock search functionality
    const documents = get().documents;
    if (!query.trim()) return documents;
    
    // Filter documents by title or content
    const results = documents.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) || 
      (doc.content && doc.content.toLowerCase().includes(query.toLowerCase())) ||
      (doc.summary && doc.summary.toLowerCase().includes(query.toLowerCase()))
    );
    
    return results;
  }
}));
