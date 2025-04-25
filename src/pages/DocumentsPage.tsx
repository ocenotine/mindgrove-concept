import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, FileText, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuthStore } from '@/store/authStore';
import DocumentCard from '@/components/document/DocumentCard';
import UploadDocumentDialog from '@/components/document/UploadDocumentDialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { canUploadMoreDocuments } from '@/services/subscriptionService';
import { toast } from '@/components/ui/use-toast';
import EmptyState from '@/components/ui/empty-state';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { documents, isLoading, handleSearch } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof documents>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [filterVisible, setFilterVisible] = useState(false);
  const [canUpload, setCanUpload] = useState(true);

  // Check if user can upload more documents
  useEffect(() => {
    const checkUploadLimit = async () => {
      if (user) {
        const canUpload = await canUploadMoreDocuments();
        setCanUpload(canUpload);
      }
    };
    
    checkUploadLimit();
  }, [user, documents.length]);

  // Handle search
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await handleSearch(searchQuery, user?.id);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, handleSearch, user?.id]);

  // Filter and sort documents
  const getFilteredDocuments = () => {
    let filtered = [...documents];
    
    // Apply tab filter
    if (activeTab === 'pdf') {
      filtered = filtered.filter(doc => doc.fileType.toLowerCase() === 'pdf');
    } else if (activeTab === 'text') {
      filtered = filtered.filter(doc => ['txt', 'doc', 'docx'].includes(doc.fileType.toLowerCase()));
    } else if (activeTab === 'recent') {
      filtered = filtered.slice(0, 5);
    }
    
    // Apply sorting
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return filtered;
  };

  const displayedDocuments = searchQuery ? searchResults : getFilteredDocuments();

  const handleUploadClick = () => {
    if (!canUpload) {
      toast({
        title: "Upload limit reached",
        description: "You've reached your document upload limit. Please upgrade your subscription to upload more documents.",
        variant: "destructive"
      });
      return;
    }
    
    setShowUploadDialog(true);
  };

  const handleDocumentClick = (id: string) => {
    navigate(`/documents/${id}`);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" id="dashboard-header">Your Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage and analyze your research documents
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-2 top-2.5"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          <Button 
            onClick={handleUploadClick} 
            id="upload-button"
            className="whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Tabs 
          defaultValue="all" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All Documents
              </TabsTrigger>
              <TabsTrigger value="pdf" className="text-xs sm:text-sm">
                PDFs
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs sm:text-sm">
                Text Documents
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-xs sm:text-sm">
                Recent
              </TabsTrigger>
            </TabsList>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setFilterVisible(!filterVisible)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
          
          {filterVisible && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Sort by</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="name">Name (A-Z)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Documents</SelectItem>
                          <SelectItem value="analyzed">Analyzed</SelectItem>
                          <SelectItem value="not-analyzed">Not Analyzed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <TabsContent value="all" className="m-0">
            {renderDocumentGrid(displayedDocuments, isLoading, isSearching, searchQuery, handleDocumentClick)}
          </TabsContent>
          
          <TabsContent value="pdf" className="m-0">
            {renderDocumentGrid(displayedDocuments, isLoading, isSearching, searchQuery, handleDocumentClick)}
          </TabsContent>
          
          <TabsContent value="text" className="m-0">
            {renderDocumentGrid(displayedDocuments, isLoading, isSearching, searchQuery, handleDocumentClick)}
          </TabsContent>
          
          <TabsContent value="recent" className="m-0">
            {renderDocumentGrid(displayedDocuments, isLoading, isSearching, searchQuery, handleDocumentClick)}
          </TabsContent>
        </Tabs>
      </div>
      
      <UploadDocumentDialog 
        open={showUploadDialog} 
        onOpenChange={setShowUploadDialog} 
      />
    </div>
  );
};

// Helper function to render the document grid
const renderDocumentGrid = (
  documents: any[], 
  isLoading: boolean, 
  isSearching: boolean,
  searchQuery: string,
  onDocumentClick: (id: string) => void
) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (isSearching) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Searching for "{searchQuery}"...</p>
      </div>
    );
  }
  
  if (documents.length === 0) {
    if (searchQuery) {
      return (
        <EmptyState
          icon={<Search className="h-10 w-10 text-muted-foreground" />}
          title="No results found"
          description={`No documents matching "${searchQuery}" were found.`}
        />
      );
    }
    
    return (
      <EmptyState
        icon={<FileText className="h-10 w-10 text-muted-foreground" />}
        title="No documents yet"
        description="Upload your first document to get started"
        action={
          <Button id="upload-button-empty">
            <Plus className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        }
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard 
          key={doc.id} 
          document={doc} 
          onClick={() => onDocumentClick(doc.id)} 
        />
      ))}
    </div>
  );
};

export default DocumentsPage;
