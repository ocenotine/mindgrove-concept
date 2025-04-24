
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
    const { task, content } = body;
    
    if (!content) {
      throw new Error("Content is required");
    }
    
    console.log(`Processing task: ${task}`);
    
    if (task === 'summarize') {
      const summary = await summarizeText(content);
      console.log("Summary generated successfully");
      return new Response(
        JSON.stringify({ result: summary }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (task === 'flashcards') {
      const flashcards = await generateFlashcards(content);
      console.log("Flashcards generated successfully");
      return new Response(
        JSON.stringify({ result: flashcards }),
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

async function summarizeText(text: string): Promise<string> {
  console.log("Summarizing text with OpenRouter API");
  try {
    // Allow even very short texts to be summarized
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app'
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
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`OpenRouter API returned status: ${response.status}`);
    }
    
    const data = await response.json();
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

async function generateFlashcards(text: string): Promise<string> {
  console.log("Generating flashcards with OpenRouter API");
  try {
    // Allow even very short texts to generate basic flashcards
    const inputText = text.trim() || "This document appears to be empty or contains minimal content.";
    
    const response = await fetch(OPEN_ROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app'
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
            content: `Create 8 flashcards from the following text. Each flashcard should have a 'question' and 'answer' property. If the text is very short, create fewer but relevant flashcards based on what's available:\n\n${inputText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`OpenRouter API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Failed to extract flashcards from API response");
    }
    
    // The API should return JSON, but we'll wrap this in try/catch in case it doesn't
    try {
      const parsed = JSON.parse(content);
      // Check if the response is already an array or if it has a flashcards property
      const flashcards = Array.isArray(parsed) 
        ? parsed 
        : parsed.flashcards || parsed.cards || [];
        
      // Return the JSON string of the flashcards
      return JSON.stringify(flashcards);
    } catch (jsonError) {
      console.error("Error parsing flashcard JSON:", jsonError);
      // If we can't parse as JSON, just return the content as string
      return content;
    }
  } catch (error) {
    console.error("Error in generateFlashcards:", error);
    throw error;
  }
}
