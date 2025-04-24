
import { create } from 'zustand';
import type { Document, Flashcard } from '@/utils/mockData';
import { useAuthStore } from './authStore';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { generateDocumentSummary, generateFlashcards } from '@/utils/nlpCloudUtils';

interface DBDocument {
  id: string;
  title: string;
  summary: string | null;
  file_path: string | null;
  file_type: string | null;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  pages?: number;
}

interface DBFlashcard {
  id: string;
  front_content: string;
  back_content: string;
  document_id: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  fetchDocumentById: (id: string) => Promise<void>;
  createDocument: (title: string, content: string, fileType: string, filePath: string) => Promise<string>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<boolean>;
  fetchDocumentFlashcards: (id: string) => Promise<Flashcard[]>;
  clearCurrentDocument: () => void;
  searchDocuments: (query: string) => Document[];
  setDocumentSummary: (id: string, summary: string) => Promise<void>;
  
  getDocument: (id: string) => Promise<void>;
  uploadDocument: (file: File) => Promise<Document | undefined>;
  generateSummary: (documentId: string, text: string) => Promise<string>;
  generateFlashcards: (documentId: string, text: string) => Promise<any[]>;
  saveFlashcards: (documentId: string, flashcards: any[]) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const formattedDocuments: Document[] = documents?.map((doc: DBDocument) => {
        return {
          id: doc.id,
          title: doc.title,
          content: doc.content || '',
          fileType: doc.file_type || undefined,
          summary: doc.summary || '',
          createdAt: doc.created_at || new Date().toISOString(),
          updatedAt: doc.updated_at || new Date().toISOString(),
          userId: doc.user_id,
          description: '',
          pages: doc.pages || 1,
          lastAccessed: doc.updated_at || new Date().toISOString(),
          status: doc.summary ? 'processed' : 'processing',
          tags: [],
        } as Document;
      }) || [];
      
