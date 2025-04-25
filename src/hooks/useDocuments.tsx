
import { useEffect, useState, useCallback } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { Document } from '@/utils/mockData';
import { useAuthStore } from '@/store/authStore';
import { getDocumentThumbnail } from '@/utils/documentUtils';

export const useDocuments = () => {
  const { user } = useAuthStore();
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    documents,
    currentDocument,
    isLoading,
    error,
    fetchDocuments,
    fetchDocumentById,
    createDocument,
    uploadDocument,
    generateSummary,
    generateFlashcards,
    searchDocuments
  } = useDocumentStore();

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
      return useDocumentStore.getState().currentDocument;
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
      const results = searchDocuments(query);
      setSearchResults(results);
      setIsSearching(false);
      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      setIsSearching(false);
      return [];
    }
  }, [searchDocuments]);

  // Filter documents to show only those belonging to the current user
  const userDocuments = user 
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
