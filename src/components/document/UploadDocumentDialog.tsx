
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { useDocuments } from '@/hooks/useDocuments';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documentTitle, setDocumentTitle] = useState('');
  const { uploadDocument } = useDocuments();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      if (acceptedFiles.length > 0) {
        // Use filename (without extension) as default title
        const filename = acceptedFiles[0].name;
        const title = filename.substring(0, filename.lastIndexOf('.')) || filename;
        setDocumentTitle(title);
      }
    }
  });

  const handleRemoveFile = () => {
    setFiles([]);
    setDocumentTitle('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!documentTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your document.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Upload the document
      await uploadDocument(files[0], documentTitle);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded successfully.",
      });
      
      // Reset and close dialog
      setTimeout(() => {
        setFiles([]);
        setDocumentTitle('');
        setProgress(0);
        setUploading(false);
        onOpenChange(false);
      }, 1000);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your document",
        variant: "destructive"
      });
      setProgress(0);
      setUploading(false);
    }
  };
  
  // Allow closing only if not currently uploading
  const handleOpenChange = (newOpen: boolean) => {
    if (!uploading) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload PDF, Word, or text documents to analyze and manage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {files.length > 0 ? (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{files[0].name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(files[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium">
                    {isDragActive ? "Drop the file here" : "Drag and drop file here"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, TXT up to 50MB
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm">
                  Select File
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input 
              id="title" 
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Enter document title"
              disabled={uploading}
            />
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploading</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={files.length === 0 || !documentTitle.trim() || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
