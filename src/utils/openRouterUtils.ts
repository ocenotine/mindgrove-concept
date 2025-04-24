
import { toast } from "@/components/ui/use-toast";

// OpenRouter API endpoint
const OPEN_ROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = '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';

// Default model to use for requests
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Generate a document summary using OpenRouter API
 */
export const generateDocumentSummary = async (text: string): Promise<string> => {
  try {
    // Truncate text if it's too long (OpenRouter has token limits)
    const truncatedText = text.length > 15000 ? text.substring(0, 15000) + "..." : text;
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in creating concise and accurate summaries of academic and research documents. Extract key concepts, methodologies, findings, and conclusions."
          },
          {
            role: "user",
            content: `Summarize the following text in a well-structured manner, highlighting the main points and preserving key information:\n\n${truncatedText}`
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json() as OpenRouterResponse;
    const summary = data.choices[0]?.message?.content || "Failed to generate summary.";
    
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    toast({
      title: "Summary generation failed",
      description: "Could not connect to AI service. Please try again later.",
      variant: "destructive"
    });
    
    // Since we're replacing mock data with real AI, we'll throw the error instead of returning fallback text
    throw new Error("Failed to generate summary. Please try again later.");
  }
};

/**
 * Generate flashcards from document text using OpenRouter API
 */
export const generateFlashcards = async (text: string): Promise<Array<{question: string, answer: string}>> => {
  try {
    // Truncate text if it's too long
    const truncatedText = text.length > 12000 ? text.substring(0, 12000) + "..." : text;
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in creating educational flashcards from academic content. Create study-worthy question and answer pairs that test understanding of key concepts."
          },
          {
            role: "user",
            content: `Create 8 flashcards in JSON format from the following text. Each flashcard should have a 'question' and 'answer' property. Make questions that test recall of important information and are clear and specific:\n\n${truncatedText}\n\nResponse must be valid JSON in this format: [{"question": "Question text?", "answer": "Answer text"}]`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json() as OpenRouterResponse;
    const content = data.choices[0]?.message?.content || "{}";
    
    try {
      // Parse the JSON from the content
      const parsedData = JSON.parse(content);
      
      // Extract the flashcards array
      const flashcards = Array.isArray(parsedData) 
        ? parsedData
        : parsedData.flashcards || parsedData.cards || [];
        
      if (!flashcards.length) {
        throw new Error("No flashcards found in the response");
      }
      
      return flashcards.map((card: any) => ({
        question: card.question || "Question not found",
        answer: card.answer || "Answer not found"
      }));
    } catch (jsonError) {
      console.error("Error parsing flashcard JSON:", jsonError, content);
      throw new Error("Invalid flashcard data received from API");
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    toast({
      title: "Flashcard generation failed",
      description: "Could not connect to AI service. Please try again later.",
      variant: "destructive"
    });
    
    // Since we're replacing mock data with real AI, we'll throw the error
    throw new Error("Failed to generate flashcards. Please try again later.");
  }
};

/**
 * Extract text from a PDF document
 * Note: This is a placeholder. In a production environment,
 * you would use a PDF parsing library or service.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // This is just a placeholder. In production, use pdfjs or similar library
        // For now, return a default message
        resolve("PDF text content would be extracted here using a PDF parsing library");
      } catch (error) {
        reject(new Error("Failed to extract text from PDF"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
