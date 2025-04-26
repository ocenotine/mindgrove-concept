// OpenRouter API endpoint
const OPEN_ROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// Use the provided API key directly
const API_KEY = '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';

// Default model to use for requests
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo';

// Local storage key for API key
const API_KEY_STORAGE = 'mindgrove_openrouter_api_key';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Get the stored OpenRouter API key
 */
export const getOpenRouterApiKey = (): string => {
  return API_KEY; // Always return the hardcoded API key as requested
};

/**
 * Set the OpenRouter API key in local storage
 */
export const setOpenRouterApiKey = (apiKey: string): void => {
  // We'll keep this function for backward compatibility,
  // but we'll only use the hardcoded API key as requested
  localStorage.setItem(API_KEY_STORAGE, apiKey);
};

/**
 * Generate a document summary using OpenRouter API
 */
export const generateDocumentSummary = async (text: string): Promise<string> => {
  console.log("Calling OpenRouter API for summary...");
  try {
    // Play notification sound
    playNotificationSound();
    
    // Even if text is minimal, we'll attempt to summarize it
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    console.log("Making API request to OpenRouter...");
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindGrove Document Summarization'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in creating concise and accurate summaries of academic and research documents. Extract key concepts, methodologies, findings, and conclusions. If the text is very short, provide a brief overview of what little content is available."
          },
          {
            role: "user",
            content: `Summarize the following text in a well-structured manner, highlighting the main points and preserving key information. If the text is very short, simply provide a brief overview:\n\n${inputText}`
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })
    });
    
    console.log("API Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorText
      });
      throw new Error(`API returned status: ${response.status} - ${getErrorMessage(errorText)}`);
    }
    
    // Parse the response
    const data = await response.json();
    console.log("API Response data:", data);
    
    const summary = data.choices?.[0]?.message?.content || "Failed to generate summary.";
    console.log("Generated summary:", summary);
    
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

/**
 * Generate flashcards from document text using OpenRouter API
 */
export const generateFlashcards = async (text: string): Promise<Array<{question: string, answer: string}>> => {
  console.log("Calling OpenRouter API for flashcards...");
  try {
    // Play notification sound
    playNotificationSound();
    
    // Even if text is minimal, we'll try to generate flashcards
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindGrove Flashcard Generation'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in creating educational flashcards from academic content. Create study-worthy question and answer pairs that test understanding of key concepts. If the content is very minimal, create basic flashcards about the limited information available."
          },
          {
            role: "user",
            content: `Create flashcards in JSON format from the following text. Each flashcard should have a 'question' and 'answer' property. Format as a valid JSON array. If the text is very short, create fewer but relevant flashcards based on what's available:\n\n${inputText}\n\nResponse must be valid JSON in this format: [{"question": "Question text?", "answer": "Answer text"}]`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`API returned status: ${response.status} - ${getErrorMessage(errorText)}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    try {
      // Try different approaches to parse the JSON content from the response
      let parsedContent;
      
      // Direct parsing attempt
      try {
        parsedContent = JSON.parse(content);
      } catch (jsonError) {
        // If that fails, try to extract JSON from the content using regex
        const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          try {
            parsedContent = JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            console.error("Error parsing extracted JSON:", extractError);
            throw new Error("Failed to parse flashcard data");
          }
        } else {
          console.error("No JSON array found in response:", content);
          throw new Error("Invalid response format");
        }
      }
      
      // Ensure we have an array of flashcards
      const flashcards = Array.isArray(parsedContent) 
        ? parsedContent 
        : parsedContent?.flashcards || parsedContent?.cards || [];
      
      if (!flashcards.length) {
        // If no flashcards were generated, provide default ones
        return [
          {
            question: "What is the main topic of this document?",
            answer: "This document contains information that may require more context to summarize effectively."
          },
          {
            question: "How can I use the information in this document?",
            answer: "The document can be used as a reference for studying or understanding related concepts."
          }
        ];
      }
      
      // Ensure each flashcard has the required fields
      return flashcards.map((card: any) => ({
        question: card.question || "Question not found",
        answer: card.answer || "Answer not found"
      }));
    } catch (jsonError) {
      console.error("Error parsing flashcard response:", jsonError, "Response:", content);
      // Return fallback flashcards
      return [
        { question: "What is this document about?", answer: "This document contains academic or educational content." },
        { question: "How can I use flashcards for studying?", answer: "Flashcards help with active recall and spaced repetition, improving memory retention." }
      ];
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
};

/**
 * Generate an AI chat response related to document content
 */
export const generateDocumentChatResponse = async (
  documentText: string, 
  userMessage: string
): Promise<string> => {
  console.log("Calling OpenRouter API for chat response...");
  try {
    // Play notification sound for new message
    playNotificationSound();
    
    // Prepare document context (use first 8000 chars to avoid token limits)
    const contextText = documentText.trim().substring(0, 8000); 
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindGrove Document Chat'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an AI research assistant helping a user understand a document. Answer questions based on the document content. If the document doesn't contain information needed to answer a question, say so politely and suggest what might be helpful instead.
            
DOCUMENT CONTENT:
${contextText}`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`API returned status: ${response.status} - ${getErrorMessage(errorText)}`);
    }
    
    const data = await response.json();
    const chatResponse = data.choices?.[0]?.message?.content || 
      "I'm sorry, I wasn't able to generate a response. Please try asking a different question.";
    
    return chatResponse;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

/**
 * Generate an AI chat response related to general content
 */
export const generateGeneralChatResponse = async (userMessage: string) => {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindGrove'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful academic assistant for MindGrove, an educational platform. Provide clear, educational responses to users\' questions. Focus on being helpful, accurate, and concise. Cite sources when appropriate.'
          },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating general chat response:', error);
    throw error;
  }
};

/**
 * Helper function to extract error message from API response
 */
const getErrorMessage = (responseText: string): string => {
  try {
    const errorObj = JSON.parse(responseText);
    return errorObj?.error?.message || 'Unknown error';
  } catch (e) {
    return responseText || 'Unable to parse error details';
  }
};

/**
 * Play notification sound for important events
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3; // Set volume to 30%
    audio.play().catch(err => console.log('Audio play prevented by browser policy:', err));
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};
