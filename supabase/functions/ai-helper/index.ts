
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPEN_ROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = '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';
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("AI Helper function called");
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await req.json();
    console.log("Request body:", body);
    const { task, content, api_key } = body;
    
    if (!task) {
      throw new Error("Task parameter is required");
    }
    
    // Use provided API key or fall back to default
    const openRouterKey = api_key || API_KEY;
    
    // Always attempt to process even with minimal content
    const inputContent = content || "This document appears to have minimal content.";
    console.log(`Processing task: ${task} with content length: ${inputContent.length}`);
    
    if (task === 'summarize') {
      const summary = await summarizeText(inputContent, openRouterKey);
      console.log("Summary generated successfully");
      return new Response(
        JSON.stringify({ result: summary }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (task === 'flashcards') {
      const flashcards = await generateFlashcards(inputContent, openRouterKey);
      console.log("Flashcards generated successfully");
      return new Response(
        JSON.stringify({ result: flashcards }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (task === 'chat') {
      const { document_content, user_message } = body;
      if (!user_message) {
        throw new Error("User message is required for chat task");
      }
      
      const chatResponse = await generateChatResponse(document_content || inputContent, user_message, openRouterKey);
      console.log("Chat response generated successfully");
      return new Response(
        JSON.stringify({ result: chatResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    throw new Error(`Unsupported task: ${task}`);
    
  } catch (error) {
    console.error('Error in AI helper function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

async function summarizeText(text: string, apiKey: string): Promise<string> {
  console.log("Summarizing text with OpenRouter API");
  try {
    // Allow even very short texts to be summarized
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
            content: `Summarize the following text in a well-structured manner, highlighting the main points and preserving key information. If the text is very short, simply provide a brief overview:\n\n${inputText}`
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })
    });
    
    const responseText = await response.text();
    console.log("OpenRouter API response:", responseText);
    
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, responseText);
      throw new Error(`OpenRouter API returned status: ${response.status}`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      throw new Error("Invalid response from OpenRouter API");
    }
    
    const summary = data.choices[0]?.message?.content;
    
    if (!summary) {
      throw new Error("Failed to extract summary from API response");
    }
    
    return summary;
  } catch (error) {
    console.error("Error in summarizeText:", error);
    throw error;
  }
}

async function generateFlashcards(text: string, apiKey: string): Promise<string> {
  console.log("Generating flashcards with OpenRouter API");
  try {
    // Allow even very short texts to generate basic flashcards
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
            content: `Create flashcards in JSON format from the following text. Each flashcard should have a 'question' and 'answer' property. Format as a valid JSON array. If the text is very short, create fewer but relevant flashcards based on what's available:\n\n${inputText}\n\nResponse must be valid JSON in this format: [{"question": "Question text?", "answer": "Answer text"}]`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });
    
    const responseText = await response.text();
    console.log("OpenRouter API response for flashcards:", responseText);
    
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, responseText);
      throw new Error(`OpenRouter API returned status: ${response.status}`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      throw new Error("Invalid response from OpenRouter API");
    }
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Failed to extract flashcards from API response");
    }
    
    // The API should return JSON, but we'll wrap this in try/catch in case it doesn't
    try {
      // First try to parse the content as JSON directly
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        // If that fails, try to extract JSON from the string using regex
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw e; // Re-throw if we can't find JSON
        }
      }
      
      // Check if the response is already an array or if it has a flashcards property
      const flashcards = Array.isArray(parsedContent) 
        ? parsedContent 
        : parsedContent.flashcards || parsedContent.cards || [];
        
      // Return the JSON string of the flashcards
      return JSON.stringify(flashcards);
    } catch (jsonError) {
      console.error("Error parsing flashcard JSON:", jsonError, content);
      // If we can't parse as JSON, extract structured data with regex as fallback
      const cardMatches = content.match(/question["\s:]+([^"]+)["\s,]+answer["\s:]+([^"]+)/gi);
      
      if (cardMatches && cardMatches.length > 0) {
        const extractedCards = cardMatches.map(match => {
          const questionMatch = match.match(/question["\s:]+([^",]+)/i);
          const answerMatch = match.match(/answer["\s:]+([^",]+)/i);
          return {
            question: questionMatch ? questionMatch[1].trim() : "Question not found",
            answer: answerMatch ? answerMatch[1].trim() : "Answer not found"
          };
        });
        return JSON.stringify(extractedCards);
      }
      
      // Last resort: return basic flashcards
      return JSON.stringify([
        { question: "What is this document about?", answer: "This document contains educational content." },
        { question: "How can I use this information?", answer: "The information can be used for study purposes." }
      ]);
    }
  } catch (error) {
    console.error("Error in generateFlashcards:", error);
    throw error;
  }
}

async function generateChatResponse(documentContent: string, userMessage: string, apiKey: string): Promise<string> {
  console.log("Generating chat response with OpenRouter API");
  try {
    // Use a portion of the document to avoid token limits
    const contextText = documentContent.substring(0, 10000);
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
${contextText}`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })
    });
    
    const responseText = await response.text();
    console.log("OpenRouter API response for chat:", responseText);
    
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, responseText);
      throw new Error(`OpenRouter API returned status: ${response.status}`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      throw new Error("Invalid response from OpenRouter API");
    }
    
    const chatResponse = data.choices[0]?.message?.content;
    
    if (!chatResponse) {
      throw new Error("Failed to extract chat response from API response");
    }
    
    return chatResponse;
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    throw error;
  }
}
