
import { Document } from '@/store/documentStore';

// Convert a StoreDocument to a display Document with all necessary fields
export const adaptToMockDocument = (storeDocument: Document): Document => {
  return storeDocument;
};

// Convert an array of StoreDocuments to Documents
export const adaptStoreDocumentsToMockDocuments = (storeDocuments: Document[]): Document[] => {
  return storeDocuments;
};

// Convert a Document to a StoreDocument
export const adaptToStoreDocument = (document: Document): Document => {
  return document;
};
