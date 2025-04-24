
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from "sonner";

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface SavedResponse {
  id: string;
  content: string;
  query: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  savedResponses: SavedResponse[];
  isLoading: boolean;
  sendMessage: (message: string) => void;
  saveResponse: (messageId: string) => void;
  clearChat: () => void;
  deleteSavedResponse: (id: string) => void;
  provideFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock AI response function
  const getAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple response logic - this would be replaced with actual API calls
    if (userMessage.toLowerCase().includes('what is')) {
      return `Based on my research, "${userMessage}" refers to a concept or topic in the field. The current understanding is that it involves several key aspects that researchers have been investigating. Recent studies have shown promising results, though there are still open questions in this area that require further exploration.`;
    }
    
    if (userMessage.toLowerCase().includes('how to')) {
      return `To address "${userMessage}", I recommend following these research-backed steps:\n\n1. Begin by understanding the fundamental principles\n2. Analyze existing approaches in the literature\n3. Apply methodical techniques with appropriate controls\n4. Document your process and results\n5. Compare your findings with established research\n\nRecent publications in this area suggest that approach #3 has been particularly effective.`;
    }
    
    return `Thank you for your research question about "${userMessage}". This is an interesting area of study that has evolved significantly in recent years. Researchers have approached this from multiple angles, with the consensus pointing toward a nuanced understanding that depends on context and specific parameters. Would you like me to explore any particular aspect of this topic in more depth?`;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get AI response
      const responseContent = await getAIResponse(content);
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [getAIResponse]);

  const saveResponse = useCallback((messageId: string) => {
    const aiMessage = messages.find(m => m.id === messageId && m.role === 'assistant');
    if (!aiMessage) return;
    
    // Find the user message that prompted this response
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;
    
    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;
    
    const savedResponse: SavedResponse = {
      id: Date.now().toString(),
      content: aiMessage.content,
      query: userMessage.content,
      timestamp: new Date(),
    };
    
    setSavedResponses(prev => [...prev, savedResponse]);
    toast.success("Response saved successfully");
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    toast.info("Chat cleared");
  }, []);

  const deleteSavedResponse = useCallback((id: string) => {
    setSavedResponses(prev => prev.filter(response => response.id !== id));
    toast.success("Saved response deleted");
  }, []);

  const provideFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    // In a real app, you would send this feedback to your backend
    console.log(`Feedback for message ${messageId}: ${feedback}`);
    toast.success(`Thank you for your feedback!`);
  }, []);

  const value = {
    messages,
    savedResponses,
    isLoading,
    sendMessage,
    saveResponse,
    clearChat,
    deleteSavedResponse,
    provideFeedback,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
