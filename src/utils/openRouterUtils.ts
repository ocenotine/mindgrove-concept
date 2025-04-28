
import { supabase } from '@/integrations/supabase/client';

// Function to retrieve the API key from local storage or use the default one
export const getOpenRouterApiKey = (): string => {
  return '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';
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

// Function to generate a response for general chat
export const generateGeneralChatResponse = async (message: string): Promise<string> => {
  const apiKey = getOpenRouterApiKey();
  
  try {
    console.log("Generating general chat response");
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
      console.error('OpenRouter API error:', data);
      throw new Error(data.error?.message || 'Failed to generate response');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
};

// Function to generate a response for document chat
export const generateDocumentChatResponse = async (documentText: string, userMessage: string): Promise<string> => {
  const apiKey = getOpenRouterApiKey();
  
  // Truncate document text to prevent token limits
  const truncatedText = documentText.length > 5000 
    ? documentText.substring(0, 5000) + '...' 
    : documentText;
  
  try {
    console.log("Generating document chat response");
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
      console.error('OpenRouter API error:', data);
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
  
  // Process document text to handle larger documents
  const chunkSize = 12000; // Characters per chunk
  let summary = "";
  
  try {
    console.log("Generating document summary");
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
        console.error('OpenRouter API error:', data);
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
          console.error('OpenRouter API error:', data);
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
        console.error('OpenRouter API error:', finalData);
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
  
  // Handle larger documents by focusing on the most important parts
  const maxLength = 10000; // Maximum characters to process
  const processedText = documentText.length > maxLength 
    ? documentText.substring(0, maxLength) + '...' 
    : documentText;
  
  try {
    console.log("Generating flashcards");
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
            content: 'You are a flashcard generation assistant specialized in creating educational study cards. Generate 5-10 high-quality flashcards that cover the most important concepts from the document. Each flashcard should have a clear question on one side and a comprehensive answer on the other.'
          },
          {
            role: 'user',
            content: `Generate 5-10 flashcards (question and answer pairs) from this document: ${processedText}. Format your response as a valid JSON array with "question" and "answer" properties for each flashcard. The response should be valid JSON that can be parsed.`
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
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
      
      if (!Array.isArray(flashcards)) {
        if (flashcards?.flashcards && Array.isArray(flashcards.flashcards)) {
          flashcards = flashcards.flashcards;
        } else if (flashcards?.cards && Array.isArray(flashcards.cards)) {
          flashcards = flashcards.cards;
        } else {
          throw new Error("Response is not an array of flashcards");
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
  const apiKey = getOpenRouterApiKey();
  
  // Handle larger documents by focusing on the most important parts
  const maxLength = 10000; // Maximum characters to process
  const processedText = documentText.length > maxLength 
    ? documentText.substring(0, maxLength) + '...' 
    : documentText;
  
  try {
    console.log("Generating quiz questions");
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
            content: `You are a quiz generation assistant specialized in creating educational multiple-choice questions. Generate ${numQuestions} ${difficulty}-difficulty quiz questions that cover important concepts from the document. Each question should have 4 options with one correct answer and an explanation of why it's correct.`
          },
          {
            role: 'user',
            content: `Generate ${numQuestions} multiple-choice quiz questions from this document: ${processedText}. Format your response as a valid JSON array with "question", "options" (array of 4 choices), "answer" (the correct option text), and "explanation" properties for each question. The response should be valid JSON that can be parsed.`
          }
        ],
        max_tokens: 1200
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
      throw new Error(data.error?.message || 'Failed to generate quiz');
    }
    
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
        quiz = JSON.parse(content);
      }
      
      if (!Array.isArray(quiz)) {
        if (quiz?.questions && Array.isArray(quiz.questions)) {
          quiz = quiz.questions;
        } else {
          throw new Error("Response is not an array of quiz questions");
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
