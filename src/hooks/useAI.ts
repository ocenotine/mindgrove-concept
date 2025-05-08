
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useDocumentStore, Flashcard } from '@/store/documentStore';
import { generateSummary, generateFlashcards as generateDocFlashcards, generateQuizQuestions } from '@/utils/nlpUtils';
import { supabase } from '@/integrations/supabase/client';

interface UseAIProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAI({ onSuccess, onError }: UseAIProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setDocumentSummary, saveFlashcards } = useDocumentStore();
  const { toast } = useToast();

  const summarizeDocument = async (documentText: string, documentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending summarize request with content length:", documentText.length);
      
      // If the document text is empty, provide a fallback
      if (!documentText || documentText.trim().length < 10) {
        throw new Error("Document content is too short to summarize");
      }
      
      // Use the nlpUtils function to generate summary
      const result = await generateSummary(documentId, documentText);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate summary");
      }
      
      const summary = result.summary;
      
      // Save summary to document store
      await setDocumentSummary(documentId, summary);
      
      console.log("Received summary:", summary);
      
      // Also save to database if institutional account
      await saveSummaryToDatabase(documentId, summary);
      
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
  
  const saveSummaryToDatabase = async (documentId: string, summary: string) => {
    try {
      await supabase
        .from('documents')
        .update({ summary })
        .eq('id', documentId);
    } catch (error) {
      console.error("Error saving summary to database:", error);
    }
  };
  
  const generateFlashcards = async (documentText: string, documentId: string): Promise<Flashcard[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending flashcards request with content length:", documentText.length);
      
      // If the document text is empty, provide a fallback
      if (!documentText || documentText.trim().length < 10) {
        throw new Error("Document content is too short to generate flashcards");
      }
      
      // Use the nlpUtils function to generate flashcards
      const result = await generateDocFlashcards(documentId, documentText);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate flashcards");
      }
      
      const flashcards = result.flashcards;
      
      // Save flashcards to document store
      await saveFlashcards(documentId, flashcards);
      
      console.log("Received flashcards:", flashcards);
      
      // Also save to database
      await saveFlashcardsToDatabase(documentId, flashcards);
      
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
  
  const saveFlashcardsToDatabase = async (documentId: string, flashcards: Flashcard[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        for (const card of flashcards) {
          await supabase
            .from('flashcards')
            .insert({
              user_id: user.id,
              document_id: documentId,
              front_content: card.question,
              back_content: card.answer
            });
        }
      }
    } catch (error) {
      console.error("Error saving flashcards to database:", error);
    }
  };
  
  const generateQuiz = async (documentText: string, documentId: string, numQuestions = 5, difficulty = 'medium') => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending quiz generation request with content length:", documentText.length);
      
      // If the document text is empty, provide a fallback
      if (!documentText || documentText.trim().length < 10) {
        throw new Error("Document content is too short to generate quiz questions");
      }
      
      // Use the nlpUtils function to generate quiz questions
      const result = await generateQuizQuestions(documentId, documentText, numQuestions, difficulty);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate quiz questions");
      }
      
      const questions = result.questions;
      
      console.log("Received quiz questions:", questions);
      
      if (onSuccess) onSuccess(questions);
      
      toast({
        title: 'Quiz generated',
        description: `${questions.length} quiz questions created from your document`,
      });
      
      return questions;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Quiz generation error:", error);
      setError(error);
      
      toast({
        title: 'Quiz generation failed',
        description: error.message,
        variant: 'destructive',
      });
      
      if (onError) onError(error);
      
      // Return fallback questions
      return [
        {
          question: "What is the main topic of this document?",
          options: [
            "Research methods",
            "Academic writing",
            "Data analysis",
            "Literature review"
          ],
          answer: 0
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
    generateFlashcards,
    generateQuiz
  };
}
