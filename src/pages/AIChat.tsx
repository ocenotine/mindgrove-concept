
import React, { useState, useEffect } from 'react';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, FileText, Code, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { generateDocumentChatResponse } from '@/utils/openRouterUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'code' | 'document';
  codeLanguage?: string;
  documentId?: string;
  documentTitle?: string;
}

interface DocumentPreview {
  id: string;
  title: string;
  extractedText: string | null;
  createdAt: string;
}

const AIChat = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentPreview | null>(null);
  const [showDocumentPanel, setShowDocumentPanel] = useState(true);
  const navigate = useNavigate();

  // Fetch user's documents
  const { data: documents, isLoading: loadingDocuments } = useQuery({
    queryKey: ['userDocuments'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, extracted_text, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      return data as DocumentPreview[];
    }
  });

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: "👋 Hello! I'm your MindGrove AI assistant. I can help you understand your documents, answer questions, and assist with your research. Select a document from the sidebar or ask me a general question!",
          sender: 'ai',
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    // Add document context if a document is selected
    if (selectedDocument) {
      userMessage.documentId = selectedDocument.id;
      userMessage.documentTitle = selectedDocument.title;
      userMessage.type = 'document';
    }
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      let response: string;
      
      if (selectedDocument && selectedDocument.extractedText) {
        // Document-specific chat
        response = await generateDocumentChatResponse(
          selectedDocument.extractedText,
          input
        );
      } else {
        // General chat
        response = await generateDocumentChatResponse(
          "", // No document context
          input
        );
      }
      
      // Look for code blocks in the response
      const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
      let match = codeBlockRegex.exec(response);
      
      if (match) {
        // We have a code block
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: response,
          sender: 'ai',
          timestamp: new Date(),
          type: 'code',
          codeLanguage: match[1] || 'plaintext'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Regular text response
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: response,
          sender: 'ai',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Error message
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        text: "I'm sorry, but I encountered an error processing your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectDocument = (doc: DocumentPreview) => {
    setSelectedDocument(doc);
    
    // Add system message about document selection
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      text: `📄 Now chatting about "${doc.title}". You can ask questions specific to this document.`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const clearSelectedDocument = () => {
    setSelectedDocument(null);
    
    // Add system message about clearing document
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      text: "You're now in general chat mode. You can ask me about anything or select another document.",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const toggleDocumentPanel = () => {
    setShowDocumentPanel(!showDocumentPanel);
  };

  return (
    <PageTransition>
      <div className="h-full flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <MessageSquare className="h-6 w-6 mr-2 text-primary" />
                AI Chat Assistant
              </h1>
              <p className="text-muted-foreground">
                Chat with your documents or ask general questions
              </p>
            </div>
            
            <div className="flex items-center">
              {selectedDocument && (
                <Badge variant="outline" className="flex items-center gap-1.5 mr-4 py-1.5">
                  <FileText className="h-3.5 w-3.5" /> 
                  {selectedDocument.title.length > 20 
                    ? selectedDocument.title.substring(0, 20) + '...' 
                    : selectedDocument.title}
                  <button className="ml-1" onClick={clearSelectedDocument}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="md:hidden"
                onClick={toggleDocumentPanel}
              >
                {showDocumentPanel ? 'Hide Documents' : 'Show Documents'}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-1 gap-4 overflow-hidden">
            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 border rounded-lg bg-card/50">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex gap-2 max-w-[85%]">
                        {message.sender === 'ai' && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                            <AvatarImage src="/mindgrove.png" />
                          </Avatar>
                        )}
                        
                        <div>
                          {message.type === 'document' && message.documentTitle && (
                            <div className="text-xs text-muted-foreground mb-1 flex items-center">
                              <FileText className="h-3 w-3 mr-1" /> 
                              About: {message.documentTitle}
                            </div>
                          )}
                          
                          <div 
                            className={`rounded-lg p-4 ${
                              message.sender === 'user' 
                                ? 'bg-primary text-primary-foreground ml-auto' 
                                : 'bg-muted border'
                            }`}
                          >
                            {message.type === 'code' ? (
                              <div className="overflow-auto">
                                <div className="text-xs text-muted-foreground mb-2">
                                  <Code className="h-3 w-3 inline mr-1" /> 
                                  {message.codeLanguage || 'Code'}
                                </div>
                                <pre className="p-2 bg-black/10 rounded-md overflow-x-auto">
                                  <code>{message.text.replace(/```[a-zA-Z]*\n|```/g, '')}</code>
                                </pre>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap">{message.text}</div>
                            )}
                            
                            <div className="text-xs opacity-70 mt-2 text-right">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        
                        {message.sender === 'user' && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                            <AvatarImage src={user?.avatarUrl || ''} />
                          </Avatar>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-2 max-w-[85%]">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                          <AvatarImage src="/mindgrove.png" />
                        </Avatar>
                        
                        <div className="rounded-lg p-4 bg-muted border">
                          <div className="flex items-center gap-1.5">
                            <div className="flex space-x-1 items-center">
                              <motion.div 
                                animate={{ y: [0, -4, 0] }} 
                                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }}
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                              />
                              <motion.div 
                                animate={{ y: [0, -4, 0] }} 
                                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                              />
                              <motion.div 
                                animate={{ y: [0, -4, 0] }} 
                                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.3, delay: 0.4 }}
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isTyping}
                >
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Document panel - Hidden on mobile unless toggled */}
            <AnimatePresence>
              {showDocumentPanel && (
                <motion.div 
                  className="w-[300px] hidden md:block lg:flex-none"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 300 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 h-full">
                    <h3 className="font-medium text-lg mb-4 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      Your Documents
                    </h3>
                    
                    {loadingDocuments ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : documents && documents.length > 0 ? (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                              selectedDocument?.id === doc.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => selectDocument(doc)}
                          >
                            <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No documents found</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => navigate('/document/upload')}
                        >
                          Upload Document
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              Powered by MindGrove AI · <Button variant="link" size="sm" className="p-0 h-auto">Report Issues</Button>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AIChat;

// Helper components
const X = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
