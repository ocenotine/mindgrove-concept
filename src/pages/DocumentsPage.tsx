
import { useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentList from '@/components/document/DocumentList';
import UploadDocumentDialog from '@/components/document/UploadDocumentDialog';
import DocumentSearchInput from '@/components/document/DocumentSearchInput';
import PDFUploader from '@/components/document/PDFUploader';
import DocumentCardSkeleton from '@/components/document/DocumentCardSkeleton';
import { Button } from '@/components/ui/button';
import { Plus, Upload, RefreshCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function DocumentsPage() {
  const { documents, searchResults, isSearching, handleSearch, refreshDocuments, isRefreshing, isLoading } = useDocuments();

  useEffect(() => {
    // Refresh documents when page loads
    refreshDocuments();
  }, [refreshDocuments]);

  const handleRefresh = useCallback(() => {
    refreshDocuments();
    toast({
      title: "Refreshing documents",
      description: "Your documents are being refreshed from the database."
    });
  }, [refreshDocuments]);

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Documents</h1>
              <p className="text-muted-foreground">
                Upload, create, and manage your study materials
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <UploadDocumentDialog />
            </div>
          </div>
          
          <div className="mb-8">
            <DocumentSearchInput onSearch={handleSearch} isSearching={isSearching} />
          </div>
          
          {/* PDF Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload PDF Document
            </h2>
            <PDFUploader />
          </div>
          
          {/* Document List */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Your Documents
            </h2>
            
            {isLoading || isRefreshing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <DocumentCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <DocumentList documents={documents} />
            )}
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
