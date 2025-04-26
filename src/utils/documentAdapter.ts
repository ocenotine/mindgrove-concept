
import { Document as MockDocument } from '@/utils/mockData';
import { Document as StoreDocument } from '@/store/documentStore';

/**
 * Adapts a document from the store format to the mock format
 */
export function adaptToMockDocument(doc: StoreDocument): MockDocument {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content || '',
    summary: doc.summary || '',
    createdAt: doc.created_at || new Date().toISOString(),
    updatedAt: doc.updated_at || new Date().toISOString(),
    userId: doc.user_id,
    fileType: doc.file_type || '',
    description: doc.content?.substring(0, 100) || '',
    pages: 1,
    lastAccessed: doc.updated_at || new Date().toISOString(),
    tags: []
  };
}

/**
 * Adapts a document from the mock format to the store format
 */
export function adaptToStoreDocument(doc: MockDocument): StoreDocument {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    summary: doc.summary,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
    user_id: doc.userId,
    file_path: doc.fileType ? `documents/${doc.userId}/${doc.id}.${doc.fileType}` : null,
    file_type: doc.fileType || null
  };
}

/**
 * Convert an array of store documents to mock documents
 */
export function adaptStoreDocumentsToMockDocuments(docs: StoreDocument[]): MockDocument[] {
  return docs.map(adaptToMockDocument);
}

/**
 * Convert an array of mock documents to store documents
 */
export function adaptMockDocumentsToStoreDocuments(docs: MockDocument[]): StoreDocument[] {
  return docs.map(adaptToStoreDocument);
}
