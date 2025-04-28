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
