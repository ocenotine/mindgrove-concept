
import { getOpenRouterApiKey } from '@/utils/openRouterUtils';

interface StreamOptions {
  currentMessage: string;
  previousMessages?: Array<{ role: string; content: string }>;
  documentContext?: string;
  onToken?: (token: string) => void;
}

export const streamAIResponse = async ({
  currentMessage,
  previousMessages = [],
  documentContext = '',
  onToken,
}: StreamOptions): Promise<string> => {
  try {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      throw new Error("OpenRouter API key is not configured");
    }

    let systemPrompt = "You are a helpful AI assistant for a learning platform called MindGrove.";
    
    // If document context is provided, append it to the system prompt
    if (documentContext) {
      systemPrompt += `\n\n${documentContext}`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...previousMessages,
      { role: "user", content: currentMessage },
    ];

    // Send request to OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "MindGrove Learning Platform",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode and process the chunk
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter(line => line.trim() !== "" && line.trim() !== "data: [DONE]");

      for (const line of lines) {
        try {
          if (!line.startsWith("data: ")) continue;
          
          const jsonStr = line.slice(6); // Remove "data: " prefix
          const data = JSON.parse(jsonStr);
          
          if (data.choices && data.choices[0]?.delta?.content) {
            const token = data.choices[0].delta.content;
            fullText += token;
            
            if (onToken) {
              onToken(token);
            }
          }
        } catch (e) {
          console.error("Error parsing SSE chunk:", e);
        }
      }
    }

    return fullText;
  } catch (error) {
    console.error("Error streaming AI response:", error);
    throw error;
  }
};
