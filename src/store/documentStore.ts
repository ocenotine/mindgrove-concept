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
      console.log("Fetching documents from Supabase");
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn("User not authenticated");
        set({ documents: [], isLoading: false });
        return [];
      }
      
      // Fetch documents from Supabase for current user
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching documents:", error);
        throw new Error(error.message);
      }
      
      const documents = data || [];
      console.log("Fetched documents:", documents.length);
      set({ documents, isLoading: false });
      return documents;
    } catch (error) {
      console.error("Error in fetchDocuments:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },
  
  fetchDocumentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Fetching document by ID:", id);
      // Fetch document by ID from Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching document by ID:", error);
        throw new Error(error.message);
      }
      
      const document = data as Document;
      console.log("Fetched document:", document);
      set({ currentDocument: document, isLoading: false });
      return document;
    } catch (error) {
      console.error("Error in fetchDocumentById:", error);
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
      console.log("Starting document upload process...");
      
      // First, check if the storage bucket exists and create it if it doesn't
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some(bucket => bucket.name === 'documents')) {
        const { error: bucketError } = await supabase.storage.createBucket('documents', {
          public: true
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          // Continue anyway as the bucket might exist but not be visible to the user
        }
      }
      
      // Upload file to Supabase storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw new Error(storageError.message);
      }
      
      console.log("File uploaded to storage:", storageData);
      
      // Get public URL of the uploaded file
      const { data } = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);
      
      const file_path = data.publicUrl;
      console.log("Public URL:", file_path);
      
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
      
      if (documentError) {
        console.error("Document insert error:", documentError);
        throw new Error(documentError.message);
      }
      
      const newDocument = documentData as Document;
      console.log("Document created in database:", newDocument);
      
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
      console.log("Deleting document with ID:", id);
      
      // First, get the document to find its storage path
      const { data: document } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single();
      
      // Remove from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting document from database:", error);
        throw new Error(error.message);
      }
      
      // If we have a file path, try to remove the file from storage
      if (document?.file_path) {
        try {
          // Extract the path from the URL
          const url = new URL(document.file_path);
          const pathParts = url.pathname.split('/');
          // The last two parts should be the userId/filename
          const storagePath = pathParts.slice(-2).join('/');
          
          if (storagePath) {
            const { error: storageError } = await supabase
              .storage
              .from('documents')
              .remove([storagePath]);
            
            if (storageError) {
              console.error("Error removing file from storage:", storageError);
              // Don't throw here, as the document was already deleted from the database
            }
          }
        } catch (storageError) {
          console.error("Error parsing file path:", storageError);
          // Continue anyway as the document was deleted from the database
        }
      }

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
      console.log("Setting document summary for ID:", documentId);
      const { error } = await supabase
        .from('documents')
        .update({ summary })
        .eq('id', documentId);
        
      if (error) {
        console.error("Error updating document summary:", error);
        throw error;
      }
      
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
      console.log('Saving flashcards for document:', documentId);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Create flashcard entries for each flashcard
      for (const flashcard of flashcards) {
        const { error } = await supabase
          .from('flashcards')
          .insert({
            document_id: documentId,
            front_content: flashcard.question,
            back_content: flashcard.answer,
            user_id: user.id
          });
          
        if (error) {
          console.error('Error saving flashcard:', error);
          throw error;
        }
      }
      
      console.log(`Successfully saved ${flashcards.length} flashcards`);
    } catch (error) {
      console.error('Error saving flashcards:', error);
      throw error;
    }
  },
  
  generateSummary: async (documentId: string): Promise<string> => {
    set({ isLoading: true, error: null });
    try {
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
    // Filter documents by title or content
    const documents = get().documents;
    if (!query.trim()) return documents;
    
    const results = documents.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) || 
      (doc.content && doc.content.toLowerCase().includes(query.toLowerCase())) ||
      (doc.summary && doc.summary.toLowerCase().includes(query.toLowerCase()))
    );
    
    return results;
  }
}));
