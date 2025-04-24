
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import PDFUploader from '@/components/document/PDFUploader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { FileUp, UploadCloud, Settings, Book, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const DocumentUploadPage = () => {
  const navigate = useNavigate();
  const [processingOptions, setProcessingOptions] = useState({
    generateSummary: true,
    createFlashcards: true,
    ocrTextRecognition: true
  });
  
  const toggleOption = (option: keyof typeof processingOptions) => {
    setProcessingOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleUploadSuccess = (documentId?: string) => {
    toast({
      title: 'Document uploaded successfully',
      description: 'Your document is being processed and will appear in your library shortly.',
    });
    
    // Redirect to documents page after successful upload
    setTimeout(() => {
      navigate('/documents');
    }, 2000);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload your research papers or study materials for AI-powered processing
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Upload PDF Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PDFUploader 
                  onSuccess={handleUploadSuccess}
                  processingOptions={processingOptions} 
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Processing Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Generate Summary</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={processingOptions.generateSummary}
                        onChange={() => toggleOption('generateSummary')}
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <span>Create Flashcards</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={processingOptions.createFlashcards}
                        onChange={() => toggleOption('createFlashcards')}
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="h-4 w-4 text-primary" />
                      <span>OCR Text Recognition</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={processingOptions.ocrTextRecognition}
                        onChange={() => toggleOption('ocrTextRecognition')}
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Ensure your PDF is not password protected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>For best OCR results, upload high-resolution documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Make sure text is legible and not handwritten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Allow a few minutes for processing larger documents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default DocumentUploadPage;
