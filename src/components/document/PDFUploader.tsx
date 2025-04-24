
import { useState, useRef } from 'react';
import { FileUp, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { useDocumentStore } from '@/store/documentStore';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface ProcessingOptions {
  generateSummary: boolean;
  createFlashcards: boolean;
  ocrTextRecognition: boolean;
}

interface PDFUploaderProps {
  onSuccess?: (documentId?: string) => void;
  processingOptions?: ProcessingOptions;
}

const PDFUploader = ({ 
  onSuccess,
  processingOptions = {
    generateSummary: true,
    createFlashcards: true,
    ocrTextRecognition: true
  }
}: PDFUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument, isLoading, fetchDocuments } = useDocumentStore();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedFile(file);
    setUploadState('idle');
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploadState('uploading');
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      console.log("Uploading document with processing options:", processingOptions);
      
      const document = await uploadDocument(selectedFile);
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadState('success');
      
      await fetchDocuments();
      
      toast({
        title: 'Document uploaded successfully',
        description: 'Your document is being processed.',
      });
      
      if (onSuccess && document) {
        setTimeout(() => {
          console.log("Calling onSuccess with document ID:", document.id);
          onSuccess(document.id);
        }, 2000);
      }
      
    } catch (error) {
      clearInterval(interval);
      setUploadState('error');
      console.error("Upload error:", error);
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload your document</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Drag and drop your PDF file here, or click to browse
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="relative"
          >
            Browse Files
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf"
              className="sr-only"
            />
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-muted rounded mr-4">
                <File className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{selectedFile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeSelectedFile}
              className="text-muted-foreground hover:text-foreground"
              disabled={uploadState === 'uploading'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={processingOptions?.generateSummary ? "text-primary" : "text-muted-foreground"}>
                    {processingOptions?.generateSummary ? "✓" : "○"} Generate Summary
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={processingOptions?.createFlashcards ? "text-primary" : "text-muted-foreground"}>
                    {processingOptions?.createFlashcards ? "✓" : "○"} Create Flashcards
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {uploadState !== 'idle' && (
            <div className="mb-4">
              <Progress 
                value={uploadProgress} 
                className="h-2" 
                indicatorClassName={
                  uploadState === 'error' 
                    ? 'bg-red-500' 
                    : uploadState === 'success' 
                      ? 'bg-green-500' 
                      : undefined
                }
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-sm">
                  {uploadState === 'uploading' && (
                    <span className="text-muted-foreground">Uploading...</span>
                  )}
                  {uploadState === 'success' && (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Upload complete
                    </span>
                  )}
                  {uploadState === 'error' && (
                    <span className="text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Upload failed
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            {uploadState === 'idle' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={removeSelectedFile}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  isLoading={isLoading}
                >
                  Upload Document
                </Button>
              </>
            )}
            {uploadState === 'error' && (
              <Button 
                onClick={handleUpload}
                variant="outline"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Supported document:</p>
        <ul className="list-disc list-inside">
          <li>PDF documents up to 50MB</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFUploader;
