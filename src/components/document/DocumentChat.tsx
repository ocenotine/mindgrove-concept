
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Mic, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Typewriter from '@/components/chat/Typewriter';
import { generateDocumentChatResponse, generateGeneralChatResponse } from '@/utils/openRouterUtils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface DocumentChatProps {
  documentText: string;
  documentId: string;
  documentTitle: string;
}

const DocumentChat = ({ documentText, documentId, documentTitle }: DocumentChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingComplete, setTypingComplete] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  // Initialize chat with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: documentTitle ? 
          `👋 Hello! I'm your MindGrove assistant. I can answer questions about "${documentTitle}" or any general academic questions. What would you like to know?` :
          `👋 Hello! I'm your MindGrove assistant. How can I help you with your academic questions today?`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [documentTitle, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingComplete]);

  // Set up speech recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map(result => (result as any)[0])
          .map(result => result.transcript)
          .join('');
        
        setInputMessage(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputMessage.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!speechRecognition) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition.",
      });
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      speechRecognition.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now and your words will appear in the input field.",
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let response;
      
      // If we have document text, try to answer based on it first
      if (documentText && documentText.trim().length > 100) {
        try {
          // Try document-specific response
          response = await generateDocumentChatResponse(documentText, inputMessage);
        } catch (documentError) {
          console.error("Error with document-specific response:", documentError);
          // Fall back to general response
          response = await generateGeneralChatResponse(inputMessage);
        }
      } else {
        // No document or document too short, use general response
        response = await generateGeneralChatResponse(inputMessage);
      }
      
      const botResponse: Message = {
        id: `assistant-${Date.now()}`,
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive"
      });
      
      // Add fallback response
      const errorResponse: Message = {
        id: `assistant-${Date.now()}`,
        content: "I'm sorry, I encountered an issue while processing your question. Please try again or rephrase your question.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTypewriterComplete = (messageId: string) => {
    setTypingComplete(prev => ({
      ...prev,
      [messageId]: true
    }));
  };

  return (
    <div className="document-chat">
      {/* Chat button */}
      <motion.button
        className="fixed bottom-20 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat with AI assistant"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <MessageSquare className="h-5 w-5" />
      </motion.button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-0 right-0 z-50 w-[400px] max-w-[95vw] h-[500px] max-h-[80vh] bg-card rounded-tl-lg shadow-xl flex flex-col border overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div className="bg-primary p-3 text-white flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                <h2 className="font-medium text-sm">MindGrove Assistant</h2>
              </div>
              <Button 
                onClick={toggleChat}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:text-white/80 hover:bg-transparent"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Chat messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 bg-card/30"
              ref={chatContentRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      typingComplete[message.id] ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <Typewriter 
                          text={message.content} 
                          delay={15} 
                          onComplete={() => handleTypewriterComplete(message.id)} 
                          cursor={true}
                        />
                      )
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mb-4 flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex space-x-1">
                      <motion.span 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1, repeatDelay: 0.2 }}
                        className="h-2 w-2 bg-primary/70 rounded-full"
                      />
                      <motion.span 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2, repeatDelay: 0.2 }}
                        className="h-2 w-2 bg-primary/70 rounded-full"
                      />
                      <motion.span 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4, repeatDelay: 0.2 }}
                        className="h-2 w-2 bg-primary/70 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            <div className="p-3 border-t border-border bg-background">
              <div className="flex items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={toggleSpeechRecognition}
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'text-primary animate-pulse' : ''}`} />
                </Button>
                
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 p-2 bg-background border-0 focus:outline-none focus:ring-0"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                
                <Button
                  size="sm"
                  className="ml-2"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentChat;
