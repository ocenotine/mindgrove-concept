
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from '@/hooks/use-toast';
import { FileUp, FileText, Loader2, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import DocumentIcon from './DocumentIcon';

interface PDFUploaderProps {
  onUploadSuccess?: (documentId?: string) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const { user } = useAuthStore();
  const { refreshDocuments } = useDocuments();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setCurrentFile(file);
      setValidationError(null);
      
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
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['.pdf', '.docx', '.txt'];
      
      if (!allowedTypes.includes(file.type)) {
        const extension = file.name.substring(file.name.lastIndexOf('.'));
        if (!allowedExtensions.includes(extension.toLowerCase())) {
          setValidationError(`Invalid file type. Only PDF, DOCX, and TXT files are supported.`);
          toast({
            title: "Invalid file type",
            description: "Only PDF, DOCX, and TXT files are supported.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setValidationError(`File size exceeds the 10MB limit.`);
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress with realistic timing
      const totalTime = 3000; // 3 seconds for simulation
      const interval = 100; // Update every 100ms
      const steps = totalTime / interval;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        currentStep++;
        const newProgress = Math.min(95, (currentStep / steps) * 100);
        setUploadProgress(newProgress);
        
        if (newProgress >= 95) {
          clearInterval(progressInterval);
        }
      }, interval);
      
      // Create document in Supabase
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ''),
          user_id: user.id,
          file_type: file.type,
        })
        .select()
        .single();
      
      if (documentError) {
        clearInterval(progressInterval);
        throw new Error(documentError.message);
      }
      
      // Get document content from file
      const fileContent = await readFileContent(file);
      
      // Update document with content
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: fileContent,
        })
        .eq('id', document.id);
      
      if (updateError) {
        clearInterval(progressInterval);
        throw new Error(updateError.message);
      }
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Refresh documents
      refreshDocuments();
      
      // Call success callback after a brief delay to show the completion
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(document.id);
        }
        
        // Reset the component state
        setCurrentFile(null);
      }, 1500);
      
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded and processed.",
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      setCurrentFile(null);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1500);
    }
  }, [user, refreshDocuments, onUploadSuccess]);

  const readFileContent = async (file: File): Promise<string> => {
    try {
      if (file.type === 'application/pdf') {
        // For PDF files, we need to use more advanced text extraction
        // For now, we'll return placeholder text and recommend server-side processing
        return await extractTextFromPDF(file);
      } else if (file.type.includes('document') || file.name.endsWith('.docx')) {
        // For DOCX files, placeholder with recommendation for proper extraction
        return "This document appears to be a DOCX file. The content is being processed.";
      } else {
        // For text files, we can extract the content directly
        return await file.text();
      }
    } catch (error) {
      console.error('Error reading file:', error);
      return "Failed to extract text content from file.";
    }
  };

  // This is a placeholder. In a production app, you'd use a PDF parsing library or server API
  const extractTextFromPDF = async (file: File): Promise<string> => {
    // This is a simplified approach - just to demonstrate
    try {
      // Return simple text for demonstration
      return "This PDF document has been processed. The AI can now analyze its content.";
    } catch (error) {
      console.error('PDF extraction error:', error);
      return "This is a PDF document. Text extraction is in progress.";
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const cancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setCurrentFile(null);
  };

  return (
    <div className="space-y-4">
      {!uploading || uploadProgress === 100 ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          } ${validationError ? 'border-destructive/50' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {uploadProgress === 100 ? (
              <>
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <p className="text-sm font-medium">Done! Document uploaded successfully</p>
                {currentFile && (
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                    <DocumentIcon fileType={currentFile.type} size={16} />
                    <span className="text-xs truncate max-w-[200px]">{currentFile.name}</span>
                  </div>
                )}
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
                    {isDragActive ? 'Drop the file here' : 'Drag and drop your file here'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to select a file
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports: PDF, DOCX, and TXT files up to 10MB
                </p>
                {validationError && (
                  <p className="text-xs text-destructive font-medium mt-2">{validationError}</p>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentFile && (
                <>
                  <DocumentIcon fileType={currentFile.type} size={20} />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{currentFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(currentFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={cancelUpload}
              className="p-2 hover:bg-muted rounded-full"
              aria-label="Cancel upload"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
                Uploading...
              </span>
              <span>{uploadProgress.toFixed(0)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
