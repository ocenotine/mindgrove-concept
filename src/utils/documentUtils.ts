
import { Document } from "./mockData";
import { FileText, FileImage, FileArchive } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
const pdfWorkerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

/**
 * Get file icon based on file type
 */
export const getFileIcon = (fileType: string | null | undefined) => {
  if (!fileType) return FileText;
  
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('image')) return FileImage;
  return FileArchive;
};

/**
 * Download document content
 */
export const downloadDocument = (document: Document) => {
  if (!document) return;
  
  // Create blob from document content
  const blob = new Blob([document.content || ''], { type: document.fileType || 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create anchor element for download
  const a = window.document.createElement('a');
  a.href = url;
  a.download = document.title || 'document.txt';
  window.document.body.appendChild(a);
  a.click();
  
  // Clean up
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Get appropriate document thumbnail based on file type
 */
export const getDocumentThumbnail = (fileType: string | null | undefined) => {
  if (!fileType) return 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7';
  
  // Return appropriate icon based on file type
  if (fileType.includes('pdf')) {
    return '/document-icons/pdf-icon.svg';
  } else if (fileType.includes('doc') || fileType.includes('word')) {
    return '/document-icons/doc-icon.svg';
  } else if (fileType.includes('xls') || fileType.includes('sheet')) {
    return '/document-icons/xls-icon.svg';
  } else if (fileType.includes('ppt') || fileType.includes('presentation')) {
    return '/document-icons/ppt-icon.svg';
  } else if (fileType.includes('image')) {
    return '/document-icons/image-icon.svg';
  } else if (fileType.includes('text')) {
    return '/document-icons/txt-icon.svg';
  }
  
  // Default
  return '/document-icons/generic-icon.svg';
};

/**
 * Generate a text preview from document content
 */
export const generateDocumentPreview = (content: string, maxLength: number = 200): string => {
  if (!content) return "No content available";
  
  // Strip any HTML tags if present
  const strippedContent = content.replace(/<[^>]*>?/gm, '');
  
  // Return a limited preview
  if (strippedContent.length <= maxLength) return strippedContent;
  
  return strippedContent.substring(0, maxLength) + '...';
};

/**
 * Create a canvas element (browser API)
 */
const createCanvas = (): HTMLCanvasElement => {
  return window.document.createElement('canvas');
};

/**
 * Create document thumbnail from content
 */
export const createContentThumbnail = (doc: Document): string => {
  // If we already have a thumbnail, use it
  if (doc.thumbnail) return doc.thumbnail;
  
  // If it's an image type, use the image icon
  if (doc.fileType?.includes('image')) {
    return '/document-icons/image-icon.svg';
  }
  
  try {
    // For text content, create a preview box with the first few lines
    const canvas = createCanvas();
    canvas.width = 400;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return getDocumentThumbnail(doc.fileType);
    
    // Draw background
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Draw text preview
    ctx.font = '14px Arial';
    ctx.fillStyle = '#1f2937';
    
    const preview = generateDocumentPreview(doc.content, 150);
    const lines = preview.split('\n');
    let y = 40;
    
    // Draw document title
    ctx.font = 'bold 18px Arial';
    ctx.fillText(doc.title || 'Untitled Document', 20, y);
    y += 30;
    
    // Draw preview text
    ctx.font = '14px Arial';
    lines.slice(0, 6).forEach(line => {
      ctx.fillText(line.substring(0, 45), 20, y);
      y += 20;
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return getDocumentThumbnail(doc.fileType);
  }
};
