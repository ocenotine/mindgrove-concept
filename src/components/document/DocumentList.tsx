
import React from 'react';
import { Document } from '@/utils/mockData';
import DocumentCard from '@/components/document/DocumentCard';
import { motion } from 'framer-motion';

interface DocumentListProps {
  documents: Document[];
}

const DocumentList = ({ documents }: DocumentListProps) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">No documents found</h3>
        <p className="text-sm text-muted-foreground">Upload a document or create a new one</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {documents.map((document) => (
        <motion.div
          key={document.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DocumentCard document={document} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DocumentList;
