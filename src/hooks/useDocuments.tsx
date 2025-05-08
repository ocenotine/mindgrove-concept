
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

  // Add refreshDocuments function
  const refreshDocuments = useCallback(async () => {
    if (!user?.id) {
      console.log("Cannot refresh documents: No authenticated user");
      return;
    }
    
    setIsRefreshing(true);
    try {
      await fetchDocuments();
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
  
  // Set up realtime subscription for document updates
  useEffect(() => {
    if (!user?.id) return;
    
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
        () => {
          refreshDocuments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshDocuments]);

  useEffect(() => {
    if (user?.id && documents.length === 0 && !isLoading) {
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
