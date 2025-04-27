
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentChatResponse, generateDocumentSummary } from '@/utils/openRouterUtils';

export const generateSummary = async (documentId: string, text: string) => {
  try {
    console.log(`Generating detailed summary for document ${documentId}`);
    
    if (!text || text.trim().length < 10) {
      console.log('Text is too short for summarization');
      return { 
        success: true, 
        summary: "This document appears to be too short or empty. Please provide more content for a meaningful summary."
      };
    }

    // Get the access token for API request
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    if (!accessToken) {
      throw new Error('Authentication required for document processing');
    }

    // Call OpenRouter API through our wrapper
    try {
      // Use the OpenRouter utils directly
      const summary = await generateDocumentSummary(text);
      
      // Once we have the summary, save it to the document in Supabase
      if (documentId) {
        try {
          const { error } = await supabase
            .from('documents')
            .update({ summary })
            .eq('id', documentId);
            
          if (error) {
            console.error('Error saving summary to document:', error);
          } else {
            console.log('Summary saved successfully to document ID:', documentId);
          }
        } catch (dbError) {
          console.error('Database error when saving summary:', dbError);
          // Continue even if saving to DB fails
        }
      }
      
      return {
        success: true,
        summary
      };
    } catch (apiError) {
      console.error('API error for summary:', apiError);
      throw apiError;
    }
    
  } catch (error) {
    console.error('Error generating summary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate summary'
    };
  }
};

export const generateFlashcards = async (documentId: string, text: string) => {
  try {
    console.log(`Generating flashcards for document ${documentId}`);
    
    if (!text || text.trim().length < 10) {
      console.log('Text is too short for flashcard generation');
      return { 
        success: true, 
        flashcards: [
          {
            question: "Why might this document be limited?",
            answer: "This document appears to be too short or empty. More content is needed to generate meaningful flashcards."
          }
        ]
      };
    }

    // Get the access token for API request
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    if (!accessToken) {
      throw new Error('Authentication required for document processing');
    }

    try {
      // Use the OpenRouter utils directly
      const { generateFlashcards: generateFlashcardsFromOpenRouter } = await import('@/utils/openRouterUtils');
      const flashcards = await generateFlashcardsFromOpenRouter(text.slice(0, 15000));
      
      return {
        success: true,
        flashcards
      };
    } catch (apiError) {
      console.error('API error for flashcards:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate flashcards',
      flashcards: []
    };
  }
};

// Chat with document function
export const chatWithDocument = async (documentId: string, documentText: string, userMessage: string) => {
  try {
    console.log(`Generating chat response for document ${documentId}`);
    
    if (!userMessage.trim()) {
      return {
        success: false,
        error: "Please enter a message to continue the conversation."
      };
    }
    
    // Use direct call to OpenRouter for document chat
    const response = await generateDocumentChatResponse(documentText, userMessage);
    
    return {
      success: true,
      response
    };
  } catch (error) {
    console.error('Error in document chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate a response'
    };
  }
};
