
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from '@/components/ui/use-toast';
import { FileUp, FileText, Loader2 } from 'lucide-react';

interface PDFUploaderProps {
  onUploadSuccess?: (documentId?: string) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuthStore();
  const { refreshDocuments, addDocument } = useDocuments();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload documents.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are supported.",
          variant: "destructive",
        });
        return;
      }
      
      setUploading(true);
      
      // Create document in Supabase
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          title: file.name.replace('.pdf', ''),
          user_id: user.id,
          file_type: file.type,
        })
        .select()
        .single();
      
      if (documentError) {
        throw new Error(documentError.message);
      }
      
      // Get document content from PDF
      const pdfContent = await readPdfContent(file);
      
      // Update document with content
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: pdfContent,
        })
        .eq('id', document.id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Refresh documents
      refreshDocuments();
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(document.id);
      }
      
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded successfully.",
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [user, refreshDocuments, onUploadSuccess]);

  const readPdfContent = async (file: File): Promise<string> => {
    try {
      // For now, just return a placeholder
      // In a real implementation, you would use PDF.js or a similar library to extract text
      return "This is the extracted content from the PDF document.";
    } catch (error) {
      console.error('Error reading PDF:', error);
      return "Failed to extract text content from PDF.";
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading document...</p>
          </>
        ) : (
          <>
            {isDragActive ? (
              <FileUp className="h-10 w-10 text-primary" />
            ) : (
              <FileText className="h-10 w-10 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop the PDF here' : 'Drag and drop your PDF here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to select a file
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports: PDF files up to 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
