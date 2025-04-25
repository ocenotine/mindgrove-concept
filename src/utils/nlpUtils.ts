
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentChatResponse } from '@/utils/openRouterUtils';

export const generateSummary = async (documentId: string, text: string) => {
  try {
    console.log(`Generating summary for document ${documentId}`);
    
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
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          documentId,
          text: text.slice(0, 15000) // Limit text length for API
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.summary) {
        throw new Error('No summary returned from API');
      }
      
      // Forward the successful result
      return { 
        success: true, 
        summary: data.summary 
      };
    } catch (apiError) {
      console.error('API error for summary:', apiError);
      
      // Fallback to direct API call
      console.log('Falling back to direct API call for summarization');
      
      // Use the OpenRouter utils directly as a fallback
      const { generateDocumentSummary } = await import('@/utils/openRouterUtils');
      const summary = await generateDocumentSummary(text.slice(0, 15000));
      
      return {
        success: true,
        summary
      };
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

    // Call OpenRouter API through our wrapper
    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          documentId,
          text: text.slice(0, 15000) // Limit text length for API
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
        throw new Error('No valid flashcards returned from API');
      }
      
      // Forward the successful result
      return { 
        success: true, 
        flashcards: data.flashcards 
      };
    } catch (apiError) {
      console.error('API error for flashcards:', apiError);
      
      // Fallback to direct API call
      console.log('Falling back to direct API call for flashcard generation');
      
      // Use the OpenRouter utils directly as a fallback
      const { generateFlashcards: generateFlashcardsFromOpenRouter } = await import('@/utils/openRouterUtils');
      const flashcards = await generateFlashcardsFromOpenRouter(text.slice(0, 15000));
      
      return {
        success: true,
        flashcards
      };
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
