
import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { BookOpen, PenTool, Sparkles, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import ApiKeyReminder from './ApiKeyReminder';
import ApiKeySettings from './ApiKeySettings';
import { motion } from 'framer-motion';
import { generateDocumentSummary, generateFlashcards as generateFlashcardsUtil } from '@/utils/openRouterUtils';

interface DocumentAIProps {
  documentText: string;
  documentId: string;
  onSummaryGenerated?: (summary: string) => void;
  onFlashcardsGenerated?: (flashcards: Array<{question: string, answer: string}>) => void;
}

const DocumentAI = ({ documentText, documentId, onSummaryGenerated, onFlashcardsGenerated }: DocumentAIProps) => {
  const [summary, setSummary] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Array<{question: string, answer: string}>>([]);
  const { isLoading } = useAI();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  
  const handleGenerateSummary = async () => {
    // We'll proceed even with minimal content
    const textToProcess = documentText || "This document appears to have minimal content.";
    
    setIsGeneratingSummary(true);
    try {
      console.log("Starting summary generation with text length:", textToProcess.length);
      
      // Use our OpenRouter utility directly
      const result = await generateDocumentSummary(textToProcess);
      console.log("Summary generation successful, length:", result.length);
      setSummary(result);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(result);
      }
      
      toast({
        title: 'Summary generated',
        description: 'Document summary has been created successfully',
      });
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
    // We'll proceed even with minimal content
    const textToProcess = documentText || "This document appears to have minimal content.";
    
    setIsGeneratingFlashcards(true);
    try {
      console.log("Starting flashcard generation with text length:", textToProcess.length);
      
      // Use our OpenRouter utility directly
      const result = await generateFlashcardsUtil(textToProcess);
      console.log("Flashcard generation successful, count:", result.length);
      setFlashcards(result);
      
      if (onFlashcardsGenerated) {
        onFlashcardsGenerated(result);
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
  
  return (
    <div className="space-y-6 ai-tools">
      <ApiKeyReminder />
      <ApiKeySettings />
      
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
              <Button variant="outline" className="w-full">
                Save Flashcards to Your Collection
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentAI;
