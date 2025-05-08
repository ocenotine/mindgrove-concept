
import React from 'react';
import { Document } from '@/store/documentStore';
import DocumentCard from '@/components/document/DocumentCard';
import { motion } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DocumentListProps {
  documents: Document[];
}

const DocumentList = ({ documents }: DocumentListProps) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No documents found</h3>
        <p className="text-sm text-muted-foreground mb-6">Upload a document or create a new one to get started</p>
        <div className="flex justify-center gap-4">
          <Link to="/document/upload">
            <Button variant="default">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </Link>
          <Link to="/documents/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </Link>
        </div>
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
