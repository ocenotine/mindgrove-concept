
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Check, AlertCircle } from 'lucide-react';
import PDFUploader from '@/components/document/PDFUploader';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ApiKeyReminder from '@/components/document/ApiKeyReminder';
import { useAuthStore } from '@/store/authStore';
import { getOpenRouterApiKey } from '@/utils/openRouterUtils';

export default function DocumentUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | undefined>(undefined);
  
  const [processing, setProcessing] = useState({
    generateSummary: true,
    createFlashcards: true,
    ocrTextRecognition: true
  });
  
  const handleUploadSuccess = (documentId?: string) => {
    setUploadSuccess(true);
    setUploadedDocumentId(documentId);
    
    toast({
      title: "Document uploaded successfully",
      description: "Your document has been uploaded and processed.",
    });
  };
  
  const handleViewDocument = () => {
    if (uploadedDocumentId) {
      navigate(`/document/${uploadedDocumentId}`);
    }
  };
  
  const handleToggleProcessing = (key: keyof typeof processing) => {
    setProcessing(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const hasApiKey = !!getOpenRouterApiKey();
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
          <p className="text-muted-foreground mb-8">Upload and process your study materials</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload PDF Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {uploadSuccess ? (
                    <div className="text-center py-8">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
                        <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                      </div>
                      <h3 className="text-lg font-medium">Document uploaded successfully!</h3>
                      <p className="text-muted-foreground mt-2 mb-4">Your document has been processed and is ready to view.</p>
                      <Button onClick={handleViewDocument}>View Document</Button>
                    </div>
                  ) : (
                    <PDFUploader
                      onUploadSuccess={handleUploadSuccess}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {!hasApiKey && <ApiKeyReminder />}
              
              <Card>
                <CardHeader>
                  <CardTitle>Processing Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label 
                          htmlFor="summary"
                          className="text-base"
                        >
                          Generate Summary
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Create an AI summary of the document
                        </p>
                      </div>
                      <Switch
                        id="summary"
                        checked={processing.generateSummary}
                        onCheckedChange={() => handleToggleProcessing('generateSummary')}
                        disabled={!hasApiKey}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label 
                          htmlFor="flashcards"
                          className="text-base"
                        >
                          Create Flashcards
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Generate study flashcards from the content
                        </p>
                      </div>
                      <Switch
                        id="flashcards"
                        checked={processing.createFlashcards}
                        onCheckedChange={() => handleToggleProcessing('createFlashcards')}
                        disabled={!hasApiKey}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label 
                          htmlFor="ocr"
                          className="text-base"
                        >
                          OCR Recognition
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Extract text from scanned documents
                        </p>
                      </div>
                      <Switch
                        id="ocr"
                        checked={processing.ocrTextRecognition}
                        onCheckedChange={() => handleToggleProcessing('ocrTextRecognition')}
                        disabled={!hasApiKey}
                      />
                    </div>
                    
                    {!hasApiKey && (
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-3 rounded-md mt-2">
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-2" />
                          <p className="text-xs text-amber-800 dark:text-amber-300">
                            Add an API key to enable advanced document processing
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
