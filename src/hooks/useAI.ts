
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useDocumentStore, Flashcard } from '@/store/documentStore';
import { generateDocumentSummary, generateFlashcards, playNotificationSound, getOpenRouterApiKey } from '@/utils/openRouterUtils';
import { supabase } from '@/integrations/supabase/client';

interface UseAIProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAI({ onSuccess, onError }: UseAIProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setDocumentSummary, saveFlashcards } = useDocumentStore();

  const summarizeDocument = async (documentText: string, documentId: string) => {
    // Check if OpenRouter API key is set
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      const error = new Error("OpenRouter API key not set. Please set your API key in settings.");
      toast({
        title: 'API Key Required',
        description: error.message,
        variant: 'destructive',
      });
      
      if (onError) onError(error);
      setError(error);
      return "Please set your OpenRouter API key in settings to generate summaries.";
    }
    
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
      
      // Also save directly to the database
      try {
        const { error } = await supabase
          .from('documents')
          .update({ summary })
          .eq('id', documentId);
          
        if (error) throw error;
      } catch (dbError) {
        console.error("Error saving summary to database:", dbError);
        // Continue even if saving to database fails
      }
      
      console.log("Received summary:", summary);
      
      if (onSuccess) onSuccess(summary);
      
      toast({
        title: 'Summary generated',
        description: 'Document summary created successfully',
      });
      
      // Play notification sound
      await playNotificationSound();
      
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
    // Check if OpenRouter API key is set
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      const error = new Error("OpenRouter API key not set. Please set your API key in settings.");
      toast({
        title: 'API Key Required',
        description: error.message,
        variant: 'destructive',
      });
      
      if (onError) onError(error);
      setError(error);
      return [
        {
          question: "Why can't I generate flashcards?",
          answer: "You need to set your OpenRouter API key in settings first."
        }
      ];
    }
    
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
      
      // Also save directly to the database
      try {
        for (const flashcard of flashcards) {
          await supabase
            .from('flashcards')
            .insert({
              document_id: documentId,
              front_content: flashcard.question,
              back_content: flashcard.answer,
              user_id: (await supabase.auth.getUser()).data.user?.id
            });
        }
      } catch (dbError) {
        console.error("Error saving flashcards to database:", dbError);
        // Continue even if saving to database fails
      }
      
      console.log("Received flashcards:", flashcards);
      
      if (onSuccess) onSuccess(flashcards);
      
      toast({
        title: 'Flashcards generated',
        description: `${flashcards.length} flashcards created from your document`,
      });
      
      // Play notification sound
      await playNotificationSound();
      
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
