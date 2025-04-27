
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '@/store/documentStore';
import { useAuthStore } from '@/store/authStore';
import { Progress } from '@/components/ui/progress';
import { extractTextFromPDF } from '@/utils/documentUtils';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentSummary, generateFlashcards } from '@/utils/openRouterUtils';

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadDocumentDialog = ({ isOpen, onClose }: UploadDocumentDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { fetchDocuments, refreshDocuments } = useDocuments();
  const { uploadDocument } = useDocumentStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Show warning for large PDFs
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Large Document Detected",
          description: "This document is large and may take longer to process."
        });
      }
    }
  };

  const ensureBucketExists = async () => {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'documents');
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        await supabase.storage.createBucket('documents', {
          public: true
        });
        console.log("Created documents bucket");
      }
      return true;
    } catch (error) {
      console.error("Error checking/creating bucket:", error);
      // Continue anyway as this might be a permission issue but the bucket might exist
      return true;
    }
  }

  const handleUpload = async () => {
    if (!file || !user) {
      toast({
        title: "No file selected or user not logged in",
        description: "Please select a file to upload and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      console.log("Starting document upload process...");
      
      // Ensure the storage bucket exists before uploading
      const bucketReady = await ensureBucketExists();
      if (!bucketReady) {
        throw new Error("Failed to ensure storage bucket exists");
      }
      
      // Process file content and generate summary/flashcards immediately
      let extractedText = '';
      if (file.type === 'application/pdf') {
        try {
          extractedText = await extractTextFromPDF(file);
          console.log("Extracted text from PDF, length:", extractedText.length);
        } catch (extractError) {
          console.error("Error extracting text:", extractError);
          toast({
            title: "Text extraction issue",
            description: "Could not extract text from PDF, but uploading anyway",
            variant: "default",
          });
        }
      }

      setUploadProgress(30);
      console.log("Uploading document to Supabase...");
      
      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw new Error(`Storage error: ${storageError.message}`);
      }
      
      console.log("File uploaded to storage:", storageData);
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);
        
      const fileUrl = urlData.publicUrl;
      console.log("File URL:", fileUrl);

      // Create document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          user_id: user.id,
          file_path: fileUrl,
          file_type: file.type,
          content: extractedText || null
        })
        .select()
        .single();
      
      if (documentError) {
        console.error("Error inserting document record:", documentError);
        throw new Error(`Database error: ${documentError.message}`);
      }
      
      const result = documentData;
      console.log("Document record created:", result);
      
      if (!result || !result.id) {
        throw new Error("Failed to create document record");
      }
      
      setUploadProgress(50);
      
      try {
        // Generate summary and flashcards in parallel
        const [summary, flashcards] = await Promise.all([
          generateDocumentSummary(extractedText || `Content of ${file.name}`),
          generateFlashcards(extractedText || `Content of ${file.name}`)
        ]);

        setUploadProgress(80);
        console.log("Generated summary and flashcards");

        // Update document with summary
        await supabase
          .from('documents')
          .update({ 
            summary,
            content: extractedText,
            pages: Math.ceil((extractedText?.length || 100) / 3000) // Rough estimate
          })
          .eq('id', result.id);

        console.log("Updated document with summary and content");

        // Save flashcards
        if (flashcards && flashcards.length > 0) {
          const flashcardData = flashcards.map(card => ({
            document_id: result.id,
            front_content: card.question,
            back_content: card.answer,
            user_id: user.id
          }));

          await supabase
            .from('flashcards')
            .insert(flashcardData);
            
          console.log(`Saved ${flashcards.length} flashcards`);
        }
      } catch (aiError) {
        console.error("AI processing error:", aiError);
        // Just log the error but continue, as the document upload was successful
      }

      setUploadProgress(100);
      
      // Ensure the documents list is refreshed
      await refreshDocuments();
      
      toast({
        title: "Upload successful",
        description: "Document processed with AI analysis complete",
      });
      
      // Close the dialog and navigate to the document
      onClose();
      
      // Short timeout to ensure the UI updates
      setTimeout(() => {
        navigate(`/document/${result.id}`);
      }, 500);
    } catch (error) {
      console.error("Error uploading document:", error);
      
      // Provide more specific error messages based on the error
      let errorMessage = "There was an error uploading your document";
      
      if (error instanceof Error) {
        if (error.message.includes("Storage error: Bucket not found")) {
          errorMessage = "Storage bucket not found. Please try again or contact support.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to analyze with MindGrove's AI features
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select a file to upload
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileChange}
              disabled={loading}
              className="border border-input rounded-md p-2 w-full"
            />
            {file && (
              <div className="text-sm text-muted-foreground">
                <p>Selected: {file.name}</p>
                <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress < 100 ? 'Processing and uploading...' : 'Upload complete!'}
              </p>
            </div>
          )}
          
          {file && file.size > 20 * 1024 * 1024 && (
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>This PDF is very large ({(file.size / 1024 / 1024).toFixed(2)} MB). Processing may take several minutes.</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
