
import { useEffect, useState, useCallback } from 'react';
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

  // Add refreshDocuments function with improved error handling
  const refreshDocuments = useCallback(async () => {
    if (!user?.id) {
      console.log("Cannot refresh documents: No authenticated user");
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
  }, [user?.id, fetchDocuments]);

  const handleSearch = useCallback(async (query: string): Promise<Document[]> => {
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
      console.log("No user ID available for document subscription");
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
          console.log("Document change detected:", payload.eventType, payload);
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
  }, [user?.id, refreshDocuments]);

  // Initial fetch of documents with improved logging
  useEffect(() => {
    if (user?.id && documents.length === 0 && !isLoading) {
      console.log("Initial document fetch for user:", user.id);
      refreshDocuments();
    }
  }, [user?.id, documents.length, isLoading, refreshDocuments]);

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
