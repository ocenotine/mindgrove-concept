
import { useState, useRef, useCallback } from 'react';
import { FileUp, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { useDocumentStore } from '@/store/documentStore';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { extractTextFromPDF } from '@/utils/documentUtils';
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentSummary, generateFlashcards } from '@/utils/openRouterUtils';
import { useDocuments } from '@/hooks/useDocuments';

const PDFUploader = ({ 
  onSuccess,
  processingOptions = {
    generateSummary: true,
    createFlashcards: true,
    ocrTextRecognition: true
  }
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuthStore();
  const { uploadDocument } = useDocumentStore();
  const { refreshDocuments } = useDocuments();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
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
    }
  };

  const ensureBucketExists = async () => {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'documents');
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket('documents', {
          public: true
        });
        
        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError);
          // Continue anyway, as the bucket might exist but not be visible
        } else {
          console.log("Created documents bucket");
        }
      }
      return true;
    } catch (bucketError) {
      console.error("Error checking/creating bucket:", bucketError);
      // Continue anyway, as this might be a permission issue but the bucket might exist
      return false;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: 'Upload failed',
        description: 'Please select a file and ensure you are logged in',
        variant: 'destructive'
      });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    try {
      // First ensure the bucket exists
      const bucketReady = await ensureBucketExists();
      if (!bucketReady) {
        throw new Error("Failed to create storage bucket");
      }
      
      setUploadProgress(20);

      let extractedText = '';
      if (processingOptions?.ocrTextRecognition) {
        try {
          extractedText = await extractTextFromPDF(selectedFile);
          setUploadProgress(40);
        } catch (error) {
          console.error("Text extraction error:", error);
        }
      }

      // Upload file to storage first
      const filePath = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;
      setUploadProgress(60);

      // Upload document to the documents table
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: selectedFile.name,
          content: extractedText,
          file_path: fileUrl,
          file_type: selectedFile.type,
          type_name: 'PDF'
        })
        .select();

      if (error) throw error;

      const newDocument = data?.[0];
      setUploadProgress(80);
      
      if (newDocument && (processingOptions.generateSummary || processingOptions.createFlashcards)) {
        try {
          const summaryPromise = processingOptions.generateSummary 
            ? generateDocumentSummary(extractedText || '')
            : Promise.resolve(null);
          
          const flashcardsPromise = processingOptions.createFlashcards
            ? generateFlashcards(extractedText || '')
            : Promise.resolve([]);

          const [summary, flashcards] = await Promise.all([summaryPromise, flashcardsPromise]);

          if (summary) {
            await supabase
              .from('documents')
              .update({ summary })
              .eq('id', newDocument.id);
          }

          if (flashcards && flashcards.length > 0) {
            const flashcardData = flashcards.map(card => ({
              document_id: newDocument.id,
              front_content: card.question,
              back_content: card.answer,
              user_id: user.id
            }));

            await supabase
              .from('flashcards')
              .insert(flashcardData);
          }
        } catch (aiError) {
          console.error("AI processing error:", aiError);
        }
      }

      // Refresh documents list
      await refreshDocuments();

      setUploadProgress(100);
      setUploadState('success');
      
      toast({
        title: 'Document uploaded successfully',
        description: 'Your document is now available in your documents list.',
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);

      if (onSuccess) {
        onSuccess(newDocument?.id);
      }

    } catch (error) {
      console.error("Upload error:", error);
      setUploadState('error');
      
      let errorMessage = "Failed to upload document";
      if (error instanceof Error) {
        if (error.message.includes("Bucket not found")) {
          errorMessage = "Storage bucket not found. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
          <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload your document</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Select a PDF file to upload
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf"
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            Browse Files
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
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-muted-foreground hover:text-foreground"
              disabled={uploadState === 'uploading' || uploadState === 'processing'}
            >
              <X className="h-5 w-5" />
            </button>
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
                    <span className="text-muted-foreground">Uploading document...</span>
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
            {['idle', 'error'].includes(uploadState) && (
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Upload Document
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
