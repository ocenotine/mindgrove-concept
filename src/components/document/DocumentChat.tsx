
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Send, Bot, User, MessagesSquare } from 'lucide-react';
import { chatWithDocument } from '@/utils/nlpUtils';
import { toast } from '@/components/ui/use-toast';
import { getOpenRouterApiKey } from '@/utils/openRouterUtils';
import { TypingIndicator } from '@/components/animations/TypingIndicator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DocumentChatProps {
  documentId: string;
  documentText: string;
}

const DocumentChat: React.FC<DocumentChatProps> = ({ documentId, documentText }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Check if API key exists
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenRouter API key to use the chat feature.",
        variant: "destructive"
      });
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsLoading(true);
    try {
      // Call API to get response
      const response = await chatWithDocument(documentId, documentText, userMessage);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to generate response");
      }
      
      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      console.error("Error in document chat:", error);
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to generate a response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="h-5 w-5 text-primary" />
          Chat with Document
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto mb-2">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ask questions about this document</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                    }
                    rounded-lg px-4 py-2 max-w-[75%] break-words
                  `}
                >
                  <div className="flex items-center mb-1">
                    {message.role === 'user' ? (
                      <>
                        <span className="font-medium">You</span>
                        <User className="h-3 w-3 ml-1" />
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3 mr-1" />
                        <span className="font-medium">AI Assistant</span>
                      </>
                    )}
                  </div>
                  <div className="whitespace-pre-line">{message.content}</div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <Bot className="h-3 w-3 mr-1" />
                  <span className="font-medium">AI Assistant</span>
                </div>
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Ask questions about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentChat;
