
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadDocumentDialog = ({ isOpen, onClose }: UploadDocumentDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { uploadDocument } = useDocuments();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Check if file is allowed
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'md'];
      
      if (!allowedTypes.includes(fileExt)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, TXT, or MD file",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Upload document
      const result = await uploadDocument(file);
      
      if (result?.id) {
        toast({
          title: "Upload successful",
          description: "Your document has been uploaded successfully",
        });
        
        // Navigate to the document page
        navigate(`/document/${result.id}`);
        onClose();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
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
              className="border border-gray-300 rounded-md p-2"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

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