      set({ documents: formattedDocuments, isLoading: false });
    } catch (error) {
      console.error('Error fetching documents:', error);
      set({ isLoading: false, error: 'Failed to fetch documents' });
    }
  },
  
  fetchDocumentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!document) {
        throw new Error(`Document with ID ${id} not found`);
      }
      
      const formattedDocument: Document = {
        id: document.id,
        title: document.title,
        content: document.content || '',
        fileType: document.file_type || undefined,
        summary: document.summary || '',
        createdAt: document.created_at || new Date().toISOString(),
        updatedAt: document.updated_at || new Date().toISOString(),
        userId: document.user_id,
        description: '',
        pages: (document as DBDocument).pages || 1,
        lastAccessed: document.updated_at || new Date().toISOString(),
        status: document.summary ? 'processed' : 'processing',
        tags: [],
      };
      
      set({ currentDocument: formattedDocument, isLoading: false });
    } catch (error) {
      console.error('Error fetching document:', error);
      set({ isLoading: false, error: 'Failed to fetch document' });
    }
  },
  
  createDocument: async (title: string, content: string, fileType: string, filePath: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const documentId = uuidv4();
      
      const { error } = await supabase
        .from('documents')
        .insert([
          {
            id: documentId,
            title,
            content,
            file_type: fileType,
            file_path: filePath,
            user_id: user.id,
          },
        ]);
      
      if (error) {
        throw error;
      }
      
      const newDocument: Document = {
        id: documentId,
        title,
        content,
        fileType,
        summary: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        description: '',
        pages: 1,
        lastAccessed: new Date().toISOString(),
        status: 'processing',
        tags: [],
      };
      
      set((state) => ({
        documents: [newDocument, ...state.documents],
        isLoading: false,
      }));
      
      return documentId;
    } catch (error) {
      console.error('Error creating document:', error);
      set({ isLoading: false, error: 'Failed to create document' });
      throw error;
    }
  },
  
  updateDocument: async (id: string, updates: Partial<Document>) => {
    set({ isLoading: true, error: null });
    try {
      // Convert Document fields to DB fields
      const dbUpdates: any = { ...updates };
      if ('fileType' in updates) {
        dbUpdates.file_type = updates.fileType;
        delete dbUpdates.fileType;
      }
      
      const { error } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      set((state) => ({
        documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
        currentDocument:
          state.currentDocument?.id === id ? { ...state.currentDocument, ...updates } : state.currentDocument,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating document:', error);
      set({ isLoading: false, error: 'Failed to update document' });
    }
  },
  
  deleteDocument: async (id: string): Promise<boolean> => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      set({ isLoading: false, error: 'Failed to delete document' });
      return false;
    }
  },
  
  setDocumentSummary: async (id: string, summary: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ summary })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      set((state) => ({
        documents: state.documents.map(doc => 
          doc.id === id ? { ...doc, summary, status: 'processed' } : doc
        ),
        currentDocument: state.currentDocument?.id === id ? 
          { ...state.currentDocument, summary, status: 'processed' } : 
          state.currentDocument
      }));
    } catch (error) {
      console.error('Error updating document summary:', error);
      throw new Error('Failed to update document summary');
    }
  },
  
  fetchDocumentFlashcards: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('document_id', id);
      
      if (error) {
        throw error;
      }
      
      // Convert database format to application format
      const flashcards: Flashcard[] = (data || []).map((card: DBFlashcard) => {
        return {
          id: card.id,
          front_content: card.front_content,
          back_content: card.back_content,
          question: card.front_content,  // Map DB fields to app fields
          answer: card.back_content,     // Map DB fields to app fields
          documentId: card.document_id,
          document_id: card.document_id,
          createdAt: card.created_at,
          created_at: card.created_at,
          userId: card.user_id,
          user_id: card.user_id,
          updated_at: card.updated_at,
        };
      });
      
      return flashcards;
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch flashcards",
        variant: "destructive"
      });
      throw new Error('Failed to fetch flashcards');
    }
  },
  
  clearCurrentDocument: () => {
    set({ currentDocument: null });
  },
  
  searchDocuments: (query) => {
    const { documents } = get();
    if (!query) return [];
    
    const results = documents.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) || 
      (doc.content && doc.content.toLowerCase().includes(query.toLowerCase()))
    );
    
    return results;
  },
  
  getDocument: async (id: string) => {
    return get().fetchDocumentById(id);
  },
  
  uploadDocument: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      if (file.type !== 'application/pdf' && 
          !file.type.includes('text/') && 
          !file.type.includes('document')) {
        throw new Error('Only PDF, text, and document files are supported');
      }
      
      const { user } = useAuthStore.getState();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const filePath = `documents/${user.id}/${Date.now()}_${file.name}`;
      
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        
        if (file.type === 'application/pdf') {
          resolve(`Content extracted from ${file.name}`);
        } else {
          reader.readAsText(file);
        }
      });
      
      const documentId = await get().createDocument(file.name, content, file.type, filePath);
      
      const createdDocument = get().documents.find(doc => doc.id === documentId);
      
      // Update profile document count - wrap in try/catch to prevent failures
      try {
        await supabase
          .from('profiles')
          .update({ document_count: user.documentCount ? user.documentCount + 1 : 1 })
          .eq('id', user.id);
      } catch (e) {
        console.error('Error updating document count:', e);
      }
      
      set({ isLoading: false });
      toast({
        title: "Document uploaded",
        description: "Document has been successfully uploaded",
      });
      
      return createdDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: "destructive"
      });
      set({ isLoading: false, error: 'Failed to upload document' });
      throw error;
    }
  },
  
  generateSummary: async (documentId: string, text: string) => {
    try {
      // Use our new NLPCloud utility
      const summary = await generateDocumentSummary(text);
      
      // Update the document with the new summary
      await get().setDocumentSummary(documentId, summary);
      
      toast({
        title: "Summary generated",
        description: "Document summary has been created successfully",
      });
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary generation failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
      
      const fallbackSummary = `This document appears to discuss research methodologies and academic findings. The content covers various aspects of data analysis and theoretical frameworks within the field of study.`;
      await get().setDocumentSummary(documentId, fallbackSummary);
      return fallbackSummary;
    }
  },
  
  generateFlashcards: async (documentId: string, text: string) => {
    try {
      // Use our new NLPCloud utility
      const flashcardData = await generateFlashcards(text);
      
      await get().saveFlashcards(documentId, flashcardData);
      
      toast({
        title: "Flashcards generated",
        description: `${flashcardData.length} flashcards have been created`,
      });
      
      return flashcardData;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Flashcard generation failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
      
      const fallbackFlashcards = [
        {
          question: "What is this document about?",
          answer: "This document discusses academic and research topics."
        },
        {
          question: "What are some key concepts in research?",
          answer: "Research methods, data analysis, and literature review."
        }
      ];
      
      await get().saveFlashcards(documentId, fallbackFlashcards);
      
      return fallbackFlashcards;
    }
  },
  
  saveFlashcards: async (documentId: string, flashcards: any[]) => {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Clean up existing flashcards
      await supabase
        .from('flashcards')
        .delete()
        .eq('document_id', documentId);
      
      const flashcardsToInsert = flashcards.map(card => ({
        id: uuidv4(),
        document_id: documentId,
        user_id: user.id,
        front_content: card.question,
        back_content: card.answer,
        created_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('flashcards')
        .insert(flashcardsToInsert);
      
      if (error) {
        throw error;
      }
      
      // Update profile flashcard count - wrap in try/catch to prevent failures
      try {
        await supabase
          .from('profiles')
          .update({ flashcard_count: user.flashcardCount ? user.flashcardCount + flashcards.length : flashcards.length })
          .eq('id', user.id);
      } catch (e) {
        console.error('Error updating flashcard count:', e);
      }
      
    } catch (error) {
      console.error('Error saving flashcards:', error);
      throw new Error('Failed to save flashcards');
    }
  }
}));
