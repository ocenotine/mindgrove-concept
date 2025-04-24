
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Download, Edit, Share2, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '@/store/documentStore';
import { Document } from '@/utils/mockData';
import { downloadDocument } from '@/utils/documentUtils';

interface DocumentMenuProps {
  document: Document;
  onOpenChange?: (open: boolean) => void;
}

const DocumentMenu = ({ document, onOpenChange }: DocumentMenuProps) => {
  const navigate = useNavigate();
  const { deleteDocument } = useDocumentStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await deleteDocument(document.id);
      toast({
        title: 'Document deleted',
        description: 'Document has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    downloadDocument(document);
    toast({
      title: 'Download started',
      description: 'Your document is being downloaded.'
    });
  };

  const handleOpenDocument = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/document/${document.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // This would navigate to an edit page in a real app
    toast({
      title: 'Edit mode',
      description: 'Document edit feature coming soon.'
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // This would open a share dialog in a real app
    toast({
      title: 'Share document',
      description: 'Document sharing feature coming soon.'
    });
  };

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleOpenDocument} className="cursor-pointer">
          <BookOpen className="h-4 w-4 mr-2" />
          <span>Open</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          <span>Download</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
          <Edit className="h-4 w-4 mr-2" />
          <span>Edit details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share2 className="h-4 w-4 mr-2" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer focus:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DocumentMenu;
