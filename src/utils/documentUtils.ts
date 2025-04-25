
import { Document } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';

// File type icons
const PDF_ICON = '/icons/pdf-icon.png';
const DOCX_ICON = '/icons/docx-icon.png';
const TXT_ICON = '/icons/txt-icon.png';
const DEFAULT_ICON = '/icons/file-icon.png';

export const getDocumentThumbnail = (fileType: string): string => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return PDF_ICON;
    case 'docx':
    case 'doc':
      return DOCX_ICON;
    case 'txt':
      return TXT_ICON;
    default:
      return DEFAULT_ICON;
  }
};

export const downloadDocument = async (document: Document): Promise<void> => {
  try {
    // In a real implementation, this would fetch the actual file from storage
    // For now, we'll simulate a download by creating a text file with the content
    const blob = new Blob([document.content || "Document content not available"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${document.title}.${document.fileType.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download successful",
      description: `${document.title} has been downloaded to your device.`,
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    toast({
      title: "Download failed",
      description: "There was an error downloading the document.",
      variant: "destructive",
    });
  }
};

export const generateDocumentPreview = (document: Document): string => {
  if (!document.content) {
    return "No content available for preview";
  }
  
  return document.content;
};

export const getDocumentPageCount = (document: Document): number => {
  if (!document || !document.content) return 0;
  
  // Get estimated page count based on content length
  // Assuming approximately 3000 characters per page for a rough estimate
  const charactersPerPage = 3000;
  const contentLength = document.content.length;
  
  // Calculate page count, minimum 1 page
  const calculatedPages = Math.ceil(contentLength / charactersPerPage);
  
  // For PDF documents, use the stored page count if available
  if (document.fileType.toLowerCase() === 'pdf' && document.pages) {
    return document.pages;
  }
  
  // For other document types, use the calculated count or a default
  return calculatedPages > 0 ? calculatedPages : 1;
};

export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};
