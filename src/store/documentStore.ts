
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from '@/components/ui/use-toast';

export interface Document {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  file_path: string | null;
  file_type: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  document_id?: string;
  user_id?: string;
  created_at?: string;
  front_content?: string;
  back_content?: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  documentFlashcards: { [documentId: string]: Flashcard[] };
  documentSummaries: { [documentId: string]: string };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDocuments: () => Promise<Document[]>;
  fetchDocumentById: (id: string) => Promise<Document | null>;
  addDocument: (document: Partial<Document>) => Promise<Document | null>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  setCurrentDocument: (document: Document | null) => void;
  searchDocuments: (query: string) => Document[];
  setDocumentSummary: (documentId: string, summary: string) => Promise<void>;
  fetchFlashcards: (documentId: string) => Promise<Flashcard[]>;
  saveFlashcards: (documentId: string, flashcards: Flashcard[]) => Promise<void>;
  clearState: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      currentDocument: null,
      documentFlashcards: {},
      documentSummaries: {},
      isLoading: false,
      error: null,

      // Fetch all documents for the current user
      fetchDocuments: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            set({ isLoading: false, error: 'User not authenticated' });
            return [];
          }

          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (error) throw error;

          set({ documents: data || [], isLoading: false });
          return data || [];
        } catch (error: any) {
          console.error('Error fetching documents:', error);
          set({ isLoading: false, error: error.message });
          return [];
        }
      },
      
      // Fetch a document by ID
      fetchDocumentById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            set({ currentDocument: data, isLoading: false });
            return data;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error: any) {
          console.error(`Error fetching document with ID ${id}:`, error);
          set({ isLoading: false, error: error.message });
          return null;
        }
      },
      
      // Add a new document
      addDocument: async (document) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            set({ isLoading: false, error: 'User not authenticated' });
            toast({
              title: "Authentication Error",
              description: "Please log in to add documents",
              variant: "destructive"
            });
            return null;
          }

          const newDocument = {
            ...document,
            user_id: user.id,
            title: document.title || 'Untitled Document'
          };

          const { data, error } = await supabase
            .from('documents')
            .insert([newDocument])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            documents: [data, ...state.documents],
            isLoading: false
          }));
          
          toast({
            title: "Document Added",
            description: "Your document has been successfully created."
          });
          
          return data;
        } catch (error: any) {
          console.error('Error adding document:', error);
          set({ isLoading: false, error: error.message });
          toast({
            title: "Error Adding Document",
            description: error.message,
            variant: "destructive"
          });
          return null;
        }
      },
      
      // Update a document
      updateDocument: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            set({ isLoading: false, error: 'User not authenticated' });
            return null;
          }

          const { data, error } = await supabase
            .from('documents')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            documents: state.documents.map(doc => 
              doc.id === id ? { ...doc, ...data } : doc
            ),
            currentDocument: state.currentDocument?.id === id 
              ? { ...state.currentDocument, ...data } 
              : state.currentDocument,
            isLoading: false
          }));
          
          return data;
        } catch (error: any) {
          console.error(`Error updating document with ID ${id}:`, error);
          set({ isLoading: false, error: error.message });
          return null;
        }
      },
      
      // Delete a document
      deleteDocument: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            set({ isLoading: false, error: 'User not authenticated' });
            return false;
          }

          const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set(state => ({
            documents: state.documents.filter(doc => doc.id !== id),
            currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
            isLoading: false
          }));
          
          toast({
            title: "Document Deleted",
            description: "Your document has been successfully deleted."
          });
          
          return true;
        } catch (error: any) {
          console.error(`Error deleting document with ID ${id}:`, error);
          set({ isLoading: false, error: error.message });
          
          toast({
            title: "Error Deleting Document",
            description: error.message,
            variant: "destructive"
          });
          
          return false;
        }
      },
      
      // Set the current document
      setCurrentDocument: (document) => {
        set({ currentDocument: document });
      },
      
      // Search documents
      searchDocuments: (query) => {
        const { documents } = get();
        if (!query.trim()) return documents;
        
        const lowerQuery = query.toLowerCase();
        return documents.filter(doc => {
          return (
            doc.title.toLowerCase().includes(lowerQuery) ||
            (doc.content && doc.content.toLowerCase().includes(lowerQuery)) ||
            (doc.summary && doc.summary.toLowerCase().includes(lowerQuery))
          );
        });
      },
      
      // Set a document summary
      setDocumentSummary: async (documentId, summary) => {
        try {
          // Update in Supabase
          await supabase
            .from('documents')
            .update({ summary })
            .eq('id', documentId);
          
          // Update local state
          set(state => ({
            documentSummaries: {
              ...state.documentSummaries,
              [documentId]: summary
            },
            documents: state.documents.map(doc => 
              doc.id === documentId ? { ...doc, summary } : doc
            ),
            currentDocument: state.currentDocument?.id === documentId
              ? { ...state.currentDocument, summary }
              : state.currentDocument
          }));
          
          toast({
            title: "Summary Updated",
            description: "Document summary has been saved."
          });
        } catch (error) {
          console.error('Error setting document summary:', error);
          throw error;
        }
      },
      
      // Fetch flashcards for a document
      fetchFlashcards: async (documentId) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            toast({
              title: "Authentication Error",
              description: "Please log in to view flashcards",
              variant: "destructive"
            });
            throw new Error('User not authenticated');
          }
          
          const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('document_id', documentId)
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          const flashcards = (data || []).map(card => ({
            id: card.id,
            question: card.front_content,
            answer: card.back_content,
            document_id: card.document_id,
            user_id: card.user_id,
            created_at: card.created_at
          }));
          
          set(state => ({
            documentFlashcards: {
              ...state.documentFlashcards,
              [documentId]: flashcards
            }
          }));
          
          return flashcards;
        } catch (error) {
          console.error('Error fetching flashcards:', error);
          toast({
            title: "Error Loading Flashcards",
            description: "Failed to load your flashcards. Please try again.",
            variant: "destructive"
          });
          return [];
        }
      },
      
      // Save flashcards for a document
      saveFlashcards: async (documentId, flashcards) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            toast({
              title: "Authentication Error",
              description: "Please log in to save flashcards",
              variant: "destructive"
            });
            throw new Error('User not authenticated');
          }
          
          // Format flashcards for database
          const dbFlashcards = flashcards.map(card => ({
            document_id: documentId,
            user_id: user.id,
            front_content: card.question,
            back_content: card.answer
          }));
          
          // Insert into database
          const { error } = await supabase
            .from('flashcards')
            .insert(dbFlashcards);
            
          if (error) throw error;
          
          // Update local state
          set(state => ({
            documentFlashcards: {
              ...state.documentFlashcards,
              [documentId]: flashcards.map((card, index) => ({
                ...card,
                document_id: documentId,
                user_id: user.id
              }))
            }
          }));
          
          toast({
            title: "Flashcards Saved",
            description: `${flashcards.length} flashcards have been saved successfully.`
          });
        } catch (error) {
          console.error('Error saving flashcards:', error);
          toast({
            title: "Error Saving Flashcards",
            description: "Failed to save your flashcards. Please try again.",
            variant: "destructive"
          });
          throw error;
        }
      },
      
      // Clear the state
      clearState: () => {
        set({
          documents: [],
          currentDocument: null,
          documentFlashcards: {},
          documentSummaries: {},
          error: null
        });
      }
    }),
    {
      name: 'document-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
