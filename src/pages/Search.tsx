
import React, { useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

const Search: React.FC = () => {
  const { messages, isLoading, sendMessage, saveResponse, clearChat, provideFeedback } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2">Research Assistant</h1>
            <p className="text-muted-foreground">
              Ask me any research question, and I'll provide you with an insightful answer.
            </p>
          </div>
        </div>
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold mb-4">How can I help with your research today?</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Try asking questions like:</p>
                <div className="bg-muted rounded-md p-3 cursor-pointer hover:bg-muted/80" 
                    onClick={() => sendMessage("What is the current understanding of dark matter?")}>
                  "What is the current understanding of dark matter?"
                </div>
                <div className="bg-muted rounded-md p-3 cursor-pointer hover:bg-muted/80" 
                    onClick={() => sendMessage("How do neural networks learn patterns in data?")}>
                  "How do neural networks learn patterns in data?"
                </div>
                <div className="bg-muted rounded-md p-3 cursor-pointer hover:bg-muted/80" 
                    onClick={() => sendMessage("What are the key factors in climate change?")}>
                  "What are the key factors in climate change?"
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map(message => (
              <ChatMessage 
                key={message.id}
                role={message.role}
                content={message.content}
                onSave={() => saveResponse(message.id)}
                onFeedback={(feedback) => provideFeedback(message.id, feedback)}
              />
            ))}
            {isLoading && (
              <ChatMessage role="assistant" content="" isLoading={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="sticky bottom-0 bg-background z-10">
        {messages.length > 0 && (
          <div className="container max-w-4xl flex justify-end py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <Eraser size={14} className="mr-1" /> Clear chat
            </Button>
          </div>
        )}
        
        <ChatInput onSubmit={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Search;
