
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentChatResponse, generateDocumentSummary as generateOpenRouterSummary, generateFlashcards as generateOpenRouterFlashcards } from '@/utils/openRouterUtils';

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

    try {
      // Call OpenRouter API directly
      const summary = await generateOpenRouterSummary(text);
      
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

    try {
      // Use the OpenRouter utils directly
      const flashcards = await generateOpenRouterFlashcards(text);
      
      // Save flashcards to database if authenticated
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && documentId) {
          for (const flashcard of flashcards) {
            await supabase
              .from('flashcards')
              .insert({
                document_id: documentId,
                front_content: flashcard.question,
                back_content: flashcard.answer,
                user_id: user.id
              });
          }
          console.log(`Saved ${flashcards.length} flashcards to database`);
        }
      } catch (dbError) {
        console.error('Error saving flashcards to database:', dbError);
        // Continue even if saving to DB fails
      }
      
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
