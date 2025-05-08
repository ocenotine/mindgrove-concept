
import { supabase } from '@/integrations/supabase/client';

// Function to retrieve the API key - always returns the default one
export const getOpenRouterApiKey = (): string => {
  // Always use the provided API key
  return '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';
};

// Set the OpenRouter API key - kept for backwards compatibility
export const setOpenRouterApiKey = (key: string): void => {
  // This function is maintained for compatibility but doesn't actually store the key
  console.log('Using default OpenRouter API key');
};

// Play a notification sound
export const playNotificationSound = async (): Promise<void> => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    await audio.play();
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

// Common function to call OpenRouter API with different prompts
const callOpenRouter = async (
  messages: Array<{role: string, content: string}>,
  model: string = 'openai/gpt-3.5-turbo',
  maxTokens: number = 1000,
  temperature: number = 0.3
): Promise<any> => {
  const apiKey = getOpenRouterApiKey();
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://mindgrove.app',
        'X-Title': 'MindGrove AI'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API returned status: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
};

// Function to generate a response for general chat
export const generateGeneralChatResponse = async (message: string): Promise<string> => {
  try {
    console.log("Generating general chat response");
    const data = await callOpenRouter([
      {
        role: 'system',
        content: 'You are a helpful AI assistant for students. You provide concise, accurate, and helpful responses.'
      },
      {
        role: 'user',
        content: message
      }
    ]);
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
};

// Function to generate a response for document chat
export const generateDocumentChatResponse = async (documentText: string, userMessage: string): Promise<string> => {
  // Truncate document text to prevent token limits
  const truncatedText = documentText.length > 5000 
    ? documentText.substring(0, 5000) + '...' 
    : documentText;
  
  try {
    console.log("Generating document chat response");
    const data = await callOpenRouter([
      {
        role: 'system',
        content: `You are a document assistant. Use the following document content to answer the user's questions: ${truncatedText}`
      },
      {
        role: 'user',
        content: userMessage
      }
    ]);
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating document response:', error);
    throw new Error('Failed to generate document response');
  }
};

// Function to generate detailed document summary
export const generateDocumentSummary = async (documentText: string): Promise<string> => {
  // Process document text to handle larger documents
  const chunkSize = 12000; // Characters per chunk
  let summary = "";
  
  try {
    console.log("Generating document summary");
    // If the text is small enough for a single request
    if (documentText.length <= chunkSize) {
      const data = await callOpenRouter([
        {
          role: 'system',
          content: 'You are a document summarization assistant specialized in creating detailed, comprehensive summaries. Analyze the document thoroughly and extract key concepts, main arguments, important details, methodologies, findings, and conclusions. Structure your summary with clear sections and bullet points where appropriate for better readability.'
        },
        {
          role: 'user',
          content: `Please create a detailed and comprehensive summary of the following document, covering all major points and key information: ${documentText}`
        }
      ], 'openai/gpt-3.5-turbo', 1000, 0.2);
      
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
        const data = await callOpenRouter([
          {
            role: 'system',
            content: `You are summarizing part ${i+1} of ${chunks.length} of a document. Create a detailed summary of this section.`
          },
          {
            role: 'user',
            content: `Please summarize this part of the document: ${chunks[i]}`
          }
        ], 'openai/gpt-3.5-turbo', 500, 0.2);
        
        chunkSummaries.push(data.choices[0].message.content);
      }
      
      // Second pass: Combine the summaries into a cohesive whole
      const combinedContent = chunkSummaries.join("\n\n--- Next Section ---\n\n");
      
      const finalData = await callOpenRouter([
        {
          role: 'system',
          content: 'You are a document summarization assistant. Create a single cohesive and detailed summary from these section summaries. Structure your summary with clear sections and bullet points where appropriate for better readability.'
        },
        {
          role: 'user',
          content: `Using these section summaries, create a comprehensive and detailed summary of the entire document:\n\n${combinedContent}`
        }
      ], 'openai/gpt-3.5-turbo', 1000, 0.2);
      
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
  // Handle larger documents by focusing on the most important parts
  const maxLength = 10000; // Maximum characters to process
  const processedText = documentText.length > maxLength 
    ? documentText.substring(0, maxLength) + '...' 
    : documentText;
  
  try {
    console.log("Generating flashcards");
    const data = await callOpenRouter([
      {
        role: 'system',
        content: 'You are a flashcard generation assistant specialized in creating educational study cards. Generate 5-10 high-quality flashcards that cover the most important concepts from the document. Each flashcard should have a clear question on one side and a comprehensive answer on the other.'
      },
      {
        role: 'user',
        content: `Generate 5-10 flashcards (question and answer pairs) from this document: ${processedText}. Format your response as a valid JSON array with "question" and "answer" properties for each flashcard. The response should be valid JSON that can be parsed.`
      }
    ], 'openai/gpt-3.5-turbo', 1000, 0.3);
    
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
        try {
          const parsedData = JSON.parse(content);
          
          // Check if parsed data is directly an array or needs extraction from a property
          if (Array.isArray(parsedData)) {
            flashcards = parsedData;
          } else if (parsedData && typeof parsedData === 'object') {
            // Try to extract from known properties
            if (Array.isArray(parsedData.flashcards)) {
              flashcards = parsedData.flashcards;
            } else if (Array.isArray(parsedData.cards)) {
              flashcards = parsedData.cards;
            } else {
              // If we can't find an array, throw an error
              throw new Error("Response is not an array of flashcards");
            }
          } else {
            throw new Error("Response is not a valid JSON object or array");
          }
        } catch (innerError) {
          console.error("Inner parsing error:", innerError);
          throw new Error("Failed to parse response data");
        }
      }
    } catch (parseError) {
      console.error('Failed to parse flashcard data:', parseError, content);
      // Create basic flashcards if parsing fails
      flashcards = [
        {
          question: "What are the main topics covered in this document?",
          answer: "The document covers key concepts related to the subject matter."
        },
        {
          question: "Why is this information important?",
          answer: "This information provides essential knowledge for understanding the topic."
        }
      ];
    }
    
    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
};

// Function to generate quiz questions
export const generateQuiz = async (documentText: string, numQuestions: number = 5, difficulty: string = 'medium'): Promise<Array<{question: string, options: string[], answer: string, explanation: string}>> => {
  // Handle larger documents by focusing on the most important parts
  const maxLength = 10000; // Maximum characters to process
  const processedText = documentText.length > maxLength 
    ? documentText.substring(0, maxLength) + '...' 
    : documentText;
  
  try {
    console.log("Generating quiz questions");
    const data = await callOpenRouter([
      {
        role: 'system',
        content: `You are a quiz generation assistant specialized in creating educational multiple-choice questions. Generate ${numQuestions} ${difficulty}-difficulty quiz questions that cover important concepts from the document. Each question should have 4 options with one correct answer and an explanation of why it's correct.`
      },
      {
        role: 'user',
        content: `Generate ${numQuestions} multiple-choice quiz questions from this document: ${processedText}. Format your response as a valid JSON array with "question", "options" (array of 4 choices), "answer" (the correct option text), and "explanation" properties for each question. The response should be valid JSON that can be parsed.`
      }
    ], 'openai/gpt-3.5-turbo', 1200, 0.3);
    
    // Try to parse the response as JSON or extract JSON from text
    const content = data.choices[0].message.content;
    let quiz = [];
    
    try {
      // Try to find a JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array is found, parse the entire response
        try {
          const parsedData = JSON.parse(content);
          
          // Check if parsed data is directly an array or needs extraction from a property
          if (Array.isArray(parsedData)) {
            quiz = parsedData;
          } else if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
            // Try to extract from known properties
            if (Array.isArray(parsedData.questions)) {
              quiz = parsedData.questions;
            } else {
              // If we can't find an array, throw an error
              throw new Error("Response is not an array of quiz questions");
            }
          } else {
            throw new Error("Response is not a valid JSON object or array");
          }
        } catch (innerError) {
          console.error("Inner parsing error:", innerError);
          throw new Error("Failed to parse response data");
        }
      }
    } catch (parseError) {
      console.error('Failed to parse quiz data:', parseError, content);
      // Create basic quiz questions if parsing fails
      quiz = [
        {
          question: "What is the main topic of this document?",
          options: [
            "The main concepts of the subject",
            "Historical background of the topic",
            "Practical applications of the knowledge",
            "Future directions in the field"
          ],
          answer: "The main concepts of the subject",
          explanation: "The document primarily focuses on explaining the core concepts related to the subject matter."
        },
        {
          question: "Why is this information important?",
          options: [
            "It provides foundational knowledge",
            "It's required for certification",
            "It's purely theoretical",
            "It's controversial in the field"
          ],
          answer: "It provides foundational knowledge",
          explanation: "The information in this document provides essential foundational knowledge for understanding the topic."
        }
      ];
    }
    
    return quiz;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
};
