
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDocumentStore, Document } from '@/store/documentStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useDocuments = () => {
  const { user } = useAuthStore();
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    documents,
    currentDocument,
    fetchDocuments,
    searchDocuments,
    fetchDocumentById,
    addDocument,
    isLoading
  } = useDocumentStore();

  // Create refresh token (changes when user changes)
  const refreshToken = useMemo(() => user?.id, [user?.id]);

  // Add refreshDocuments function with improved error handling and debouncing
  const refreshDocuments = useCallback(async () => {
    if (!user?.id) {
      console.log("Cannot refresh documents: No authenticated user");
      return;
    }
    
    // Prevent multiple refreshes happening at the same time
    if (isRefreshing) {
      return;
    }
    
    setIsRefreshing(true);
    try {
      console.log("Refreshing documents for user:", user.id);
      await fetchDocuments();
      console.log("Documents refreshed successfully:", Date.now());
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
  }, [user?.id, fetchDocuments, isRefreshing]);

  const handleSearch = useCallback(async (query: string): Promise<Document[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    setIsSearching(true);
    
    try {
      const results = searchDocuments(query);
      setSearchResults(results);
      return results;
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
  }, [searchDocuments]);
  
  // Set up realtime subscription for document updates with improved logging
  useEffect(() => {
    if (!user?.id) {
      return;
    }
    
    console.log("Setting up realtime subscription for documents for user:", user.id);
    
    const channel = supabase
      .channel('document-changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Document change detected:", payload.eventType);
          refreshDocuments();
        }
      )
      .subscribe((status) => {
        console.log("Document subscription status:", status);
      });
    
    return () => {
      console.log("Cleaning up document subscription");
      supabase.removeChannel(channel);
    };
  }, [refreshToken, refreshDocuments]);

  // Initial fetch of documents with improved logging
  useEffect(() => {
    if (user?.id && documents.length === 0 && !isLoading) {
      console.log("Initial document fetch for user:", user.id);
      refreshDocuments();
    }
  }, [refreshToken, documents.length, isLoading, refreshDocuments]);

  return {
    documents,
    searchResults,
    isSearching,
    currentDocument,
    lastRefresh,
    isRefreshing,
    isLoading,
    refreshDocuments,
    fetchDocumentById,
    addDocument,
    handleSearch
  };
};
