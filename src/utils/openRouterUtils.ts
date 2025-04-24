
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
    // Even if text is minimal, we'll attempt to summarize it
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin, // Required by OpenRouter
        'X-Title': 'MindGrove Document Summarization' // Helps identify the request
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
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API returned status: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
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
    
    throw new Error("Failed to generate summary. Please try again later.");
  }
};

/**
 * Generate flashcards from document text using OpenRouter API
 */
export const generateFlashcards = async (text: string): Promise<Array<{question: string, answer: string}>> => {
  try {
    // Even if text is minimal, we'll try to generate flashcards
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin, // Required by OpenRouter
        'X-Title': 'MindGrove Flashcard Generation' // Helps identify the request
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
            content: `Create flashcards in JSON format from the following text. Each flashcard should have a 'question' and 'answer' property. If the text is very short, create fewer but relevant flashcards based on what's available:\n\n${inputText}\n\nResponse must be valid JSON in this format: [{"question": "Question text?", "answer": "Answer text"}]`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API returned status: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json() as OpenRouterResponse;
    const content = data.choices[0]?.message?.content || "{}";
    
    try {
      // Parse the JSON from the content
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (e) {
        // If it fails to parse directly, try to extract JSON from the string
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw e;
        }
      }
      
      // Extract the flashcards array
      const flashcards = Array.isArray(parsedData) 
        ? parsedData
        : parsedData.flashcards || parsedData.cards || [];
        
      if (!flashcards.length) {
        // If no flashcards were generated, provide default ones based on document type
        return [{
          question: "What is the main topic of this document?",
          answer: "This document contains information that may require more context to summarize effectively."
        }, {
          question: "How can I use the information in this document?",
          answer: "The document can be used as a reference for studying or understanding related concepts."
        }];
      }
      
      return flashcards.map((card: any) => ({
        question: card.question || "Question not found",
        answer: card.answer || "Answer not found"
      }));
    } catch (jsonError) {
      console.error("Error parsing flashcard JSON:", jsonError, content);
      // Return basic fallback flashcards if JSON parsing fails
      return [
        {
          question: "What is this document about?",
          answer: "This document contains academic or educational content."
        },
        {
          question: "How can I use flashcards for studying?",
          answer: "Flashcards help with active recall and spaced repetition, improving memory retention."
        }
      ];
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    toast({
      title: "Flashcard generation failed",
      description: "Could not connect to AI service. Please try again later.",
      variant: "destructive"
    });
    
    throw new Error("Failed to generate flashcards. Please try again later.");
  }
};

/**
 * Extract text from a PDF document
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use pdfjs to extract text
    const pdfjsLib = await import('pdfjs-dist');
    
    // Initialize PDF.js worker if needed
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText || "No text content could be extracted from this PDF.";
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return "Error extracting text from PDF. Please try a different file.";
  }
};
