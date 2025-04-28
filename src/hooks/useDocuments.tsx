
import { useEffect, useState, useCallback } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { Document } from '@/utils/mockData';
import { useAuthStore } from '@/store/authStore';
import { adaptToMockDocument, adaptStoreDocumentsToMockDocuments } from '@/utils/documentAdapter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useDocuments = () => {
  const { user } = useAuthStore();
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    documents: storeDocuments,
    currentDocument: storeCurrentDocument,
    fetchDocuments: storeFetchDocuments,
    searchDocuments: searchStoreDocuments,
    fetchDocumentById: storeFetchDocumentById,
    addDocument: storeAddDocument
  } = useDocumentStore();

  // Adapt store documents to mock documents
  const documents = adaptStoreDocumentsToMockDocuments(storeDocuments || []);
  const currentDocument = storeCurrentDocument ? adaptToMockDocument(storeCurrentDocument) : null;

  // Add refreshDocuments function
  const refreshDocuments = useCallback(async () => {
    if (!user?.id) {
      console.warn("Cannot refresh documents: No authenticated user");
      return;
    }
    
    setIsRefreshing(true);
    try {
      await storeFetchDocuments();
      setLastRefresh(Date.now());
    } catch (error) {
      console.error("Error refreshing documents:", error);
      toast({
        title: "Error refreshing documents",
        description: "Failed to fetch your latest documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, storeFetchDocuments]);

  const fetchDocumentById = useCallback(async (id: string) => {
    try {
      const document = await storeFetchDocumentById(id);
      return document ? adaptToMockDocument(document) : null;
    } catch (error) {
      console.error("Error fetching document by ID:", error);
      toast({
        title: "Error fetching document",
        description: "Failed to load the document. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [storeFetchDocumentById]);

  const handleSearch = useCallback(async (query: string): Promise<Document[]> => {
    setIsSearching(true);
    
    try {
      const storeResults = searchStoreDocuments(query);
      const mockResults = adaptStoreDocumentsToMockDocuments(storeResults);
      setSearchResults(mockResults);
      return mockResults;
    } catch (error) {
      console.error("Error searching documents:", error);
      toast({
        title: "Search error",
        description: "An error occurred while searching documents.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [searchStoreDocuments]);

  const addDocument = useCallback(async (document: any) => {
    return storeAddDocument(document);
  }, [storeAddDocument]);

  useEffect(() => {
    if (user?.id) {
      refreshDocuments();
    }
  }, [user?.id, refreshDocuments]);

  return {
    documents,
    searchResults,
    isSearching,
    currentDocument,
    lastRefresh,
    isRefreshing,
    refreshDocuments,
    fetchDocumentById,
    addDocument,
    handleSearch
  };
};
