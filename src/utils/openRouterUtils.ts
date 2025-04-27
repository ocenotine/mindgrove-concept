
import { supabase } from '@/integrations/supabase/client';

// Function to retrieve the API key from local storage
export const getOpenRouterApiKey = (): string => {
  // Use the provided API key or check local storage
  return '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';
};

// Function to save the API key to local storage
export const saveOpenRouterApiKey = (apiKey: string): void => {
  localStorage.setItem('openrouter_api_key', apiKey);
};

// Function to play a notification sound
export const playNotificationSound = async (): Promise<void> => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    await audio.play();
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

// Function to generate a response for general chat
export const generateGeneralChatResponse = async (message: string): Promise<string> => {
  const apiKey = getOpenRouterApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not set');
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for students. You provide concise, accurate, and helpful responses.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate response');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response. Please check your API key and try again.');
  }
};

// Function to generate a response for document chat
export const generateDocumentChatResponse = async (documentText: string, userMessage: string): Promise<string> => {
  const apiKey = getOpenRouterApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not set');
  }
  
  // Truncate document text to prevent token limits
  const truncatedText = documentText.length > 3000 
    ? documentText.substring(0, 3000) + '...' 
    : documentText;
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a document assistant. Use the following document content to answer the user's questions: ${truncatedText}`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate response');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating document response:', error);
    throw new Error('Failed to generate document response');
  }
};

// Function to generate detailed document summary
export const generateDocumentSummary = async (documentText: string): Promise<string> => {
  const apiKey = getOpenRouterApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not set');
  }
  
  // Process document text to handle larger documents
  // We'll break it into chunks if it's very large to ensure we get a comprehensive summary
  const chunkSize = 12000; // Characters per chunk
  let summary = "";
  
  try {
    // If the text is small enough for a single request
    if (documentText.length <= chunkSize) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a document summarization assistant specialized in creating detailed, comprehensive summaries. Analyze the document thoroughly and extract key concepts, main arguments, important details, methodologies, findings, and conclusions. Structure your summary with clear sections and bullet points where appropriate for better readability.'
            },
            {
              role: 'user',
              content: `Please create a detailed and comprehensive summary of the following document, covering all major points and key information: ${documentText}`
            }
          ],
          max_tokens: 1000
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate summary');
      }
      
      summary = data.choices[0].message.content;
    } 
    // For larger documents, we need to process in chunks
    else {
      // First pass: Generate summaries for each chunk
      const chunks = [];
      for (let i = 0; i < documentText.length; i += chunkSize) {
        const chunk = documentText.slice(i, i + chunkSize);
        chunks.push(chunk);
      }
      
      const chunkSummaries = [];
      for (let i = 0; i < chunks.length; i++) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are summarizing part ${i+1} of ${chunks.length} of a document. Create a detailed summary of this section.`
              },
              {
                role: 'user',
                content: `Please summarize this part of the document: ${chunks[i]}`
              }
            ],
            max_tokens: 500
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || `Failed to summarize part ${i+1}`);
        }
        
        chunkSummaries.push(data.choices[0].message.content);
      }
      
      // Second pass: Combine the summaries into a cohesive whole
      const combinedContent = chunkSummaries.join("\n\n--- Next Section ---\n\n");
      
      const finalResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a document summarization assistant. Create a single cohesive and detailed summary from these section summaries. Structure your summary with clear sections and bullet points where appropriate for better readability.'
            },
            {
              role: 'user',
              content: `Using these section summaries, create a comprehensive and detailed summary of the entire document:\n\n${combinedContent}`
            }
          ],
          max_tokens: 1000
        })
      });
      
      const finalData = await finalResponse.json();
      
      if (!finalResponse.ok) {
        throw new Error(finalData.error?.message || 'Failed to generate final summary');
      }
      
      summary = finalData.choices[0].message.content;
    }
    
    return summary;
  } catch (error) {
    console.error('Error generating document summary:', error);
    throw new Error('Failed to generate document summary');
  }
};

// Function to generate flashcards
export const generateFlashcards = async (documentText: string): Promise<Array<{question: string, answer: string}>> => {
  const apiKey = getOpenRouterApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not set');
  }
  
  // Truncate document text to prevent token limits
  const truncatedText = documentText.length > 3000 
    ? documentText.substring(0, 3000) + '...' 
    : documentText;
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a flashcard generation assistant. Create a series of question-answer pairs based on the document content.'
          },
          {
            role: 'user',
            content: `Generate 5-10 flashcards (question and answer pairs) from this document: ${truncatedText}. Format your response as a JSON array with "question" and "answer" properties for each flashcard.`
          }
        ],
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate flashcards');
    }
    
    // Try to parse the response as JSON or extract JSON from text
    const content = data.choices[0].message.content;
    let flashcards = [];
    
    try {
      // Try to find a JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array is found, parse the entire response
        flashcards = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse flashcard data:', parseError);
      // Create a basic flashcard if parsing fails
      flashcards = [{
        question: "What is this document about?",
        answer: "This document covers key concepts in the subject matter."
      }];
    }
    
    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
};
