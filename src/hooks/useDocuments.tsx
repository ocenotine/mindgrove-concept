
import { useEffect, useState, useCallback } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { Document } from '@/utils/mockData';
import { useAuthStore } from '@/store/authStore';
import { adaptToMockDocument, adaptStoreDocumentsToMockDocuments } from '@/utils/documentAdapter';

export const useDocuments = () => {
  const { user } = useAuthStore();
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    documents: storeDocuments,
    currentDocument: storeCurrentDocument,
    isLoading,
    error,
    fetchDocuments,
    fetchDocumentById,
    createDocument,
    uploadDocument,
    generateSummary,
    generateFlashcards,
    searchDocuments: searchStoreDocuments
  } = useDocumentStore();

  // Convert store documents to mock documents
  const documents = adaptStoreDocumentsToMockDocuments(storeDocuments || []);
  const currentDocument = storeCurrentDocument ? adaptToMockDocument(storeCurrentDocument) : null;

  // Only fetch documents when the hook is first used or when user changes
  useEffect(() => {
    if (user?.id) {
      console.log("Fetching documents for user:", user.id);
      fetchDocuments();
    }
  }, [fetchDocuments, user?.id]);

  const getDocumentById = useCallback(async (id: string): Promise<Document | null> => {
    if (currentDocument?.id === id) {
      return currentDocument;
    }
    
    try {
      await fetchDocumentById(id);
      const storeDoc = useDocumentStore.getState().currentDocument;
      return storeDoc ? adaptToMockDocument(storeDoc) : null;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }, [currentDocument, fetchDocumentById]);
  
  const handleSearch = useCallback(async (query: string): Promise<Document[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    setIsSearching(true);
    try {
      const storeResults = searchStoreDocuments(query);
      const mockResults = adaptStoreDocumentsToMockDocuments(storeResults || []);
      setSearchResults(mockResults);
      setIsSearching(false);
      return mockResults;
    } catch (error) {
      console.error('Error searching documents:', error);
      setIsSearching(false);
      return [];
    }
  }, [searchStoreDocuments]);

  // Filter documents to show only those belonging to the current user
  const userDocuments = user && documents
    ? documents.filter(doc => doc.userId === user.id)
    : [];

  return {
    documents: userDocuments,
    searchResults,
    isSearching,
    currentDocument,
    isLoading,
    error,
    fetchDocuments,
    getDocumentById,
    uploadDocument,
    generateSummary,
    generateFlashcards,
    handleSearch
  };
};
