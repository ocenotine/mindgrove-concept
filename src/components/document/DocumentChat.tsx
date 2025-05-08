
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { chatWithDocument } from '@/utils/nlpUtils';
import { ChatMessage } from '@/types/chat';
import { TypingIndicator } from '@/components/animations/TypingIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { v4 as uuidv4 } from 'uuid';

interface DocumentChatProps {
  documentId: string;
  documentText: string;
}

const DocumentChat: React.FC<DocumentChatProps> = ({ documentId, documentText }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialPromptShown, setIsInitialPromptShown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  
  // Load existing chat messages when component mounts
  useEffect(() => {
    if (documentId && user) {
      loadChatHistory();
    }
    
    // If we have no messages, suggest some initial prompts
    if (!isInitialPromptShown) {
      setIsInitialPromptShown(true);
      const initialMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Hello! I can help you understand this document better. You can ask me questions like "What are the main topics?", "Explain the key findings", or "Summarize the conclusion".',
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [documentId, user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from Supabase
  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('document_chats')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedMessages: ChatMessage[] = data.map(chat => ({
          id: chat.id,
          role: chat.role as 'user' | 'assistant',
          content: chat.content,
          timestamp: new Date(chat.created_at),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Save message to Supabase
  const saveChatMessage = async (message: ChatMessage) => {
    if (!user) return;
    
    try {
      await supabase.from('document_chats').insert({
        id: message.id,
        document_id: documentId,
        user_id: user.id,
        role: message.role,
        content: message.content,
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Save user message to database
      await saveChatMessage(userMessage);
      
      // Generate AI response
      const response = await chatWithDocument(documentId, documentText, userMessage.content);
      
      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message to database
        await saveChatMessage(assistantMessage);
      } else {
        throw new Error(response.error || 'Failed to generate response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate a response.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Document AI Chat
        </CardTitle>
        <CardDescription>
          Ask questions about this document
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto max-h-[400px] scrollbar-thin pb-0">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div 
                className={`flex gap-3 max-w-[80%] ${
                  msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  msg.role === 'assistant' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-foreground'
                }`}>
                  {msg.role === 'assistant' ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div 
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === 'assistant'
                      ? 'bg-muted/60 border border-border/40'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-3 rounded-lg bg-muted/60 border border-border/40">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !message.trim()}
            onClick={handleSendMessage}
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentChat;
