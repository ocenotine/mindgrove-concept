
import { Document } from '@/utils/mockData';
import { Document as StoreDocument } from '@/store/documentStore';

// Convert a StoreDocument to a MockDocument
export const adaptToMockDocument = (storeDocument: StoreDocument): Document => {
  return {
    id: storeDocument.id,
    title: storeDocument.title,
    content: storeDocument.content || '',
    fileType: storeDocument.file_type || '',
    filePath: storeDocument.file_path || '',
    userId: storeDocument.user_id,
    createdAt: storeDocument.created_at || '',
    updatedAt: storeDocument.updated_at || '',
    summary: storeDocument.summary || ''
  };
};

// Convert an array of StoreDocuments to MockDocuments
export const adaptStoreDocumentsToMockDocuments = (storeDocuments: StoreDocument[]): Document[] => {
  return storeDocuments.map(adaptToMockDocument);
};

// Convert a MockDocument to a StoreDocument
export const adaptToStoreDocument = (mockDocument: Document): StoreDocument => {
  return {
    id: mockDocument.id,
    title: mockDocument.title,
    content: mockDocument.content || null,
    file_type: mockDocument.fileType || null,
    file_path: mockDocument.filePath || null,
    user_id: mockDocument.userId,
    created_at: mockDocument.createdAt || null,
    updated_at: mockDocument.updatedAt || null,
    summary: mockDocument.summary || null
  };
};
