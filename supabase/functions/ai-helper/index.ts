
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts"; // Required for fetch in Deno

// Get the API key from environment variables or use the provided one
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || "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";
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// OpenRouter API endpoint
const OPEN_ROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const { action, text, documentId, query } = await req.json();
    
    if (!action) {
      throw new Error("Missing 'action' parameter");
    }
    
    console.log(`Processing ${action} request for ${documentId || 'document'}`);
    
    let result;
    switch(action) {
      case 'summarize':
        result = await generateSummary(text);
        break;
      case 'flashcards':
        result = await generateFlashcards(text);
        break;
      case 'chat':
        result = await generateChatResponse(text, query);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('AI Helper error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing your request"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Function to generate document summary
async function generateSummary(text: string) {
  if (!text || text.trim().length < 10) {
    return { 
      summary: "This document appears to be too short or contains minimal content."
    };
  }
  
  try {
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app',
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
            content: `Summarize the following text in a well-structured manner, highlighting the main points and preserving key information. If the text is very short, simply provide a brief overview:\n\n${text.slice(0, 15000)}`
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API returned status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Failed to generate summary.";
    
    return { summary };
  } catch (error) {
    console.error('Error in generateSummary:', error);
    throw error;
  }
}

// Function to generate flashcards from document text
async function generateFlashcards(text: string) {
  if (!text || text.trim().length < 10) {
    return { 
      flashcards: [
        {
          question: "What is this document about?",
          answer: "This document appears to be empty or contains minimal content. Please provide more text for meaningful flashcards."
        }
      ] 
    };
  }
  
  try {
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app',
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
            content: `Create flashcards in JSON format from the following text. Each flashcard should have a 'question' and 'answer' property. Format as a valid JSON array. If the text is very short, create fewer but relevant flashcards based on what's available:\n\n${text.slice(0, 15000)}\n\nResponse must be valid JSON in this format: [{"question": "Question text?", "answer": "Answer text"}]`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API returned status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    let flashcards;
    try {
      // Try direct parsing
      flashcards = JSON.parse(content);
      
      // Ensure we have an array
      if (!Array.isArray(flashcards)) {
        if (flashcards?.flashcards && Array.isArray(flashcards.flashcards)) {
          flashcards = flashcards.flashcards;
        } else if (flashcards?.cards && Array.isArray(flashcards.cards)) {
          flashcards = flashcards.cards;
        } else {
          throw new Error("Response is not an array of flashcards");
        }
      }
    } catch (jsonError) {
      console.error("Error parsing flashcard JSON:", jsonError);
      
      // Try to extract JSON using regex as fallback
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          flashcards = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error("Error parsing extracted JSON:", extractError);
          throw new Error("Failed to parse flashcard data");
        }
      } else {
        // Default fallback flashcards
        flashcards = [
          { question: "What is this document about?", answer: "This document contains academic or educational content." },
          { question: "How can I use flashcards for studying?", answer: "Flashcards help with active recall and spaced repetition, improving memory retention." }
        ];
      }
    }
    
    return { 
      flashcards: flashcards.map((card: any) => ({
        question: card.question || "Question not available",
        answer: card.answer || "Answer not available"
      }))
    };
  } catch (error) {
    console.error('Error in generateFlashcards:', error);
    throw error;
  }
}

// Function to generate chat responses for document queries
async function generateChatResponse(documentText: string, userQuery: string) {
  if (!userQuery || !userQuery.trim()) {
    throw new Error("Please provide a query to generate a response");
  }
  
  try {
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app',
        'X-Title': 'MindGrove Document Chat'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an AI research assistant helping a user understand a document. Answer questions based on the document content. If the document doesn't contain information needed to answer a question, say so politely and suggest what might be helpful instead.
            
DOCUMENT CONTENT:
${documentText.slice(0, 8000)}`
          },
          {
            role: "user",
            content: userQuery
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API returned status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const chatResponse = data.choices?.[0]?.message?.content || 
      "I'm sorry, I wasn't able to generate a response. Please try asking a different question.";
    
    return { response: chatResponse };
  } catch (error) {
    console.error('Error in generateChatResponse:', error);
    throw error;
  }
}
