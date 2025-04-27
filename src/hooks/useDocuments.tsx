
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
    searchDocuments: searchStoreDocuments
  } = useDocumentStore();

  // Adapt store documents to mock documents
  const documents = adaptStoreDocumentsToMockDocuments(storeDocuments || []);
  const currentDocument = storeCurrentDocument ? adaptToMockDocument(storeCurrentDocument) : null;

  // Add refreshDocuments function that was missing
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

  // Initial fetch of documents
  useEffect(() => {
    if (user?.id && storeDocuments.length === 0) {
      refreshDocuments();
    }
  }, [user?.id, storeDocuments.length, refreshDocuments]);

  const handleSearch = useCallback(async (query: string): Promise<Document[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    setIsSearching(true);
    try {
      // First, try searching in the local store
      const storeResults = searchStoreDocuments(query);
      const mockResults = adaptStoreDocumentsToMockDocuments(storeResults || []);
      
      // If no local results, search in Supabase
      if (mockResults.length === 0 && user?.id) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`);
        
        if (error) throw error;
        
        const supabaseResults = data?.map(adaptToMockDocument) || [];
        setSearchResults(supabaseResults);
        return supabaseResults;
      }
      
      setSearchResults(mockResults);
      setIsSearching(false);
      return mockResults;
    } catch (error) {
      console.error('Error searching documents:', error);
      setIsSearching(false);
      return [];
    }
  }, [searchStoreDocuments, user?.id]);

  return {
    ...useDocumentStore(),
    documents,
    searchResults,
    isSearching,
    currentDocument,
    handleSearch,
    lastRefresh,
    refreshDocuments,
    isRefreshing
  };
};
