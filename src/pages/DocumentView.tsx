
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, BookOpen, Download, Sparkles, PenTool, Loader } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentSummary, generateFlashcards, getOpenRouterApiKey } from '@/utils/openRouterUtils';
import DocumentChat from '@/components/document/DocumentChat';
import FlashcardDeck from '@/components/flashcards/FlashcardDeck';

const DocumentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDocumentById } = useDocuments();
  const [document, setDocument] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('document');
  const [documentText, setDocumentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<Array<any>>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [summary, setSummary] = useState<string>('');
  
  useEffect(() => {
    async function loadDocument() {
      if (id) {
        setIsLoading(true);
        try {
          // Get document from Supabase
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          if (data) {
            setDocument(data);
            setDocumentText(data.content || data.summary || 'No content available for this document.');
            if (data.summary) {
              setSummary(data.summary);
            }
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
    
    // Set up real-time listener for document updates
    if (id) {
      const channel = supabase
        .channel(`document_${id}`)
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public',
            table: 'documents',
            filter: `id=eq.${id}`
          },
          (payload) => {
            setDocument(payload.new);
            setDocumentText(payload.new.content || payload.new.summary || 'No content available');
            if (payload.new.summary) {
              setSummary(payload.new.summary);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, navigate]);
  
  useEffect(() => {
    // Load flashcards if document exists
    async function loadFlashcards() {
      if (id) {
        try {
          const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('document_id', id);
            
          if (error) throw error;
          if (data && data.length > 0) {
            setFlashcards(data);
          }
        } catch (error) {
          console.error("Error loading flashcards:", error);
        }
      }
    }
    
    loadFlashcards();
  }, [id]);
  
  const handleSummaryGenerated = async (newSummary: string) => {
    if (document && id) {
      try {
        const { error } = await supabase
          .from('documents')
          .update({ summary: newSummary })
          .eq('id', id);
          
        if (error) throw error;
        
        setDocument({
          ...document,
          summary: newSummary
        });
        
        setSummary(newSummary);
        
        toast({
          title: "Summary saved",
          description: "The summary has been saved to your document.",
        });
      } catch (error) {
        console.error("Error updating document summary:", error);
        toast({
          title: "Error",
          description: "Failed to save the summary to the database.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleGenerateSummary = async () => {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenRouter API key in the settings to use the AI features.",
        variant: "destructive"
      });
      return;
    }
    
    if (!documentText || documentText.trim().length < 10) {
      toast({
        title: "Insufficient Content",
        description: "This document doesn't have enough content to generate a summary.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingSummary(true);
    try {
      console.log("Starting summary generation with text length:", documentText.length);
      
      // Use the OpenRouter utility
      const result = await generateDocumentSummary(documentText);
      console.log("Summary generation successful, length:", result.length);
      setSummary(result);
      
      // Save summary to document
      handleSummaryGenerated(result);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast({
        title: 'Summary generation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  const handleGenerateFlashcards = async () => {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenRouter API key in the settings to use the AI features.",
        variant: "destructive"
      });
      return;
    }
    
    if (!documentText || documentText.trim().length < 10) {
      toast({
        title: "Insufficient Content",
        description: "This document doesn't have enough content to generate flashcards.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingFlashcards(true);
    try {
      console.log("Starting flashcard generation with text length:", documentText.length);
      
      // Use the OpenRouter utility
      const result = await generateFlashcards(documentText);
      console.log("Flashcard generation successful, count:", result.length);
      
      // Save flashcards to database
      if (id && document?.user_id) {
        for (const card of result) {
          const { error } = await supabase
            .from('flashcards')
            .insert({
              document_id: id,
              front_content: card.question,
              back_content: card.answer,
              user_id: document.user_id
            });
            
          if (error) console.error("Error saving flashcard:", error);
        }
        
        // Load updated flashcards
        const { data: updatedFlashcards } = await supabase
          .from('flashcards')
          .select('*')
          .eq('document_id', id);
          
        if (updatedFlashcards) {
          setFlashcards(updatedFlashcards);
        }
      } else {
        // Just store in state if we can't save to DB
        setFlashcards(result.map((card, index) => ({
          id: `temp-${index}`,
          front_content: card.question,
          back_content: card.answer,
          document_id: id
        })));
      }
      
      toast({
        title: 'Flashcards generated',
        description: `${result.length} flashcards have been created`,
      });
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      toast({
        title: 'Flashcard generation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleDownload = () => {
    if (document && document.file_path) {
      // Open the file URL in a new tab
      window.open(document.file_path, '_blank');
      
      toast({
        title: "Download started",
        description: "Your document is being downloaded.",
      });
    } else {
      toast({
        title: "Download failed",
        description: "Document file not available.",
        variant: "destructive"
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
              disabled={!document.file_path}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{document.title}</h1>
          <p className="text-sm text-muted-foreground">
            Last modified {new Date(document.updated_at).toLocaleDateString()}
          </p>
        </div>
        
        <Tabs defaultValue="document" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                {document.file_path && (
                  <img 
                    src={document.file_path} 
                    alt={document.title}
                    className="h-20 w-20 object-contain"
                  />
                )}
              </div>
              
              {summary ? (
                <Card className="mb-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      AI-Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-line bg-muted/50 p-4 rounded-md">
                      {summary}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        No summary available for this document yet.
                      </p>
                      <Button onClick={handleGenerateSummary}>Generate Summary</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg md:text-xl font-semibold">Document Preview</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{documentText}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Tools
                </CardTitle>
                <CardDescription>
                  Using AI to enhance your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingSummary ? <Loader className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                    {isGeneratingSummary ? "Generating Summary..." : "Generate Summary"}
                  </Button>
                  
                  <Button
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    {isGeneratingFlashcards ? <Loader className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
                    {isGeneratingFlashcards ? "Creating Flashcards..." : "Create Flashcards"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                AI-powered tools help you study more effectively
              </CardFooter>
            </Card>
            
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Document Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      {summary.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {flashcards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenTool className="h-5 w-5 text-primary" />
                      Generated Flashcards
                    </CardTitle>
                    <CardDescription>
                      {flashcards.length} flashcards created from your document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FlashcardDeck 
                      flashcards={flashcards} 
                      documentTitle={document.title}
                    />
                  </CardContent>
                </Card>
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
