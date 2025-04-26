
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot, ChevronDown, ChevronUp, Sparkles, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Typewriter from '@/components/chat/Typewriter';
import { generateDocumentChatResponse } from '@/utils/openRouterUtils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

const WELCOME_MESSAGE = "👋 Hello! I'm your MindGrove AI assistant. You can ask me anything about your documents, academic concepts, or study strategies. How can I help you today?";

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: WELCOME_MESSAGE,
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingComplete, setTypingComplete] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingComplete]);
  
  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessageText = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Show AI typing indicator
    const typingMessage: Message = {
      id: `ai-typing-${Date.now()}`,
      text: '...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true,
    };
    
    setMessages(prev => [...prev, typingMessage]);
    setIsLoading(true);
    
    try {
      // Generate AI response without document context
      const response = await generateDocumentChatResponse('', userMessageText);
      
      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      // Add error message
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        text: "I'm sorry, I encountered an issue while processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: 'Failed to generate a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleTypewriterComplete = (messageId: string) => {
    setTypingComplete(prev => ({
      ...prev,
      [messageId]: true
    }));
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        text: WELCOME_MESSAGE,
        sender: 'ai',
        timestamp: new Date(),
      }
    ]);
    
    toast({
      title: 'Chat cleared',
      description: 'All messages have been removed.',
    });
  };
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">AI Assistant</h1>
                <p className="text-muted-foreground">Chat with our AI to help with your studies</p>
              </div>
              
              <Button variant="ghost" onClick={clearChat}>Clear Chat</Button>
            </div>
            
            <Alert className="bg-primary/10 border-primary/20">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Powered by AI</AlertTitle>
              <AlertDescription>
                This chat uses advanced AI to answer your questions. While helpful, remember to verify important information.
              </AlertDescription>
            </Alert>
            
            <Card className="flex flex-col h-[600px]">
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start max-w-[80%]">
                        {message.sender === 'ai' && (
                          <div className="mr-2 mt-1">
                            <Avatar className="h-8 w-8 bg-primary">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : message.isTyping
                              ? 'bg-muted'
                              : 'bg-muted'
                          }`}
                        >
                          {message.isTyping ? (
                            <div className="flex space-x-1">
                              <motion.span
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="h-2 w-2 bg-foreground/60 rounded-full"
                              />
                              <motion.span
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                                className="h-2 w-2 bg-foreground/60 rounded-full"
                              />
                              <motion.span
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                                className="h-2 w-2 bg-foreground/60 rounded-full"
                              />
                            </div>
                          ) : message.sender === 'ai' && !typingComplete[message.id] ? (
                            <Typewriter
                              text={message.text}
                              delay={20}
                              onComplete={() => handleTypewriterComplete(message.id)}
                              cursor={true}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap">{message.text}</div>
                          )}
                          
                          <div className="text-xs opacity-70 mt-1 text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        {message.sender === 'user' && (
                          <div className="ml-2 mt-1">
                            <Avatar className="h-8 w-8 bg-primary/20">
                              <AvatarFallback className="bg-primary/20 text-primary">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="p-4 border-t">
                <div className="flex w-full gap-2">
                  <Textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[40px]"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputMessage.trim()} 
                    size="icon"
                    className="h-[40px]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Press Enter to send, Shift+Enter for a new line
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default AIChat;
