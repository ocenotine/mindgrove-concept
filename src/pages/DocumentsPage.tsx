
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/hooks/useDocuments';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Upload, Filter, Plus, MoreHorizontal, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDocumentThumbnail, generateDocumentPreview } from '@/utils/documentUtils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useDocumentStore } from '@/store/documentStore';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { documents, searchResults, isSearching, handleSearch } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { deleteDocument } = useDocumentStore();

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  const handleDocumentClick = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleDeleteDocument = async (documentId: string) => {
    const success = await deleteDocument(documentId);
    if (success) {
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = () => {
    let docs = searchQuery ? searchResults : documents;

    if (filterOption === 'summarized') {
      docs = docs.filter(doc => doc.summary);
    } else if (filterOption === 'not_summarized') {
      docs = docs.filter(doc => !doc.summary);
    }

    return docs;
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full md:w-1/2">
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-3 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center space-x-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Documents</DialogTitle>
                </DialogHeader>
                <Select value={filterOption} onValueChange={setFilterOption}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="summarized">Summarized</SelectItem>
                    <SelectItem value="not_summarized">Not Summarized</SelectItem>
                  </SelectContent>
                </Select>
              </DialogContent>
            </Dialog>

            <Button variant="secondary" className="rounded-full" onClick={() => navigate('/document/upload')}>
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
            <Button className="rounded-full" onClick={() => navigate('/document/upload')}>
              <Plus className="w-4 h-4 mr-2" /> New Document
            </Button>
          </div>
        </div>

        {isSearching && <div className="text-center">Searching...</div>}

        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of your recent documents.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Title</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments().map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-10 h-10 mr-3 flex items-center justify-center bg-muted rounded overflow-hidden">
                        <img
                          src={getDocumentThumbnail(document.fileType)}
                          alt="Document Thumbnail"
                          className="w-8 h-8 rounded-md object-contain"
                        />
                      </div>
                      <div>
                        <span
                          className="hover:underline cursor-pointer block font-medium"
                          onClick={() => handleDocumentClick(document.id)}
                        >
                          {document.title}
                        </span>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {generateDocumentPreview(document.content, 50)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(document.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{document.summary ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleDocumentClick(document.id)}>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/document/${document.id}`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteDocument(document.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDocuments().length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    {searchQuery ? 'No documents found matching your search.' : 'You have no documents yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>
                  {filteredDocuments().length} document(s)
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentsPage;
