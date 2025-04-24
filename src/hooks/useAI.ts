
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useDocumentStore } from '@/store/documentStore';
import { generateDocumentSummary, generateFlashcards, playNotificationSound } from '@/utils/openRouterUtils';

interface UseAIProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface Flashcard {
  question: string;
  answer: string;
}

export function useAI({ onSuccess, onError }: UseAIProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setDocumentSummary, saveFlashcards } = useDocumentStore();

  const summarizeDocument = async (documentText: string, documentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending summarize request with content length:", documentText.length);
      
      // If the document text is empty, provide a fallback
      if (!documentText || documentText.trim().length < 10) {
        throw new Error("Document content is too short to summarize");
      }
      
      // Get summary using OpenRouter API
      const summary = await generateDocumentSummary(documentText);
      
      // Save summary to document store
      await setDocumentSummary(documentId, summary);
      
      console.log("Received summary:", summary);
      
      if (onSuccess) onSuccess(summary);
      
      toast({
        title: 'Summary generated',
        description: 'Document summary created successfully',
      });
      
      return summary;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Summarization error:", error);
      setError(error);
      
      toast({
        title: 'Summarization failed',
        description: error.message,
        variant: 'destructive',
      });
      
      if (onError) onError(error);
      
      // Return fallback summary
      return "This document contains research information. Failed to generate detailed summary.";
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateDocumentFlashcards = async (documentText: string, documentId: string): Promise<Flashcard[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending flashcards request with content length:", documentText.length);
      
      // If the document text is empty, provide a fallback
      if (!documentText || documentText.trim().length < 10) {
        throw new Error("Document content is too short to generate flashcards");
      }
      
      // Generate flashcards using OpenRouter API
      const flashcards = await generateFlashcards(documentText);
      
      // Save flashcards to document store
      await saveFlashcards(documentId, flashcards);
      
      console.log("Received flashcards:", flashcards);
      
      if (onSuccess) onSuccess(flashcards);
      
      toast({
        title: 'Flashcards generated',
        description: `${flashcards.length} flashcards created from your document`,
      });
      
      return flashcards;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Flashcard generation error:", error);
      setError(error);
      
      toast({
        title: 'Flashcard generation failed',
        description: error.message,
        variant: 'destructive',
      });
      
      if (onError) onError(error);
      
      // Return fallback flashcards
      return [
        {
          question: "What is this document about?",
          answer: "This document discusses academic and research topics."
        },
        {
          question: "What are some key concepts in research?",
          answer: "Research methods, data analysis, and literature review."
        }
      ];
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    summarizeDocument,
    generateFlashcards: generateDocumentFlashcards
  };
}
