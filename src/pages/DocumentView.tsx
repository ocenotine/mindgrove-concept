
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import DocumentSummary from '@/components/document/DocumentSummary';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, BookOpen, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentAI from '@/components/document/DocumentAI';
import { Document } from '@/utils/mockData';
import { downloadDocument, getDocumentThumbnail, generateDocumentPreview } from '@/utils/documentUtils';
import FlashcardDeck from '@/components/flashcards/FlashcardDeck';
import DocumentChat from '@/components/document/DocumentChat';
import { motion } from 'framer-motion';

const DocumentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocumentById, generateSummary, generateFlashcards } = useDocuments();
  const [document, setDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState('document');
  const [documentText, setDocumentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<Array<any>>([]);
  
  useEffect(() => {
    async function loadDocument() {
      if (id) {
        setIsLoading(true);
        try {
          const doc = await getDocumentById(id);
          if (doc) {
            setDocument(doc);
            setDocumentText(doc.content || doc.description?.repeat(10) || ''); // Simulate longer text
          } else {
            toast({
              title: "Document not found",
              description: "The document you're looking for doesn't exist.",
              variant: "destructive",
            });
            navigate('/documents');
          }
        } catch (error) {
          console.error("Error loading document:", error);
          toast({
            title: "Error loading document",
            description: "Failed to load the document.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadDocument();
  }, [id, getDocumentById, navigate]);
  
  const handleSummaryGenerated = (summary: string) => {
    if (document) {
      setDocument({
        ...document,
        summary
      });
    }
  };
  
  const handleFlashcardsGenerated = (generatedFlashcards: Array<{question: string, answer: string}>) => {
    setFlashcards(generatedFlashcards.map((card, index) => ({
      id: `card-${index}`,
      question: card.question,
      answer: card.answer,
      front_content: card.question,
      back_content: card.answer,
      documentId: id || '',
      createdAt: new Date().toISOString(),
      userId: document?.userId || ''
    })));
  };

  const handleDownload = () => {
    if (document) {
      downloadDocument(document);
      toast({
        title: "Download started",
        description: "Your document is being downloaded.",
      });
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <svg className="stroke-primary" viewBox="0 0 57 57" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
              <motion.g
                fill="none"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
              >
                <path d="M28.5,1.5 L28.5,55.5" />
                <path d="M1.5,28.5 L55.5,28.5" />
                <motion.circle cx="28.5" cy="28.5" r="27" />
              </motion.g>
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">Loading document...</p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }
  
  if (!document) {
    return (
      <MainLayout>
        <PageTransition>
          <div className="flex justify-center items-center h-full">
            <p>Document not found.</p>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/documents')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Documents</span>
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{document.title}</h1>
          <p className="text-sm text-muted-foreground">
            {document.pages} pages • Last modified {new Date(document.updatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <Tabs defaultValue="document" value={activeTab} onValueChange={setActiveTab} className="w-full overflow-x-auto">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="document" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Document</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tools</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="document" className="space-y-6">
            <div className="bg-card border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted rounded-md overflow-hidden mb-6 flex items-center justify-center">
                <img 
                  src={getDocumentThumbnail(document.fileType)} 
                  alt={document.title}
                  className="h-20 w-20 object-contain"
                />
              </div>
              
              <DocumentSummary document={document} />
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg md:text-xl font-semibold">Document Preview</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{documentText}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-6">
            <DocumentAI 
              documentText={documentText}
              documentId={id || ''}
              onSummaryGenerated={handleSummaryGenerated}
              onFlashcardsGenerated={handleFlashcardsGenerated}
            />
            
            {flashcards.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold mb-4">Generated Flashcards</h3>
                <FlashcardDeck 
                  flashcards={flashcards} 
                  documentTitle={document.title}
                />
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Document Chat component */}
        <DocumentChat 
          documentText={documentText}
          documentId={id || ''}
          documentTitle={document.title}
        />
      </PageTransition>
    </MainLayout>
  );
};

export default DocumentView;
