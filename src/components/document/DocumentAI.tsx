import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, PenTool, Sparkles, Loader, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { generateSummary, generateFlashcards } from '@/utils/nlpUtils';
import { useDocumentStore } from '@/store/documentStore';
import { useNavigate } from 'react-router-dom';
import ApiKeyReminder from './ApiKeyReminder';

interface DocumentAIProps {
  documentId: string;
  documentText: string;
  onSummaryGenerated?: (summary: string) => void;
  onFlashcardsGenerated?: (flashcards: Array<{question: string, answer: string}>) => void;
}

const DocumentAI: React.FC<DocumentAIProps> = ({ 
  documentId, 
  documentText, 
  onSummaryGenerated, 
  onFlashcardsGenerated 
}) => {
  const [summary, setSummary] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Array<{question: string, answer: string}>>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [processingLargeDoc, setProcessingLargeDoc] = useState(false);
  const { setDocumentSummary, fetchFlashcards } = useDocumentStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initial fetch of document data
    const loadInitialData = async () => {
      try {
        // Load flashcards if any exist
        const existingFlashcards = await fetchFlashcards(documentId);
        if (existingFlashcards && existingFlashcards.length > 0) {
          setFlashcards(existingFlashcards);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    
    loadInitialData();
  }, [documentId, fetchFlashcards]);
  
  const handleGenerateSummary = async () => {
    if (!documentText || documentText.trim().length < 10) {
      toast({
        title: "Insufficient Content",
        description: "This document doesn't have enough content to generate a summary.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingSummary(true);
    
    const isLargeDocument = documentText.length > 10000;
    if (isLargeDocument) {
      setProcessingLargeDoc(true);
      setProgress(0);
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev === null) return 0;
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    try {
      console.log("Starting summary generation with text length:", documentText.length);
      
      const result = await generateSummary(documentId, documentText);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate summary");
      }
      
      console.log("Summary generation successful, length:", result.summary.length);
      setSummary(result.summary);
      
      // Update the document store with the new summary
      await setDocumentSummary(documentId, result.summary);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(result.summary);
      }
      
      toast({
        title: 'Detailed summary generated',
        description: 'Document summary has been created successfully',
      });
      
      if (isLargeDocument) {
        setProgress(100);
        setTimeout(() => setProgress(null), 1000);
        setProcessingLargeDoc(false);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast({
        title: 'Summary generation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
      setProgress(null);
      setProcessingLargeDoc(false);
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  const handleGenerateFlashcards = async () => {
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
      
      const result = await generateFlashcards(documentId, documentText);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate flashcards");
      }
      
      console.log("Flashcard generation successful, count:", result.flashcards.length);
      setFlashcards(result.flashcards);
      
      if (onFlashcardsGenerated) {
        onFlashcardsGenerated(result.flashcards);
      }
      
      toast({
        title: 'Flashcards generated',
        description: `${result.flashcards.length} flashcards have been created`,
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
  
  const handleViewFlashcards = () => {
    navigate(`/flashcards?document=${documentId}`);
  };
  
  return (
    <div className="space-y-6 ai-tools">
      <ApiKeyReminder />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Document Analysis
          </CardTitle>
          <CardDescription>
            Extract insights and study materials from your document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {documentText.length > 50000 && (
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>This is a very large document ({Math.round(documentText.length/1000)}K characters). Processing may take a few minutes.</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="flex items-center gap-2"
            >
              {isGeneratingSummary ? <Loader className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
              {isGeneratingSummary ? "Generating Detailed Summary..." : "Generate Detailed Summary"}
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
          
          {processingLargeDoc && progress !== null && (
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Processing document...</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          AI-powered tools help you understand and learn from your documents
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
                Detailed Document Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {summary.split('\n').map((paragraph, index) => {
                  if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
                    return <li key={index} className="ml-4">{paragraph.trim().substring(2)}</li>;
                  }
                  else if (/^\d+\.\s/.test(paragraph.trim())) {
                    return <li key={index} className="ml-4">{paragraph.trim().substring(paragraph.trim().indexOf('.') + 1).trim()}</li>;
                  }
                  else if (paragraph.trim().startsWith('#')) {
                    const level = paragraph.trim().match(/^#+/)?.[0].length || 0;
                    const text = paragraph.trim().substring(level).trim();
                    switch (level) {
                      case 1: return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{text}</h2>;
                      case 2: return <h3 key={index} className="text-lg font-bold mt-3 mb-2">{text}</h3>;
                      default: return <h4 key={index} className="text-base font-bold mt-2 mb-1">{text}</h4>;
                    }
                  }
                  else if (paragraph.trim()) {
                    return <p key={index} className="mb-3">{paragraph}</p>;
                  }
                  return <div key={index} className="h-2"></div>;
                })}
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
              <div className="space-y-4">
                {flashcards.slice(0, 3).map((card, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">Q: {card.question}</div>
                    <div className="text-muted-foreground">A: {card.answer}</div>
                  </div>
                ))}
                {flashcards.length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    {flashcards.length - 3} more flashcards available
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleViewFlashcards}>
                View All Flashcards
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentAI;
