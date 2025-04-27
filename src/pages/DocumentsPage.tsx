
import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, FileText } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentCard from '@/components/document/DocumentCard';
import UploadDocumentDialog from '@/components/document/UploadDocumentDialog';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { documents, isLoading, searchResults, handleSearch, isSearching, refreshDocuments, isRefreshing } = useDocuments();
  const [hasSearched, setHasSearched] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { user } = useAuthStore();
  
  // Force refresh when the component mounts, only once
  useEffect(() => {
    let isMounted = true;
    
    const loadDocuments = async () => {
      try {
        await refreshDocuments();
        if (isMounted) {
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error refreshing documents:', error);
        if (isMounted) {
          toast({
            title: "Error loading documents",
            description: "Please try refreshing the page",
            variant: "destructive"
          });
        }
      }
    };
    
    if (user?.id && !dataLoaded) {
      console.log("Loading documents for user:", user.id);
      loadDocuments();
    }
    
    return () => {
      isMounted = false;
    };
  }, [refreshDocuments, user?.id, dataLoaded]);
  
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      setHasSearched(true);
    }
  }, [searchQuery, handleSearch]);
  
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setHasSearched(false);
  }, []);
  
  const displayDocuments = hasSearched ? searchResults : documents;
  
  const handleUploadSuccess = useCallback(() => {
    refreshDocuments();
    toast({
      title: "Document uploaded successfully",
      description: "Your document has been processed and is now available.",
    });
  }, [refreshDocuments]);
  
  // Prevent flickering by waiting for data to be loaded
  const isInitialLoading = isLoading && !dataLoaded;

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-3xl font-bold">Documents</h1>
            <div className="flex gap-2">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center flex-1">
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-8 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          
          {isInitialLoading || isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} className="h-48" />
              ))}
            </div>
          ) : displayDocuments && displayDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-6">
                {hasSearched ? 
                  `No results found for "${searchQuery}". Try a different search.` : 
                  "Upload your first document to get started with AI analysis"}
              </p>
              {!hasSearched && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload a document
                </Button>
              )}
            </div>
          )}
        </div>
        
        <UploadDocumentDialog 
          isOpen={isUploadDialogOpen} 
          onClose={() => {
            setIsUploadDialogOpen(false);
            refreshDocuments(); // Refresh documents when the dialog is closed
          }}
        />
      </PageTransition>
    </MainLayout>
  );
};

export default DocumentsPage;
