
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentCard from '@/components/document/DocumentCard';
import UploadDocumentDialog from '@/components/document/UploadDocumentDialog';
import SkeletonLoader from '@/components/common/SkeletonLoader';

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { documents, isLoading, searchResults, handleSearch, isSearching } = useDocuments();
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      setHasSearched(true);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
  };
  
  const displayDocuments = hasSearched ? searchResults : documents;

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
          
          {isLoading || isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} className="h-48" />
              ))}
            </div>
          ) : displayDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FileIcon className="h-10 w-10 text-muted-foreground" />
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
          onClose={() => setIsUploadDialogOpen(false)}
        />
      </PageTransition>
    </MainLayout>
  );
};

// FileIcon component
const FileIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export default DocumentsPage;
