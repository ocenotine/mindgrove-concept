import { Document } from '@/utils/mockData';

// Map file types to icon names or paths
const fileTypeIcons = {
  'PDF': '/icons/pdf.svg',
  'DOCX': '/icons/word.svg',
  'DOC': '/icons/word.svg',
  'TXT': '/icons/text.svg',
  'default': '/icons/document.svg',
};

// Get the appropriate icon for a document based on its file type
export const getDocumentThumbnail = (fileType?: string): string => {
  if (!fileType) return fileTypeIcons.default;
  
  const normalizedType = fileType.toUpperCase();
  return fileTypeIcons[normalizedType as keyof typeof fileTypeIcons] || fileTypeIcons.default;
};

// Add downloadDocument function
export const downloadDocument = (document: any) => {
  // Get document content
  const content = document.content || '';
  
  // Create blob with document content
  const blob = new Blob([content], { type: 'text/plain' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${document.title || 'document'}.txt`;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
